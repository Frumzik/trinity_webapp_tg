import { ITraining } from '@trinity/shared';
import { Types } from 'mongoose';

export class TrainingEntity implements ITraining {
  _id?: Types.ObjectId;
  trainingId: number;
  title: string;

  constructor(training: ITraining) {
    this._id = training._id;
    this.trainingId = training.trainingId;
    this.title = training.title;
  }
}
