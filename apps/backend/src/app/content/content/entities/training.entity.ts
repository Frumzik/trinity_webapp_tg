import { ILesson, ITraining } from '@trinity/shared';
import { Types } from 'mongoose';

export class TrainingEntity implements ITraining {
  _id?: Types.ObjectId;
  trainingId: number;
  title: string;
  description?: string;
  lessons?: Types.ObjectId[] | ILesson[];
  childrens?: Types.ObjectId[] | ITraining[];
  parent?: Types.ObjectId | ITraining | null;
  lessonsId: number[];
  childrensId: number[];
  parentId: number | null;
  isRoot: boolean;

  constructor(training: ITraining) {
    this._id = training._id;
    this.trainingId = training.trainingId;
    this.title = training.title;
    this.description = training.description;
    this.lessons = training.lessons;
    this.childrens = training.childrens;
    this.parent = training.parent;
    this.lessonsId = training.lessonsId;
    this.childrensId = training.childrensId;
    this.parentId = training.parentId;
    this.isRoot = training.isRoot;
  }
}
