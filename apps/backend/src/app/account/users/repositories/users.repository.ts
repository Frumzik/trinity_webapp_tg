import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from '../models';
import { UserEntity } from '../entities';
import { FundType, GetListOptions, IUser } from '@trinity/shared';
import {
  Purchase,
  Subscription,
  Transaction,
  Withdraw,
} from '../../../billing';
import { Banner } from '../../../banners';
import { Favorite, Learning } from '../../../lms';
import { Fund, Referral, ReserveFundItem } from '../../../referrals';
@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<Subscription>,

    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<Purchase>,

    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,

    @InjectModel(Banner.name)
    private readonly bannerModel: Model<Banner>,

    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<Favorite>,

    @InjectModel(Fund.name)
    private readonly fundModel: Model<Fund>,

    @InjectModel(ReserveFundItem.name)
    private readonly reserveFundItemModel: Model<ReserveFundItem>,

    @InjectModel(Referral.name)
    private readonly referralModel: Model<Referral>,

    @InjectModel(Withdraw.name)
    private readonly withdrawModel: Model<Withdraw>,

    @InjectModel(Learning.name)
    private readonly learningModel: Model<Learning>
  ) {}

  // Создание пользователя
  async create(userEntity: UserEntity): Promise<UserEntity> {
    const created = await new this.userModel(userEntity).save();

    return new UserEntity(created.toObject());
  }

  // Поиск пользователя
  async find(condition: FilterQuery<User>): Promise<UserEntity | null> {
    const user = await this.userModel.findOne(condition).exec();

    return user ? new UserEntity(user.toObject()) : null;
  }

  // Получение всех пользователей
  async findAll(options?: GetListOptions<User>): Promise<UserEntity[]> {
    const {
      skip = 0,
      limit = 0,
      sort = {},
      filter = {},
      populate = [],
    } = options || {};

    const users = await this.userModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate.map((path) => ({ path })))
      .lean()
      .exec();

    return users.map((u) => new UserEntity(u));
  }

  // Подсчет пользователей по условию
  async count(filter: FilterQuery<User> = {}): Promise<number> {
    return await this.userModel.countDocuments(filter).exec();
  }

  // Обновление пользователя
  async update(userEntity: UserEntity): Promise<UserEntity> {
    if (!userEntity._id) {
      throw new Error('Пользователь не имеет _id');
    }

    const updated = await this.userModel
      .findOneAndUpdate(
        { _id: userEntity._id },
        { $set: userEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Пользователь с id ${userEntity._id} не найден`
      );
    }

    return new UserEntity(updated.toObject());
  }

  // Удаление пользователя
  async delete(condition: FilterQuery<User>): Promise<{ deleted: boolean }> {
    const user = await this.find(condition);

    if (!user) {
      return { deleted: false };
    }

    const { userId, partnerId } = user;

    // Удаляем подписку пользователя
    await this.subscriptionModel.deleteMany({ userId }).exec();

    // Удаляем покупки пользователя
    await this.purchaseModel.deleteMany({ userId }).exec();

    // Удаляем транзакции пользователя
    await this.transactionModel.deleteMany({ userId }).exec();

    // Удаляем резервы пользователя
    const reserveItems = await this.reserveFundItemModel
      .find({ userId })
      .exec();

    if (reserveItems.length > 0) {
      // Считаем общую сумму списания
      const totalReserveSum = reserveItems.reduce(
        (acc, item) => acc + item.sum,
        0
      );

      // Удаляем все резервные записи
      await this.reserveFundItemModel.deleteMany({ userId }).exec();

      // Уменьшаем баланс RESERVE-фонда на эту сумму
      await this.fundModel
        .updateOne(
          { type: FundType.RESERVE },
          { $inc: { balance: -totalReserveSum } }
        )
        .exec();
    }

    // Удаляем заявки на вывод пользователя
    await this.withdrawModel.deleteMany({ userId }).exec();

    // Удаляем просмотры баннеров пользователя
    await this.bannerModel
      .updateMany(
        {}, // обновляем все баннеры
        { $pull: { viewedUsers: userId } }
      )
      .exec();

    // Удаляем избранное пользователя
    await this.favoriteModel.deleteMany({ userId }).exec();

    // Удаляем прогресс обучения пользователя
    await this.learningModel.deleteMany({ userId }).exec();

    // Меняем реферальное дерево

    const children = await this.userModel.find({
      partnerId: userId, // прямые рефералы
    });

    for (const child of children) {
      await this.changePartner(child.userId, partnerId);
    }

    // Удаляем пользователя
    const result = await this.userModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }

  async changePartner(userId: number, newPartnerId: number | null) {
    let user = await this.userModel.findOne({ userId });
    if (!user) throw new Error('User not found');

    if (userId === newPartnerId)
      throw new Error('Пользователь не может быть партнёром сам себе');

    const oldPartnerId = user.partnerId;

    let newPartner: IUser | null = null;
    if (newPartnerId !== null) {
      newPartner = await this.userModel.findOne({ userId: newPartnerId });
      if (!newPartner) throw new Error('Partner not found');

      const partnerPath = newPartner.referralPath
        .split('/')
        .filter(Boolean)
        .map(Number);
      if (partnerPath.includes(user.userId)) {
        throw new Error('Invalid partner: cycle detected');
      }
    }

    // --- Формируем новый referralPath
    const newReferralPathArr = newPartner
      ? [
          ...newPartner.referralPath.split('/').filter(Boolean).map(Number),
          newPartner.userId,
        ].slice(-9)
      : [];

    // --- Обновляем самого пользователя
    user.partnerId = newPartnerId;
    user.referralPath = newReferralPathArr.join('/');
    await user.save();

    // --- Удаляем старые пары referrals у старого партнёра
    if (oldPartnerId !== null) {
      const oldBranch = await this.userModel.find({
        referralPath: { $regex: `(^|/)${user.userId}(/|$)` },
      });
      const oldUserIds = oldBranch.map((u) => u.userId).concat([user.userId]);
      const protectedUserIds = newReferralPathArr;

      const toDeleteIds = oldUserIds.filter(
        (id) => !protectedUserIds.includes(id)
      );
      if (toDeleteIds.length > 0) {
        await this.referralModel.deleteMany({
          partnerId: oldPartnerId,
          referralId: { $in: toDeleteIds },
        });
      }
    }

    // --- Создаём/обновляем запись для нового партнёра
    if (newPartner) {
      await this.referralModel.updateOne(
        { partnerId: newPartner.userId, referralId: user.userId },
        {
          $set: {
            level: 1,
            earn: 0,
            partner: newPartner._id,
            referral: user._id,
          },
        },
        { upsert: true }
      );
    }

    // --- Рекурсивное обновление всех потомков
    await this._updateChildren(user.userId);

    user = await this.userModel.findOne({ userId });

    return new UserEntity(user?.toObject());
  }

  private async _updateChildren(parentUserId: number) {
    const parent = await this.userModel.findOne({ userId: parentUserId });
    if (!parent) throw new Error('Parent not found');

    const children = await this.userModel.find({ partnerId: parentUserId });
    if (!children.length) return;

    const parentPathArr = parent.referralPath
      .split('/')
      .filter(Boolean)
      .map(Number);

    for (const child of children) {
      const oldPartnerId = child.partnerId;

      // --- 1. Обновляем partnerId и referralPath
      const newPathArr = [...parentPathArr, parent.userId].slice(-9);
      child.partnerId = parent.userId;
      child.referralPath = newPathArr.join('/');
      await child.save();

      // --- 2. Удаляем старые связи
      if (oldPartnerId !== null) {
        await this.referralModel.deleteMany({
          partnerId: oldPartnerId,
          referralId: child.userId,
        });
      }

      // --- 3. Создаём/обновляем запись для текущего партнёра
      const level = newPathArr.length - parentPathArr.length;
      await this.referralModel.updateOne(
        { partnerId: parent.userId, referralId: child.userId },
        { $set: { level, earn: 0, partner: parent._id, referral: child._id } },
        { upsert: true }
      );

      // --- 4. Пересчёт всех partners вверх по пути
      await this._updateReferralsUpwards(child.userId);

      // --- 5. Рекурсивно обновляем всех потомков
      await this._updateChildren(child.userId);
    }
  }

  private async _updateReferralsUpwards(userId: number) {
    const user = await this.userModel.findOne({ userId });
    if (!user) return;

    const referralPathArr = user.referralPath
      .split('/')
      .filter(Boolean)
      .map(Number);

    for (let i = 0; i < referralPathArr.length; i++) {
      const partnerId = referralPathArr[i];
      const level = referralPathArr.length - i;

      const partner = await this.userModel.findOne({ userId: partnerId });
      await this.referralModel.updateOne(
        { partnerId, referralId: user.userId },
        { $set: { level, earn: 0, partner: partner?._id, referral: user._id } },
        { upsert: true }
      );
    }
  }

  // Получение с подпиской
  async populate(condition: FilterQuery<User>): Promise<UserEntity | null> {
    const user = await this.userModel
      .findOne(condition)
      .populate([
        {
          path: 'subscription',
        },
      ])
      .lean()
      .exec();

    return user ? new UserEntity(user) : null;
  }
}
