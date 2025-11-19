import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ReserveFundItem } from '../models';
import { ReserveFundItemEntity } from '../entities';

@Injectable()
export class ReserveFundItemsRepository {
  constructor(
    @InjectModel(ReserveFundItem.name)
    private readonly reserveFundItemModel: Model<ReserveFundItem>
  ) {}

  // Создание реферала
  async create(
    reserveFundItemEntity: ReserveFundItemEntity
  ): Promise<ReserveFundItemEntity> {
    const created = await new this.reserveFundItemModel(
      reserveFundItemEntity
    ).save();
    return new ReserveFundItemEntity(created.toObject());
  }

  // Поиск реферала
  async find(
    condition: FilterQuery<ReserveFundItem>
  ): Promise<ReserveFundItemEntity | null> {
    const reserveFundItem = await this.reserveFundItemModel
      .findOne(condition)
      .exec();

    return reserveFundItem
      ? new ReserveFundItemEntity(reserveFundItem.toObject())
      : null;
  }

  // Поиск реферала
  async findAll(
    condition: FilterQuery<ReserveFundItem> = {}
  ): Promise<ReserveFundItemEntity[]> {
    const reserveFundItems = await this.reserveFundItemModel
      .find(condition)
      .lean()
      .exec();

    return reserveFundItems.map((item) => new ReserveFundItemEntity(item));
  }

  // Обновление реферала
  async update(
    reserveFundItemEntity: ReserveFundItemEntity
  ): Promise<ReserveFundItemEntity> {
    if (!reserveFundItemEntity._id) {
      throw new Error('Фонд не имеет _id');
    }

    const updated = await this.reserveFundItemModel
      .findOneAndUpdate(
        { _id: reserveFundItemEntity._id },
        { $set: reserveFundItemEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Фонд с id ${reserveFundItemEntity._id} не найдена`
      );
    }

    return new ReserveFundItemEntity(updated.toObject());
  }

  // Удаление реферала
  async delete(
    condition: FilterQuery<ReserveFundItem>
  ): Promise<{ deleted: boolean }> {
    const result = await this.reserveFundItemModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }
}
