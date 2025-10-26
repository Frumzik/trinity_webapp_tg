import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Lesson, Training } from '../models';
import { LessonEntity } from '../entities';

@Injectable()
export class LessonsRepository {
  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<Lesson>,

    @InjectModel(Training.name)
    private readonly trainingModel: Model<Training>
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

  // ✅ Удаление урока + очистка в Training
  async delete(condition: FilterQuery<Lesson>): Promise<{ deleted: boolean }> {
    const lesson = await this.lessonModel.findOne(condition).exec();
    if (!lesson) return { deleted: false };

    const result = await this.lessonModel.deleteOne({ _id: lesson._id }).exec();

    // ⬇️ Удаляем ссылку на урок во всех тренингах
    await this.trainingModel.updateMany(
      {
        $or: [{ lessons: lesson._id }, { lessonsId: lesson.lessonId }],
      },
      {
        $pull: {
          lessons: lesson._id,
          lessonsId: lesson.lessonId,
        },
      }
    );

    return { deleted: result.deletedCount !== 0 };
  }
}
