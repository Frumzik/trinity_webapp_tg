import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Model } from 'mongoose';
import { User } from '../models';
import { UserEntity } from '../entities';
import { FundType, GetListOptions } from '@trinity/shared';
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

      // Пополняем баланс MAIN-фонда на эту сумму
      await this.fundModel
        .updateOne(
          { type: FundType.MAIN },
          { $inc: { balance: totalReserveSum } }
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

    await this.referralModel.deleteMany({
      $or: [{ partnerId: userId }, { referralId: userId }],
    });

    // Удаляем пользователя
    const result = await this.userModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }

  async changePartner(
    userId: number,
    newPartnerId: number | null
  ): Promise<UserEntity> {
    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      // Проверка валидности пользователей
      const user = await this.userModel.findOne({ userId }).session(session);
      if (!user) {
        throw new BadRequestException(`User with userId ${userId} not found`);
      }

      if (newPartnerId !== null) {
        const newPartner = await this.userModel
          .findOne({ userId: newPartnerId })
          .session(session);
        if (!newPartner) {
          throw new BadRequestException(
            `New partner with userId ${newPartnerId} not found`
          );
        }
      }

      // Проверка невозможных переносов
      await this.validateTransfer(userId, newPartnerId, session);

      // Получение всей ветки пользователя
      const userBranch = await this.getUserBranch(userId, session);

      // Вычисление новых путей для всех пользователей в ветке
      const newPaths = await this.calculateNewPaths(
        userId,
        newPartnerId,
        userBranch,
        session
      );

      // Обновление пользователей и реферальных связей
      await this.updateUsersAndReferrals(userBranch, newPaths, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    const user = await this.find({ userId });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    return user;
  }

  private async validateTransfer(
    userId: number,
    newPartnerId: number | null,
    session: ClientSession
  ): Promise<void> {
    // Запрет переноса к самому себе
    if (userId === newPartnerId) {
      throw new BadRequestException('Cannot transfer user to itself');
    }

    if (newPartnerId === null) return;

    // Запрет кольцевого переноса: новый партнер не должен находиться в ветке пользователя
    const userBranch = await this.getUserBranch(userId, session);
    const userBranchUserIds = userBranch.map((u) => u.userId);

    if (userBranchUserIds.includes(newPartnerId)) {
      throw new BadRequestException(
        'Circular transfer detected: new partner is in the branch of user being transferred'
      );
    }
  }

  private async getUserBranch(
    userId: number,
    session: ClientSession
  ): Promise<User[]> {
    const branch: User[] = [];
    const queue = [userId];

    while (queue.length > 0) {
      const currentUserId = queue.shift();
      if (!currentUserId) continue;

      const user = await this.userModel
        .findOne({ userId: currentUserId })
        .session(session);

      if (user) {
        branch.push(user);

        // Находим всех пользователей, у которых текущий пользователь является партнером
        const referrals = await this.userModel
          .find({ partnerId: currentUserId })
          .session(session);

        for (const referral of referrals) {
          queue.push(referral.userId);
        }
      }
    }

    return branch;
  }

  private async calculateNewPaths(
    rootUserId: number,
    newPartnerId: number | null,
    userBranch: User[],
    session: ClientSession
  ): Promise<Map<number, { path: string; partnerId: number | null }>> {
    const newPaths = new Map<
      number,
      { path: string; partnerId: number | null }
    >();

    // Сначала вычисляем путь для корневого пользователя
    let rootNewPath: string;
    let rootNewPartnerId: number | null;

    if (newPartnerId === null) {
      rootNewPath = '';
      rootNewPartnerId = null;
    } else {
      const newPartner = await this.userModel
        .findOne({ userId: newPartnerId })
        .session(session);
      if (!newPartner) {
        throw new BadRequestException('New partner not found');
      }

      const newPartnerPath = newPartner.referralPath || '';
      // Добавляем нового партнера в путь
      rootNewPath = newPartnerPath
        ? `${newPartnerPath}/${newPartnerId}`
        : newPartnerId.toString();
      rootNewPartnerId = newPartnerId;

      // Обрезаем путь до 9 уровней, если нужно
      const pathParts = rootNewPath.split('/');
      if (pathParts.length > 9) {
        rootNewPath = pathParts.slice(-9).join('/');
      }
    }

    newPaths.set(rootUserId, {
      path: rootNewPath,
      partnerId: rootNewPartnerId,
    });

    // Затем вычисляем пути для всех остальных пользователей в ветке
    for (const user of userBranch) {
      if (user.userId === rootUserId) continue;

      const oldPath = user.referralPath || '';

      // Для прямых рефералов корневого пользователя
      if (user.partnerId === rootUserId) {
        // Новый путь = путь корневого пользователя + ID корневого пользователя
        let newUserPath = rootNewPath
          ? `${rootNewPath}/${rootUserId}`
          : rootUserId.toString();

        // Обрезаем путь до 9 уровней, если нужно
        const newPathParts = newUserPath.split('/');
        if (newPathParts.length > 9) {
          newUserPath = newPathParts.slice(-9).join('/');
        }

        newPaths.set(user.userId, { path: newUserPath, partnerId: rootUserId });
      } else {
        // Для непрямых рефералов - сохраняем существующую структуру
        // Находим путь от корневого пользователя до текущего пользователя
        const oldPathParts = oldPath.split('/');
        const rootIndex = oldPathParts.indexOf(rootUserId.toString());

        if (rootIndex === -1) {
          throw new Error(
            `User ${user.userId} is not in the branch of root user ${rootUserId}`
          );
        }

        // Берем часть пути после корневого пользователя
        const pathAfterRoot = oldPathParts.slice(rootIndex + 1).join('/');

        // Собираем новый путь
        let newUserPath: string;
        if (pathAfterRoot) {
          newUserPath = rootNewPath
            ? `${rootNewPath}/${rootUserId}/${pathAfterRoot}`
            : `${rootUserId}/${pathAfterRoot}`;
        } else {
          // Это не должно происходить для непрямых рефералов
          newUserPath = rootNewPath
            ? `${rootNewPath}/${rootUserId}`
            : rootUserId.toString();
        }

        // Обрезаем путь до 9 уровней, если нужно
        const newPathParts = newUserPath.split('/');
        if (newPathParts.length > 9) {
          newUserPath = newPathParts.slice(-9).join('/');
        }

        // Для непрямых рефералов partnerId остается тем же
        newPaths.set(user.userId, {
          path: newUserPath,
          partnerId: user.partnerId,
        });
      }
    }

    return newPaths;
  }

  private async updateUsersAndReferrals(
    userBranch: User[],
    newPaths: Map<number, { path: string; partnerId: number | null }>,
    session: ClientSession
  ): Promise<void> {
    // Получаем ObjectId всех пользователей в ветке
    const userBranchObjectIds = userBranch.map((u) => u._id);

    // Удаляем старые реферальные связи для всей ветки
    await this.referralModel
      .deleteMany({
        referral: { $in: userBranchObjectIds },
      })
      .session(session);

    // Обновляем пользователей
    for (const user of userBranch) {
      const newPathData = newPaths.get(user.userId);
      if (!newPathData) {
        throw new Error(`No new path data for user ${user.userId}`);
      }

      await this.userModel
        .updateOne(
          { userId: user.userId },
          {
            partnerId: newPathData.partnerId,
            referralPath: newPathData.path,
          }
        )
        .session(session);

      // Создаем новые реферальные связи
      await this.createReferralLinks(user, newPathData.path, session);
    }
  }

  private async createReferralLinks(
    user: User,
    referralPath: string,
    session: ClientSession
  ): Promise<void> {
    const referralLinks = [];

    // Если путь пустой, значит пользователь в корне - нет реферальных связей
    if (!referralPath) return;

    const pathParts = referralPath.split('/');

    // Проходим по всем партнерам в пути
    for (let i = 0; i < pathParts.length; i++) {
      const partnerUserId = parseInt(pathParts[i], 10);

      // Уровень = разница в позициях между партнером и рефералом
      // Позиция партнера = i, позиция реферала = pathParts.length
      // Уровень = (pathParts.length) - i
      const level = pathParts.length - i;

      // Сохраняем только уровни <= 9
      if (level > 9) continue;

      // Находим партнера по userId
      const partner = await this.userModel
        .findOne({ userId: partnerUserId })
        .session(session);
      if (!partner) {
        throw new Error(`Partner with userId ${partnerUserId} not found`);
      }

      // Ищем существующую запись для сохранения заработка
      const existingReferral = await this.referralModel
        .findOne({
          partner: partner._id,
          referral: user._id,
        })
        .session(session);

      referralLinks.push({
        partner: partner._id,
        referral: user._id,
        partnerId: partner.userId,
        referralId: user.userId,
        level,
        earn: existingReferral ? existingReferral.earn : 0,
      });
    }

    if (referralLinks.length > 0) {
      await this.referralModel.insertMany(referralLinks, { session });
    }
  }
}
