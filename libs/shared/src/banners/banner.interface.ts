import { Types } from 'mongoose';

export interface IBanner {
  _id?: Types.ObjectId;

  bannerId: number;

  miniatureUrl: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  description: string | null;

  viewedUsers: number[];
  endDate: Date | null;
}
