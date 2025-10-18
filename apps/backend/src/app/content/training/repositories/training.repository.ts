import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Training } from '../models';
import { TrainingEntity } from '../entities';
import { LessonRepository } from './lesson.repository';
import { ILesson, ITraining } from '@trinity/shared';

@Injectable()
export class TrainingRepository {
  constructor(
    @InjectModel(Training.name)
    private readonly trainingModel: Model<Training>,
    @Inject(forwardRef(() => LessonRepository))
    private readonly lessonRepository: LessonRepository
  ) {}

  // Создание тренинга
  async createTraining(
    trainingEntity: TrainingEntity
  ): Promise<TrainingEntity> {
    const newTraining = new this.trainingModel(trainingEntity);
    const saved = await newTraining.save();

    return new TrainingEntity(saved);
  }

  // Поиск тренинга
  async findTraining(
    condition: FilterQuery<Training>
  ): Promise<TrainingEntity | null> {
    const training = await this.trainingModel.findOne(condition).exec();
    return training ? new TrainingEntity(training) : null;
  }

  // Привязка parent ↔ child
  async bindParentAndChild(
    parentId: number | null,
    childId: number | null
  ): Promise<{ parent?: TrainingEntity; child?: TrainingEntity }> {
    if (!parentId && !childId) {
      throw new Error('Необходимо указать хотя бы один идентификатор');
    }

    // 🔹 Универсальная функция для установки корневого состояния
    const makeRoot = async (trainingId: number): Promise<TrainingEntity> => {
      const doc = await this.trainingModel.findOne({ trainingId });
      if (!doc) throw new Error('Тренинг не найден');

      await this.trainingModel.updateOne(
        { _id: doc._id },
        { $set: { parent: null, parentId: null, isRoot: true } }
      );

      const updated = await this.trainingModel.findById(doc._id).exec();
      if (!updated) throw new Error('Ошибка при обновлении тренинга');

      return new TrainingEntity(updated);
    };

    // 🧩 Если только один id передан → просто делаем корневым
    if (parentId && !childId) return { parent: await makeRoot(parentId) };
    if (childId && !parentId) return { child: await makeRoot(childId) };

    // 🧩 Если оба указаны → связываем
    const [parent, child] = await Promise.all([
      this.trainingModel.findOne({ trainingId: parentId }),
      this.trainingModel.findOne({ trainingId: childId }),
    ]);

    if (!parent || !child) {
      throw new Error('Родитель или дочерний тренинг не найден');
    }

    await Promise.all([
      // Обновляем родителя
      this.trainingModel.updateOne(
        { _id: parent._id },
        {
          $addToSet: {
            childrens: child._id,
            childrensId: child.trainingId,
          },
        }
      ),
      // Обновляем ребёнка
      this.trainingModel.updateOne(
        { _id: child._id },
        {
          $set: {
            parent: parent._id,
            parentId: parent.trainingId,
            isRoot: false,
          },
        }
      ),
    ]);

    const [updatedParent, updatedChild] = await Promise.all([
      this.trainingModel.findById(parent._id).exec(),
      this.trainingModel.findById(child._id).exec(),
    ]);

    if (!updatedParent || !updatedChild) {
      throw new Error('Ошибка при обновлении связей тренинга');
    }

    return {
      parent: new TrainingEntity(updatedParent),
      child: new TrainingEntity(updatedChild),
    };
  }

  // ✅ Привязка урока к тренингу
  async bindLesson(trainingId: number, lessonId: number): Promise<ITraining> {
    const [training, lesson] = await Promise.all([
      this.findTraining({ trainingId }),
      this.lessonRepository.findLesson({ lessonId }),
    ]);

    if (!training) {
      throw new NotFoundException(`Тренинг с id=${trainingId} не найден`);
    }
    if (!lesson) {
      throw new NotFoundException(`Урок с id=${lessonId} не найден`);
    }

    // 1️⃣ Добавляем урок в тренинг
    await this.trainingModel.updateOne(
      { _id: training._id },
      {
        $addToSet: {
          lessons: lesson._id,
          lessonsId: lesson.lessonId,
        },
      }
    );

    // 3️⃣ Возвращаем обновлённый тренинг
    const updated = await this.findTraining({ _id: training._id });

    if (!updated) {
      throw new NotFoundException(
        `Тренинг с id=${trainingId} не найден после обновления`
      );
    }

    return new TrainingEntity(updated);
  }

  async getFullStructure(trainingId: number): Promise<ITraining> {
    // 1️⃣ Находим тренинг и всех потомков
    const result = await this.trainingModel.aggregate([
      { $match: { trainingId } },

      {
        $graphLookup: {
          from: 'trainings',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parent',
          as: 'descendants',
        },
      },

      // 2️⃣ Подтягиваем уроки всех тренингов
      {
        $lookup: {
          from: 'lessons',
          localField: 'lessons',
          foreignField: '_id',
          as: 'lessons',
        },
      },
    ]);

    if (!result.length) {
      throw new NotFoundException(`Тренинг с id=${trainingId} не найден`);
    }

    const root = result[0];
    const allTrainings = [root, ...(root.descendants || [])];

    // 3️⃣ Подгружаем уроки для всех потомков вручную
    const childLessons = await this.trainingModel.aggregate([
      {
        $match: { _id: { $in: allTrainings.map((t) => t._id) } },
      },
      {
        $lookup: {
          from: 'lessons',
          localField: 'lessons',
          foreignField: '_id',
          as: 'lessons',
        },
      },
      {
        $project: {
          _id: 1,
          lessons: 1,
        },
      },
    ]);

    const lessonsMap = new Map<string, ILesson[]>(
      childLessons.map((c) => [String(c._id), c.lessons])
    );

    // 4️⃣ Рекурсивно строим дерево
    const buildTree = (parent: ITraining): ITraining => {
      const children = allTrainings.filter(
        (t) => String(t.parent) === String(parent._id)
      );

      return {
        _id: parent._id,
        trainingId: parent.trainingId,
        title: parent.title,
        description: parent.description || '',
        lessons: lessonsMap.get(String(parent._id)) || [],
        childrens: children.map(buildTree),
        parent: parent.parent || null,
        lessonsId: parent.lessonsId || [],
        childrensId: parent.childrensId || [],
        parentId: parent.parentId || null,
        isRoot: parent.isRoot ?? false,
      };
    };

    return buildTree(root);
  }
}
