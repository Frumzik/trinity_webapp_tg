import {
  TypeContentAccess,
  ILesson,
  ITraining,
  LearningAccessStatus,
  LearningProgressStatus,
  TrainingType,
} from '@trinity/shared';
import { Types } from 'mongoose';

export class TrainingEntity implements ITraining {
  _id?: Types.ObjectId;

  trainingId!: number;
  type: TrainingType = TrainingType.COURSE;

  // Вложенность
  lessons: Types.ObjectId[] | ILesson[] = [];
  childrens: Types.ObjectId[] | ITraining[] = [];
  parent: Types.ObjectId | ITraining | null = null;

  lessonsId: number[] = [];
  childrensId: number[] = [];
  parentId: number | null = null;

  // Метаданные
  title: string | null = null;
  description: string | null = null;
  coverUrl: string | null = null;

  // Условия доступности
  accessRules: TypeContentAccess[] = [];
  price: number | null = null;
  accessStatus?: LearningAccessStatus;
  progressStatus?: LearningProgressStatus;

  constructor(training: Partial<ITraining> = {}) {
    Object.assign(this, training);
  }

  bindParent(training: ITraining) {
    if (!training._id) {
      throw new Error('Тренинг не имеет _id');
    }

    this.parent = training._id;
    this.parentId = training.trainingId;

    return this;
  }

  bindChildren(training: ITraining) {
    if (!training._id) {
      throw new Error('Тренинг не имеет _id');
    }

    this.childrens.push(training._id as Types.ObjectId & ITraining);
    this.childrensId.push(training.trainingId);

    return this;
  }

  bindLesson(lesson: ILesson) {
    if (!lesson._id) {
      throw new Error('Урок не имеет _id');
    }

    this.lessons.push(lesson._id as Types.ObjectId & ILesson);
    this.lessonsId.push(lesson.lessonId);

    return this;
  }

  updateAccessRules(accessRules: TypeContentAccess[]) {
    this.accessRules = accessRules;

    return this;
  }

  public update(
    data: Partial<
      Pick<ITraining, 'title' | 'description' | 'coverUrl' | 'price'>
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

    return this;
  }
}
