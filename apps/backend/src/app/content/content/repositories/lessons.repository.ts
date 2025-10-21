import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Lesson } from '../models';
import { LessonEntity } from '../entities';

@Injectable()
export class LessonsRepository {
  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<Lesson>
  ) {}

  // Создание урока
  async create(lessonEntity: LessonEntity): Promise<LessonEntity> {
    const created = await new this.lessonModel(lessonEntity).save();
    return new LessonEntity(created.toObject());
  }

  // Поиск урока
  async find(condition: FilterQuery<Lesson>): Promise<LessonEntity | null> {
    const lesson = await this.lessonModel.findOne(condition).exec();

    return lesson ? new LessonEntity(lesson.toObject()) : null;
  }

  // Обновление урока
  async update(lessonEntity: LessonEntity): Promise<LessonEntity> {
    if (!lessonEntity._id) {
      throw new Error('Урок не имеет _id');
    }

    const updated = await this.lessonModel
      .findOneAndUpdate(
        { _id: lessonEntity._id },
        { $set: lessonEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Урок с id ${lessonEntity._id} не найден`);
    }

    return new LessonEntity(updated.toObject());
  }

  // Удаление урока
  async delete(condition: FilterQuery<Lesson>): Promise<{deleted: boolean}> {
    const result = await this.lessonModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }
}
