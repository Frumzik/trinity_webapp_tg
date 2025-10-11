import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/user.model';
import { FilterQuery, Model } from 'mongoose';
import { UserEntity } from '../entities/user.entity';

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

  // Удаление пользователя
  async deleteUser(
    condition: FilterQuery<User>
  ): Promise<{ deleted: boolean }> {
    const result = await this.userModel.deleteOne(condition).exec();
    return { deleted: result.deletedCount > 0 };
  }

  // Обновление пользователя
  async updateUser(
    condition: FilterQuery<User>,
    update: Partial<UserEntity> & { password?: string; pin?: string }
  ): Promise<UserEntity | null> {
    const user = await this.userModel.findOne(condition).exec();
    if (!user) return null;

    // Применяем изменения через UserEntity
    const userEntity = new UserEntity(user);
    await userEntity.updateUser(update); // дождаться async методов setPin/setPassword

    const updated = await this.userModel
      .findOneAndUpdate(condition, userEntity, { new: true })
      .exec();

    return updated ? new UserEntity(updated) : null;
  }
}
