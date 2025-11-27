import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from '../models';
import { UserEntity } from '../entities';
import { GetListOptions } from '@trinity/shared';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>
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
    const result = await this.userModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
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
