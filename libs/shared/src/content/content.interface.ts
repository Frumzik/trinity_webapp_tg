import { Types } from 'mongoose';

export interface ITraining {
  trainingId: number;
  _id?: Types.ObjectId;
  title: string;
}
