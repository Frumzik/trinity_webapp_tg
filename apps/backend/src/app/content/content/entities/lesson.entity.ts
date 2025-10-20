import { ILesson, ITraining } from '@trinity/shared';
import { Types } from 'mongoose';

export class LessonEntity implements ILesson {
  _id?: Types.ObjectId;
  lessonId: number;
  title: string;
  description?: string;
  parent?: Types.ObjectId | ITraining;
  parentId: number;

  constructor(lesson: ILesson) {
    this._id = lesson._id;
    this.lessonId = lesson.lessonId;
    this.title = lesson.title;
    this.description = lesson.description;
    this.parent = lesson.parent;
    this.parentId = lesson.parentId;
  }
}
