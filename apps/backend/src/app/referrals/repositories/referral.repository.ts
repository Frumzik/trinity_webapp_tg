import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Referral } from '../models';
import { ReferralEntity } from '../entities';

@Injectable()
export class ReferralsRepository {
  constructor(
    @InjectModel(Referral.name)
    private readonly referralModel: Model<Referral>
  ) {}

  // Создание транзакции
  async create(
    referralEntity: ReferralEntity
  ): Promise<ReferralEntity> {
    const created = await new this.referralModel(referralEntity).save();
    return new ReferralEntity(created.toObject());
  }

  // Поиск транзакции
  async find(
    condition: FilterQuery<Referral>
  ): Promise<ReferralEntity | null> {
    const referral = await this.referralModel.findOne(condition).exec();

    return referral ? new ReferralEntity(referral.toObject()) : null;
  }

  // Обновление транзакции
  async update(
    referralEntity: ReferralEntity
  ): Promise<ReferralEntity> {
    if (!referralEntity._id) {
      throw new Error('Реферал не имеет _id');
    }

    const updated = await this.referralModel
      .findOneAndUpdate(
        { _id: referralEntity._id },
        { $set: referralEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Реферал с id ${referralEntity._id} не найдена`
      );
    }

    return new ReferralEntity(updated.toObject());
  }

  // Удаление транзакции
  async delete(
    condition: FilterQuery<Referral>
  ): Promise<{ deleted: boolean }> {
    const result = await this.referralModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }

  // Получение с пользователем
  async populate(
    condition: FilterQuery<Referral>
  ): Promise<ReferralEntity | null> {
    const referral = await this.referralModel
      .findOne(condition)
      .populate([
        {
          path: 'partner',
        },
        {
          path: 'referral',
        },
      ])
      .lean()
      .exec();

    return referral ? new ReferralEntity(referral) : null;
  }
}
