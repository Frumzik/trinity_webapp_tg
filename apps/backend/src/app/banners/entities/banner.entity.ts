import { IBanner } from '@trinity/shared';
import { Types } from 'mongoose';

export class BannerEntity implements IBanner {
  _id?: Types.ObjectId;

  bannerId!: number;

  miniatureUrl!: string;
  imageUrl!: string;
  linkUrl: string | null = null;

  viewedUsers: number[] = [];
  endDate: Date | null = null;

  constructor(banner: Partial<IBanner>) {
    Object.assign(this, banner);

    return this;
  }

  addViewedUser(userId: number) {
    this.viewedUsers.push(userId);

    return this;
  }
}
