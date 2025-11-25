/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Learning } from '../models';
import { LearningEntity } from '../entities';
import { Training } from '../../content/models';
import { TrainingEntity } from '../../content/entities';
import {
  ILearning,
  ILesson,
  ITraining,
  LearningAccessStatus,
  LearningProgressStatus,
  TrainingTag,
} from '@trinity/shared';

@Injectable()
export class LearningsRepository {
  constructor(
    @InjectModel(Learning.name)
    private readonly learningModel: Model<Learning>,
    @InjectModel(Training.name)
    private readonly trainingModel: Model<Training>
  ) {}

  // Создание
  async create(learningEntity: LearningEntity): Promise<LearningEntity> {
    const created = await new this.learningModel(learningEntity).save();
    return new LearningEntity(created.toObject());
  }

  // Поиск
  async find(condition: FilterQuery<Learning>): Promise<LearningEntity | null> {
    const learning = await this.learningModel.findOne(condition).exec();

    return learning ? new LearningEntity(learning.toObject()) : null;
  }

  // Получение всех тренингов
  async findAll(filter: FilterQuery<Learning> = {}): Promise<LearningEntity[]> {
    const learning = await this.learningModel.find(filter).lean().exec();

    return learning.map((learning) => new LearningEntity(learning));
  }

  // Обновление
  async update(learningEntity: LearningEntity): Promise<LearningEntity> {
    if (!learningEntity._id) {
      throw new Error('Урок не имеет _id');
    }

    const updated = await this.learningModel
      .findOneAndUpdate(
        { _id: learningEntity._id },
        { $set: learningEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Learning с id ${learningEntity._id} не найден`
      );
    }

    return new LearningEntity(updated.toObject());
  }

  /**
   * Удаляет прогресс:
   * - если указан trainingId → по этому тренингу и всем его дочерним, для всех пользователей
   * - если указан userId → весь прогресс пользователя (по всем тренингам)
   */
  async delete(options: {
    trainingId?: number;
    userId?: number;
  }): Promise<{ deletedCount: number }> {
    const { trainingId, userId } = options;

    // 1️⃣ Если указан только userId — удаляем все его прогрессы
    if (userId && !trainingId) {
      const result = await this.learningModel.deleteMany({ userId });
      return { deletedCount: result.deletedCount ?? 0 };
    }

    // 2️⃣ Если указан trainingId — удаляем прогресс по тренингу (и всем дочерним)
    if (trainingId) {
      const allTrainingIds = new Set<number>([trainingId]);

      // рекурсивно собираем все дочерние тренинги
      const collectChildren = async (ids: number[]) => {
        const children = await this.trainingModel
          .find({ parentId: { $in: ids } })
          .select('trainingId')
          .lean();

        const childIds = children.map((t) => t.trainingId);

        for (const id of childIds) allTrainingIds.add(id);

        if (childIds.length > 0) {
          await collectChildren(childIds);
        }
      };

      await collectChildren([trainingId]);

      // ✅ Без any, с типизацией FilterQuery
      const filter: FilterQuery<Learning> = {
        trainingId: { $in: Array.from(allTrainingIds) },
      };

      // если указан userId — ограничиваем удаление конкретным пользователем
      if (userId) {
        filter.userId = userId;
      }

      const result = await this.learningModel.deleteMany(filter);

      return { deletedCount: result.deletedCount ?? 0 };
    }

    // если не передано ни userId, ни trainingId
    throw new Error(
      'Необходимо указать либо trainingId, либо userId для удаления прогресса.'
    );
  }

  async getLearningTree(
    condition?: FilterQuery<Learning>,
    depth?: number
  ): Promise<TrainingEntity[] | TrainingEntity | null> {
    // Загружаем все тренинги с уроками
    const allTrainings = await this.trainingModel
      .find()
      .populate('lessons')
      .lean()
      .exec();

    // Загружаем все learning-записи для пользователя
    const learnings = await this.learningModel
      .find({ userId: condition?.userId })
      .lean()
      .exec();

    // Карта для быстрого доступа по trainingId
    const learningMap = new Map<number, ILearning>(
      learnings.map((l) => [l.trainingId, l as unknown as ILearning])
    );

    // Type guards
    const filterLessons = (lessons: (Types.ObjectId | ILesson)[]): ILesson[] =>
      lessons.filter(
        (l): l is ILesson =>
          typeof l !== 'string' &&
          typeof (l as ILesson).lessonId !== 'undefined'
      );

    const filterTrainings = (
      trainings: (Types.ObjectId | ITraining)[]
    ): ITraining[] =>
      trainings.filter(
        (t): t is ITraining =>
          typeof t !== 'string' &&
          typeof (t as ITraining).trainingId !== 'undefined'
      );

    // Рекурсивная сборка дерева с расчётом прогресса
    const buildTree = (training: ITraining, currentDepth = 0): ITraining => {
      const learning = learningMap.get(training.trainingId);

      // Статус доступа
      training.accessStatus =
        learning?.accessStatus ?? LearningAccessStatus.LOCKED;

      // Фильтруем уроки
      const lessons = filterLessons(training.lessons ?? []);

      // Применяем статусы к урокам
      const lessonsWithStatus = lessons.map((lesson) => {
        const lessonLearning = learning?.lessons?.find(
          (l) => l.lessonId === lesson.lessonId
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { content: _omit, ...lessonWithoutContent } = lesson;

        return {
          ...lessonWithoutContent,
          accessStatus:
            lessonLearning?.accessStatus ?? LearningAccessStatus.LOCKED,
          progressStatus:
            lessonLearning?.progressStatus ??
            LearningProgressStatus.NOT_STARTED,
        };
      });

      training.lessons = lessonsWithStatus;

      // Дочерние тренинги
      const childrenTrainings = filterTrainings(
        allTrainings.filter((t) => t.parentId === training.trainingId)
      ).map((child) => buildTree(child, currentDepth + 1));

      // Ограничение глубины
      if (depth !== undefined && currentDepth + 1 >= depth) {
        // lessons и childrens на глубине > depth заменяем ObjectId
        training.lessons = training.lessons.map((l) =>
          typeof l === 'object' && 'lessonId' in l ? l._id! : l
        ) as Types.ObjectId[];

        training.childrens = childrenTrainings.map((c) =>
          typeof c === 'object' && 'trainingId' in c ? c._id! : c
        ) as Types.ObjectId[];
      } else {
        training.childrens = childrenTrainings;
      }

      // --- Расчёт прогресса ---
      let progressTotal = 0;
      let progressCompleted = 0;

      if (training.tag === TrainingTag.STAGES_SPIRIT) {
        // stages_spirit: суммируем прогресс всех вложенных тренингов
        for (const child of childrenTrainings) {
          progressTotal += child.progressTotal ?? 0;
          progressCompleted += child.progressCompleted ?? 0;
        }
      } else {
        // Считаем текущие уроки
        progressTotal += lessonsWithStatus.length;
        progressCompleted += lessonsWithStatus.filter(
          (l) => l.progressStatus === LearningProgressStatus.COMPLETED
        ).length;

        // Дочерние тренинги (не stages_spirit)
        for (const child of childrenTrainings) {
          if (child.tag === TrainingTag.STAGES_SPIRIT) {
            progressTotal += child.progressTotal ?? 0;
            progressCompleted += child.progressCompleted ?? 0;
          } else {
            progressTotal += 1;
            if (child.progressStatus === LearningProgressStatus.COMPLETED) {
              progressCompleted += 1;
            }
          }
        }
      }

      training.progressTotal = progressTotal;
      training.progressCompleted = progressCompleted;
      training.progressPercent =
        progressTotal > 0
          ? Math.round((progressCompleted / progressTotal) * 100)
          : 0;

      // Статус прогресса
      const hasInProgress =
        lessonsWithStatus.some(
          (l) => l.progressStatus === LearningProgressStatus.IN_PROGRESS
        ) ||
        childrenTrainings.some(
          (c) => c.progressStatus === LearningProgressStatus.IN_PROGRESS
        );

      const allCompleted =
        progressTotal > 0 && progressCompleted === progressTotal;

      let newProgressStatus = LearningProgressStatus.NOT_STARTED;
      if (hasInProgress || (progressCompleted > 0 && !allCompleted)) {
        newProgressStatus = LearningProgressStatus.IN_PROGRESS;
      } else if (allCompleted) {
        newProgressStatus = LearningProgressStatus.COMPLETED;
      }

      training.progressStatus = newProgressStatus;

      return training;
    };

    // --- Если указан конкретный trainingId ---
    if (condition?.trainingId) {
      const root = allTrainings.find(
        (t) => t.trainingId === condition.trainingId
      );
      if (!root) return null;
      return new TrainingEntity(buildTree(root));
    }

    // --- Иначе возвращаем все корневые тренинги ---
    const roots = allTrainings.filter((t) => !t.parentId);
    return roots.map((r) => new TrainingEntity(buildTree(r)));
  }

  async getCurrentStage(userId: number) {
    const [learning] = await this.learningModel.aggregate([
      { $match: { userId, accessStatus: 'available' } },
      {
        $lookup: {
          from: 'trainings', // имя коллекции training
          localField: 'training',
          foreignField: '_id',
          as: 'training',
        },
      },
      { $unwind: '$training' },
      // Фильтруем только те тренинги, у которых есть stage и stageLevel
      {
        $match: {
          'training.stage': { $exists: true, $ne: null },
          'training.stageLevel': { $exists: true, $ne: null },
        },
      },
      {
        $sort: {
          'training.stageLevel': -1,
          'training.stage': -1,
        },
      },
      { $limit: 1 },
      {
        $project: {
          accessStatus: 1,
          progressStatus: 1,
          training: {
            stage: 1,
            stageLevel: 1,
            trainingId: 1,
            title: 1,
          },
        },
      },
    ]);

    if (!learning || !learning.training) return null;

    return new TrainingEntity({
      ...learning.training, // данные тренинга
      accessStatus: learning.accessStatus,
      progressStatus: learning.progressStatus,
    });
  }
}
