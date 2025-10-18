import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Training } from '../models';
import { TrainingEntity } from '../entities';

@Injectable()
export class TrainingRepository {
  constructor(
    @InjectModel(Training.name)
    private readonly trainingModel: Model<Training>
  ) {}

  // Создание тренинга
  async createTraining(
    trainingEntity: TrainingEntity
  ): Promise<TrainingEntity> {
    const newTraining = new this.trainingModel(trainingEntity);
    const saved = await newTraining.save();

    return new TrainingEntity(saved);
  }

  // Поиск подписки
  async findTraining(
    condition: FilterQuery<Training>
  ): Promise<TrainingEntity | null> {
    const training = await this.trainingModel.findOne(condition).exec();
    return training ? new TrainingEntity(training) : null;
  }
}
