import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { FilterQuery } from 'mongoose';
import { User } from './models/user.model';
import { UserEntity } from './entities/user.entity';
import { IUser, UserRole } from '@trinity/shared';
import { SubscriptionEntity } from '../../billing';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(userEntity: UserEntity): Promise<UserEntity> {
    try {
      return await this.usersRepository.createUser(userEntity);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при создании пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async findUser(condition: FilterQuery<User>): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findUser(condition);
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
      return user;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при поиске пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async findUserAll(condition: FilterQuery<User>): Promise<IUser> {
    try {
      const user = await this.usersRepository.findUserAll(condition);
      if (!user) {
        throw new NotFoundException('Пользователь не найден!');
      }
      return user;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при поиске пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async deleteUser(
    condition: FilterQuery<User>
  ): Promise<{ deleted: boolean }> {
    try {
      const result = await this.usersRepository.deleteUser(condition);
      if (!result.deleted) {
        throw new NotFoundException('Пользователь не найден для удаления');
      }
      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при удалении пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async updateUserProfile(
    condition: FilterQuery<User>,
    updateData: { name?: string; username?: string }
  ): Promise<UserEntity> {
    try {
      const updated = await this.usersRepository.updateUserProfile(
        condition,
        updateData
      );

      if (!updated) {
        throw new NotFoundException('Пользователь не найден для обновления');
      }

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении профиля пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async updateUserPin(
    condition: FilterQuery<User>,
    updateData: { pin: string }
  ): Promise<UserEntity> {
    try {
      const updated = await this.usersRepository.updateUserPin(
        condition,
        updateData
      );

      if (!updated) {
        throw new NotFoundException('Пользователь не найден для обновления');
      }

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении профиля пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async updateUserPassword(
    condition: FilterQuery<User>,
    updateData: { password: string }
  ): Promise<UserEntity> {
    try {
      const updated = await this.usersRepository.updateUserPassword(
        condition,
        updateData
      );

      if (!updated) {
        throw new NotFoundException('Пользователь не найден для обновления');
      }

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении профиля пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async updateUserBalance(
    condition: FilterQuery<User>,
    updateData: { balance: number }
  ): Promise<UserEntity> {
    try {
      const updated = await this.usersRepository.updateUserBalance(
        condition,
        updateData
      );

      if (!updated) {
        throw new NotFoundException('Пользователь не найден для обновления');
      }

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении профиля пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async updateUserRole(
    condition: FilterQuery<User>,
    updateData: { role: UserRole }
  ): Promise<UserEntity> {
    try {
      const updated = await this.usersRepository.updateUserRole(
        condition,
        updateData
      );

      if (!updated) {
        throw new NotFoundException('Пользователь не найден для обновления');
      }

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении профиля пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async bindSubscription(
    condition: FilterQuery<User>,
    updateData: { subscription: SubscriptionEntity }
  ): Promise<UserEntity> {
    try {
      const updated = await this.usersRepository.bindSubscription(
        condition,
        updateData
      );

      if (!updated) {
        throw new NotFoundException('Пользователь не найден для обновления');
      }

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении профиля пользователя';
      throw new InternalServerErrorException(message);
    }
  }
}
