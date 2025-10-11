import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/user.model';
import { FilterQuery, Model } from 'mongoose';
import { UserEntity } from '../entities/user.entity';
import { SubscriptionEntity } from '../../../billing';
import { IUser, UserRole } from '@trinity/shared';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  // Создание пользователя
  async createUser(userEntity: UserEntity): Promise<UserEntity> {
    const newUser = new this.userModel(userEntity);
    const saved = await newUser.save();

    return new UserEntity(saved);
  }

  // Поиск пользователя
  async findUser(condition: FilterQuery<User>): Promise<UserEntity | null> {
    const user = await this.userModel.findOne(condition).exec();
    return user ? new UserEntity(user) : null;
  }

  // Поиск пользователя
  async findUserAll(condition: FilterQuery<User>): Promise<IUser | null> {
    const user = await this.userModel.findOne(condition).populate('subscription').exec();
    return user ? new UserEntity(user) : null;
  }

  // Удаление пользователя
  async deleteUser(
    condition: FilterQuery<User>
  ): Promise<{ deleted: boolean }> {
    const result = await this.userModel.deleteOne(condition).exec();
    return { deleted: result.deletedCount > 0 };
  }

  // Обновление пользователя
  async updateUserProfile(
    condition: FilterQuery<User>,
    update: { username?: string; name?: string }
  ): Promise<UserEntity | null> {
    const user = await this.userModel.findOne(condition).exec();
    if (!user) return null;

    // Применяем изменения через UserEntity
    const userEntity = new UserEntity(user);
    userEntity.updateUserProfile(update);

    const updated = await this.userModel
      .findOneAndUpdate(condition, userEntity, { new: true })
      .exec();

    return updated ? new UserEntity(updated) : null;
  }

  // Обновление пина
  async updateUserPin(
    condition: FilterQuery<User>,
    update: { pin: string }
  ): Promise<UserEntity | null> {
    const user = await this.userModel.findOne(condition).exec();
    if (!user) return null;

    // Применяем изменения через UserEntity
    const userEntity = new UserEntity(user);
    await userEntity.updateUserPin(update.pin);

    const updated = await this.userModel
      .findOneAndUpdate(condition, userEntity, { new: true })
      .exec();

    return updated ? new UserEntity(updated) : null;
  }

  // Обновление пароля
  async updateUserPassword(
    condition: FilterQuery<User>,
    update: { password: string }
  ): Promise<UserEntity | null> {
    const user = await this.userModel.findOne(condition).exec();
    if (!user) return null;

    // Применяем изменения через UserEntity
    const userEntity = new UserEntity(user);
    await userEntity.updateUserPassword(update.password);

    const updated = await this.userModel
      .findOneAndUpdate(condition, userEntity, { new: true })
      .exec();

    return updated ? new UserEntity(updated) : null;
  }

  // Привязка id подписки
  async bindSubscription(
    condition: FilterQuery<User>,
    update: { subscription: SubscriptionEntity }
  ): Promise<UserEntity | null> {
    const user = await this.userModel.findOne(condition).exec();
    if (!user) return null;

    // Применяем изменения через UserEntity
    const userEntity = new UserEntity(user);
    userEntity.bindSubscription(update.subscription);

    const updated = await this.userModel
      .findOneAndUpdate(condition, userEntity, { new: true })
      .exec();

    return updated ? new UserEntity(updated) : null;
  }

  // Обновление баланса
  async updateUserBalance(
    condition: FilterQuery<User>,
    update: { balance: number }
  ): Promise<UserEntity | null> {
    const user = await this.userModel.findOne(condition).exec();
    if (!user) return null;

    // Применяем изменения через UserEntity
    const userEntity = new UserEntity(user);
    userEntity.updateUserBalance(update.balance);

    const updated = await this.userModel
      .findOneAndUpdate(condition, userEntity, { new: true })
      .exec();

    return updated ? new UserEntity(updated) : null;
  }


  // Обновление роли
  async updateUserRole(
    condition: FilterQuery<User>,
    update: { role: UserRole }
  ): Promise<UserEntity | null> {
    const user = await this.userModel.findOne(condition).exec();
    if (!user) return null;

    // Применяем изменения через UserEntity
    const userEntity = new UserEntity(user);
    userEntity.updateUserRole(update.role);

    const updated = await this.userModel
      .findOneAndUpdate(condition, userEntity, { new: true })
      .exec();

    return updated ? new UserEntity(updated) : null;
  }
}
