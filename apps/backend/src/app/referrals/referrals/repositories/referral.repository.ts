import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Referral } from '../models';
import { ReferralEntity } from '../entities';
import mongoose from 'mongoose';
import { IUser } from '@trinity/shared';

@Injectable()
export class ReferralsRepository {
  constructor(
    @InjectModel(Referral.name)
    private readonly referralModel: Model<Referral>
  ) {}

  // Создание реферала
  async create(referralEntity: ReferralEntity): Promise<ReferralEntity> {
    const created = await new this.referralModel(referralEntity).save();
    return new ReferralEntity(created.toObject());
  }

  // Поиск реферала
  async find(condition: FilterQuery<Referral>): Promise<ReferralEntity | null> {
    const referral = await this.referralModel.findOne(condition).exec();

    return referral ? new ReferralEntity(referral.toObject()) : null;
  }

  // Обновление реферала
  async update(referralEntity: ReferralEntity): Promise<ReferralEntity> {
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

  // Удаление реферала
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

  async getReferralStats(
    partnerId: number
  ): Promise<{ level: number; count: number; totalEarn: number }[]> {
    // Получаем всех рефералов, где partnerId = текущий пользователь
    const referrals = await this.referralModel
      .find({ partnerId })
      .lean()
      .exec();

    const statsMap: Record<number, { count: number; totalEarn: number }> = {};

    // Группируем найденные рефералы по уровню
    for (const ref of referrals) {
      const level = ref.level ?? 1;
      const earn = ref.earn ?? 0;

      if (!statsMap[level]) {
        statsMap[level] = { count: 0, totalEarn: 0 };
      }

      statsMap[level].count += 1;
      statsMap[level].totalEarn += earn;
    }

    // Формируем итоговый массив на 9 уровней
    const stats: { level: number; count: number; totalEarn: number }[] = [];
    for (let level = 1; level <= 9; level++) {
      if (!statsMap[level]) {
        stats.push({ level, count: 0, totalEarn: 0 });
      } else {
        stats.push({
          level,
          count: statsMap[level].count,
          totalEarn: statsMap[level].totalEarn,
        });
      }
    }

    return stats;
  }

  async getReferralList(partnerId: number): Promise<
    {
      level: number;
      totalEarn: number;
      referrals: { referralId: number; earn: number; user: IUser | null }[];
    }[]
  > {
    const pipeline: mongoose.PipelineStage[] = [
      { $match: { partnerId } },

      // Делаем join с коллекцией пользователей, чтобы получить данные рефералов
      {
        $lookup: {
          from: 'users', // название коллекции пользователей в MongoDB
          localField: 'referralId',
          foreignField: 'userId',
          as: 'referralUser',
        },
      },
      {
        $unwind: {
          path: '$referralUser',
          preserveNullAndEmptyArrays: true, // чтобы был null если пользователь не найден
        },
      },

      // Группировка по уровню
      {
        $group: {
          _id: '$level',
          totalEarn: { $sum: '$earn' },
          referrals: {
            $push: {
              referralId: '$referralId',
              earn: '$earn',
              user: '$referralUser',
            },
          },
        },
      },

      // Сортировка по уровню
      { $sort: { _id: 1 as 1 | -1 } },
    ];

    const result = await this.referralModel.aggregate(pipeline).exec();

    // Заполняем уровни до 9
    const stats: {
      level: number;
      totalEarn: number;
      referrals: { referralId: number; earn: number; user: IUser | null }[];
    }[] = [];

    for (let level = 1; level <= 9; level++) {
      const levelData = result.find((r) => r._id === level);
      stats.push({
        level,
        totalEarn: levelData?.totalEarn ?? 0,
        referrals: levelData?.referrals ?? [],
      });
    }

    return stats;
  }
}
