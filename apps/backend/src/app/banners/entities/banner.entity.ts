import { IBanner } from '@trinity/shared';
import { Types } from 'mongoose';

export class BannerEntity implements IBanner {
  _id?: Types.ObjectId;

  bannerId!: number;

  miniatureUrl: string | null = null;
  imageUrl: string | null = null;
  linkUrl: string | null = null;
  description: string | null = null;

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

  update(
    data: Partial<
      Pick<
        IBanner,
        'miniatureUrl' | 'imageUrl' | 'linkUrl' | 'description' | 'endDate'
      >
    >
  ) {
    if (data.miniatureUrl) this.miniatureUrl = data.miniatureUrl;
    if (data.imageUrl) this.imageUrl = data.imageUrl;
    if (data.linkUrl) this.linkUrl = data.linkUrl;
    if (data.description) this.description = data.description;
    if (data.endDate) this.endDate = data.endDate;

    return this;
  }
}
