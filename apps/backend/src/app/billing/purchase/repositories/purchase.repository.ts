import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Purchase } from '../models';
import { PurchaseEntity } from '../entities';

@Injectable()
export class PurchasesRepository {
  constructor(
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<Purchase>
  ) {}

  // Создание подписки
  async create(purchaseEntity: PurchaseEntity): Promise<PurchaseEntity> {
    const created = await new this.purchaseModel(purchaseEntity).save();
    return new PurchaseEntity(created.toObject());
  }

  // Поиск подписки
  async find(condition: FilterQuery<Purchase>): Promise<PurchaseEntity | null> {
    const purchase = await this.purchaseModel.findOne(condition).exec();

    return purchase ? new PurchaseEntity(purchase.toObject()) : null;
  }

  // Обновление подписки
  async update(purchaseEntity: PurchaseEntity): Promise<PurchaseEntity> {
    if (!purchaseEntity._id) {
      throw new Error('Покупка не имеет _id');
    }

    const updated = await this.purchaseModel
      .findOneAndUpdate(
        { _id: purchaseEntity._id },
        { $set: purchaseEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Покупка с id ${purchaseEntity._id} не найдена`
      );
    }

    return new PurchaseEntity(updated.toObject());
  }

  // Удаление подписки
  async delete(
    condition: FilterQuery<Purchase>
  ): Promise<{ deleted: boolean }> {
    const result = await this.purchaseModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }

  // Получение с пользователем
  async populate(
    condition: FilterQuery<Purchase>
  ): Promise<PurchaseEntity | null> {
    const purchase = await this.purchaseModel
      .findOne(condition)
      .populate([
        {
          path: 'user',
        },
        {
          path: 'transaction',
        },
      ])
      .lean()
      .exec();

    return purchase ? new PurchaseEntity(purchase) : null;
  }
}
