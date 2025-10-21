import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { FilterQuery } from 'mongoose';
import { User } from './models/user.model';
import { UserEntity } from './entities/user.entity';
import {
  AuthRegisterRequestDto,
  CounterType,
  IUser,
  UserRole,
} from '@trinity/shared';
import { SubscriptionEntity } from '../../billing';
import { CountersService } from '../../service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly countersService: CountersService
  ) {}

  async create(dto: AuthRegisterRequestDto): Promise<UserEntity> {
    try {
      // Проверяем существующего пользователя
      const condition =
        dto.type === 'TG' ? { tgId: dto.tgId } : { email: dto.email };

      const oldUser = await this.usersRepository.find(condition);

      if (oldUser) {
        throw new Error('Такой пользователь уже зарегистрирован');
      }

      // Создаем UserEntity
      const newUser = new UserEntity({
        userId: await this.countersService.saveNextSequence(
          CounterType.USER_ID
        ),
        ...dto,
      });

      if (dto.type === 'TG' && dto.pin) {
        await newUser.setPin(dto.pin);
      } else if (dto.type === 'EMAIL' && dto.password) {
        await newUser.setPassword(dto.password);
      }

      const createdUser = await this.usersRepository.create(newUser);

      return createdUser;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при создании пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async find(condition: FilterQuery<User>): Promise<UserEntity | null> {
    try {
      const user = await this.usersRepository.find(condition);

      return user;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при поиске пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async populate(condition: FilterQuery<User>): Promise<UserEntity | null> {
    try {
      const user = await this.usersRepository.populate(condition);

      return user;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при поиске пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async delete(condition: FilterQuery<User>): Promise<{ deleted: boolean }> {
    try {
      const result = await this.usersRepository.delete(condition);

      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при удалении пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async updateProfile(
    condition: FilterQuery<User>,
    updateData: Partial<Pick<IUser, 'name' | 'username'>>
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.find(condition);

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const updated = await this.usersRepository.update(
        await user.updateUserProfile(updateData)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении профиля пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async updatePin(
    condition: FilterQuery<User>,
    updateData: { pin: string }
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.find(condition);

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const updated = await this.usersRepository.update(
        await user.updateUserPin(updateData.pin)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении профиля пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async updatePassword(
    condition: FilterQuery<User>,
    updateData: { password: string }
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.find(condition);

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const updated = await this.usersRepository.update(
        await user.updateUserPassword(updateData.password)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении профиля пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async updateBalance(
    condition: FilterQuery<User>,
    updateData: { balance: number }
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.find(condition);

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const updated = await this.usersRepository.update(
        await user.updateUserBalance(updateData.balance)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении профиля пользователя';
      throw new InternalServerErrorException(message);
    }
  }

  async updateRole(
    condition: FilterQuery<User>,
    updateData: { role: UserRole }
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.find(condition);

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const updated = await this.usersRepository.update(
        await user.updateUserRole(updateData.role)
      );

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
    user: UserEntity,
    subscription: SubscriptionEntity
  ): Promise<UserEntity> {
    try {
      const updated = await this.usersRepository.update(
        await user.bindSubscription(subscription)
      );

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
