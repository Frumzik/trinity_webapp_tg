import {
  TypeContentAccess,
  ILesson,
  ILessonContent,
  ILessonTextContent,
  ITraining,
  LearningAccessStatus,
  LearningProgressStatus,
  LessonType,
  FavoritesTag,
} from '@trinity/shared';
import { Types } from 'mongoose';

export class LessonEntity implements ILesson {
  _id?: Types.ObjectId;

  lessonId!: number;
  type: LessonType = LessonType.TEXT;
  favoritesTag: FavoritesTag = FavoritesTag.STANDART;

  // Вложенность
  parent: Types.ObjectId | ITraining | null = null;
  parentId: number | null = null;

  // Метаданные
  title: string | null = null;
  description: string | null = null;
  shortDescription: string | null = null;
  duration: string | null = null;
  content: ILessonContent = { html: '' } as ILessonTextContent;
  coverUrl: string | null = null;
  bgUrl: string | null = null;
  iconUrl: string | null = null;

  // Условия доступности
  accessRules: TypeContentAccess[] = [];
  price: number | null = null;
  salePrice: number | null = null;
  accessStatus?: LearningAccessStatus;
  progressStatus?: LearningProgressStatus;

  deleted = false;

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
      Pick<
        ILesson,
        | 'title'
        | 'description'
        | 'shortDescription'
        | 'duration'
        | 'favoritesTag'
        | 'coverUrl'
        | 'iconUrl'
        | 'bgUrl'
        | 'content'
        | 'price'
        | 'salePrice'
      >
    >
  ) {
    if (data.title !== undefined) {
      this.title = data.title;
    }
    if (data.description !== undefined) {
      this.description = data.description;
    }
    if (data.shortDescription !== undefined) {
      this.shortDescription = data.shortDescription;
    }

    if (data.duration !== undefined) {
      this.duration = data.duration;
    }

    if (data.favoritesTag !== undefined) {
      this.favoritesTag = data.favoritesTag;
    }

    if (data.coverUrl !== undefined) {
      this.coverUrl = data.coverUrl;
    }

    if (data.iconUrl !== undefined) {
      this.iconUrl = data.iconUrl;
    }

    if (data.bgUrl !== undefined) {
      this.bgUrl = data.bgUrl;
    }

    if (data.content !== undefined) {
      this.content = data.content as ILessonContent;
    }

    if (data.price !== undefined) {
      this.price = data.price;
    }
    if (data.salePrice !== undefined) {
      this.salePrice = data.salePrice;
    }
    return this;
  }

  updateAccessRules(accessRules: TypeContentAccess[]) {
    this.accessRules = accessRules;

    return this;
  }
}
