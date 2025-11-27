import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Lesson, Training } from '../models';
import { TrainingEntity } from '../entities';
import { GetListOptions } from '@trinity/shared';

@Injectable()
export class TrainingsRepository {
  constructor(
    @InjectModel(Training.name)
    private readonly trainingModel: Model<Training>,

    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<Lesson>
  ) {}

  // Создание тренинга
  async create(trainingEntity: TrainingEntity): Promise<TrainingEntity> {
    const newTraining = new this.trainingModel(trainingEntity);
    const saved = await newTraining.save();

    return new TrainingEntity(saved.toObject());
  }

  // Поиск тренинга
  async find(condition: FilterQuery<Training>): Promise<TrainingEntity | null> {
    const training = await this.trainingModel.findOne(condition).exec();

    return training ? new TrainingEntity(training.toObject()) : null;
  }

  // Поиск уроков
  async findAll(options?: GetListOptions<Training>): Promise<TrainingEntity[]> {
    const {
      skip = 0,
      limit = 0,
      sort = {},
      filter = {},
      populate = [],
    } = options || {};

    const trainings = await this.trainingModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate.map((path) => ({ path })))
      .lean()
      .exec();

    return trainings.map((u) => new TrainingEntity(u));
  }

  // Подсчет уроков по условию
  async count(filter: FilterQuery<Training> = {}): Promise<number> {
    return await this.lessonModel.countDocuments(filter).exec();
  }

  // Обонлвение тренинга
  async update(trainingEntity: TrainingEntity): Promise<TrainingEntity> {
    if (!trainingEntity._id) {
      throw new Error('Тренинг не имеет _id');
    }

    const updated = await this.trainingModel
      .findOneAndUpdate(
        { _id: trainingEntity._id },
        { $set: trainingEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Тренинг с id ${trainingEntity._id} не найден`
      );
    }

    return new TrainingEntity(updated.toObject());
  }

  // ✅ Рекурсивное удаление тренинга и его контента
  async delete(
    condition: FilterQuery<Training>
  ): Promise<{ deleted: boolean }> {
    const training = await this.trainingModel.findOne(condition).exec();

    if (!training) {
      throw new NotFoundException('Тренинг не найден');
    }

    // --- 1. Удаляем ссылки из родителя ---
    if (training.parent) {
      await this.trainingModel
        .updateOne(
          { _id: training.parent },
          {
            $pull: {
              childrens: training._id,
              childrensId: training.trainingId,
            },
          }
        )
        .exec();
    }

    // --- 2. Удаляем вложенные тренинги рекурсивно ---
    if (training.childrens?.length) {
      for (const childId of training.childrens as Types.ObjectId[]) {
        await this.delete({ _id: childId });
      }
    }

    // --- 3. Удаляем все уроки тренинга ---
    if (training.lessons?.length) {
      await this.lessonModel
        .deleteMany({
          _id: { $in: training.lessons },
        })
        .exec();
    }

    // --- 4. Удаляем сам тренинг ---
    const result = await this.trainingModel
      .deleteOne({ _id: training._id })
      .exec();

    return { deleted: result.deletedCount !== 0 };
  }

  // Получение соседей (родителя, детей и уроков)
  async populate(
    condition: FilterQuery<Training>
  ): Promise<TrainingEntity | null> {
    // Находим тренинг и сразу подтягиваем родителя, детей и уроки
    const training = await this.trainingModel
      .findOne(condition)
      .populate([
        {
          path: 'lessons', // подтянуть уроки тренинга
        },
        {
          path: 'childrens', // подтянуть дочерние тренинги
        },
        {
          path: 'parent', // подтянуть родительский тренинг
        },
      ])
      .lean()
      .exec();

    return training ? new TrainingEntity(training) : null;
  }
}
