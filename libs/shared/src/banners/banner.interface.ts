import { Types } from 'mongoose';

export interface IBanner {
  _id?: Types.ObjectId;

  bannerId: number;

  miniatureUrl: string;
  imageUrl: string;
  linkUrl: string | null;

  viewedUsers: number[];
  endDate: Date | null;
}
