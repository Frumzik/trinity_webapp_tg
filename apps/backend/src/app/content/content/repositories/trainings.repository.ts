import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Training } from '../models';
import { TrainingEntity } from '../entities';

@Injectable()
export class TrainingsRepository {
  constructor(
    @InjectModel(Training.name)
    private readonly trainingModel: Model<Training>
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

  // Получение всех тренингов
  async findAll(filter: FilterQuery<Training> = {}): Promise<TrainingEntity[]> {
    const trainings = await this.trainingModel.find(filter).lean().exec();

    return trainings.map((training) => new TrainingEntity(training));
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

  // Удаление тренинга
  async delete(
    condition: FilterQuery<Training>
  ): Promise<{ deleted: boolean }> {
    const result = await this.trainingModel.deleteOne(condition).exec();

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
