import {
  TypeContentAccess,
  ILesson,
  ILessonContent,
  ILessonTextContent,
  ITraining,
  LearningAccessStatus,
  LearningProgressStatus,
  LessonType,
} from '@trinity/shared';
import { Types } from 'mongoose';

export class LessonEntity implements ILesson {
  _id?: Types.ObjectId;

  lessonId!: number;
  type: LessonType = LessonType.TEXT;

  // Вложенность
  parent: Types.ObjectId | ITraining | null = null;
  parentId: number | null = null;

  // Метаданные
  title: string | null = null;
  description: string | null = null;
  content: ILessonContent = { html: '' } as ILessonTextContent;
  coverUrl: string | null = null;

  // Условия доступности
  accessRules: TypeContentAccess[] = [];
  price: number | null = null;
  accessStatus?: LearningAccessStatus;
  progressStatus?: LearningProgressStatus;

  constructor(lesson: Partial<ILesson> = {}) {
    Object.assign(this, lesson);
  }

  bindParent(training: ITraining) {
    if (!training._id) {
      throw new Error('Тренинг не имеет _id');
    }

    this.parent = training._id;
    this.parentId = training.trainingId;

    return this;
  }

  public update(
    data: Partial<
      Pick<ILesson, 'title' | 'description' | 'coverUrl' | 'price' | 'content'>
    >
  ) {
    if (data.title !== undefined) {
      this.title = data.title;
    }
    if (data.description !== undefined) {
      this.description = data.description;
    }
    if (data.coverUrl !== undefined) {
      this.coverUrl = data.coverUrl;
    }
    if (data.price !== undefined) {
      this.price = data.price;
    }
    if (data.content !== undefined) {
      this.content = data.content as ILessonContent;
    }
    return this;
  }

  updateAccessRules(accessRules: TypeContentAccess[]) {
    this.accessRules = accessRules;

    return this;
  }
}
