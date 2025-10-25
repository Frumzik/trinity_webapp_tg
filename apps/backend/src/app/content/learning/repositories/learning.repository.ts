import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Learning } from '../models';
import { LearningEntity } from '../entities';

@Injectable()
export class LearningsRepository {
  constructor(
    @InjectModel(Learning.name)
    private readonly learningModel: Model<Learning>
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

  // Удаление
  async delete(
    condition: FilterQuery<Learning>
  ): Promise<{ deleted: boolean }> {
    const result = await this.learningModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }
}
