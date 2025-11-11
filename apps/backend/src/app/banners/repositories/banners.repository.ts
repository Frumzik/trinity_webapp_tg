import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Banner } from '../models';
import { BannerEntity } from '../entities';

@Injectable()
export class BannersRepository {
  constructor(
    @InjectModel(Banner.name)
    private readonly bannerModel: Model<Banner>
  ) {}

  // Создание баннера
  async create(bannerEntity: BannerEntity): Promise<BannerEntity> {
    const created = await new this.bannerModel(bannerEntity).save();
    return new BannerEntity(created.toObject());
  }

  // Поиск баннера
  async find(condition: FilterQuery<Banner>): Promise<BannerEntity | null> {
    const banner = await this.bannerModel.findOne(condition).exec();

    return banner ? new BannerEntity(banner.toObject()) : null;
  }

  // Поиск баннера
  // Поиск только активных баннеров
  async findAll(): Promise<BannerEntity[]> {
    const now = new Date();

    const banners = await this.bannerModel
      .find({
        $or: [
          { endDate: { $gt: now } }, // дата окончания в будущем
          { endDate: null }, // или дата не указана (бессрочный баннер)
        ],
      })
      .lean()
      .exec();

    return banners.map((banner) => new BannerEntity(banner));
  }

  // Обновление баннера
  async update(bannerEntity: BannerEntity): Promise<BannerEntity> {
    if (!bannerEntity._id) {
      throw new Error('Баннер не имеет _id');
    }

    const updated = await this.bannerModel
      .findOneAndUpdate(
        { _id: bannerEntity._id },
        { $set: bannerEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Баннер с id ${bannerEntity._id} не найдена`);
    }

    return new BannerEntity(updated.toObject());
  }

  // Удаление баннера
  async delete(condition: FilterQuery<Banner>): Promise<{ deleted: boolean }> {
    const result = await this.bannerModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }
}
