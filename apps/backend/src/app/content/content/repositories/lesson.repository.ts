import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Lesson } from '../models';
import { LessonEntity } from '../entities';
import { TrainingRepository } from './training.repository';

@Injectable()
export class LessonRepository {
  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<Lesson>,
    @Inject(forwardRef(() => TrainingRepository))
    private readonly trainingRepository: TrainingRepository
  ) {}

  async createLesson(lessonEntity: LessonEntity): Promise<LessonEntity> {
    const created = await new this.lessonModel(lessonEntity).save();
    return new LessonEntity(created);
  }

  async findLesson(
    condition: FilterQuery<Lesson>
  ): Promise<LessonEntity | null> {
    const lesson = await this.lessonModel.findOne(condition).exec();
    return lesson ? new LessonEntity(lesson) : null;
  }

  // ✅ Привязка урока к тренингу или отвязка (если parentId = null)
  async bindTraining(
    lessonId: number,
    parentId: number
  ): Promise<LessonEntity> {
    const lesson = await this.lessonModel.findOne({ lessonId });
    if (!lesson) throw new Error('Урок не найден');

    // Находим тренинг
    const parent = await this.trainingRepository.findTraining({
      trainingId: parentId,
    });
    if (!parent) throw new Error('Тренинг не найден');

    // Привязываем урок к тренингу
    await this.lessonModel.updateOne(
      { _id: lesson._id },
      {
        $set: {
          parent: parent._id,
          parentId: parent.trainingId,
        },
      }
    );

    const updated = await this.lessonModel.findById(lesson._id).exec();
    if (!updated) throw new Error('Ошибка при обновлении урока');

    return new LessonEntity(updated);
  }
}
