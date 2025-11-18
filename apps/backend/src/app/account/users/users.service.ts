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
  AuthRegisterEmailDto,
  AuthRegisterTgDto,
  CounterType,
  IUser,
  UserEvents,
  UserRole,
  UserUpdatedEvent,
} from '@trinity/shared';
import { SubscriptionEntity } from '../../billing';
import { CountersService } from '../../service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly countersService: CountersService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(
    dto: AuthRegisterEmailDto | AuthRegisterTgDto,
    extra: { referralPath: string }
  ): Promise<UserEntity> {
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
        referralPath: extra.referralPath || '',
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

  async findAll(condition: FilterQuery<User> = {}): Promise<UserEntity[]> {
    try {
      const users = await this.usersRepository.findAll(condition);

      return users;
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
        await user.updateProfile(updateData)
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
        await user.setPin(updateData.pin)
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
        await user.setPassword(updateData.password)
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

  async updateFinPassword(
    condition: FilterQuery<User>,
    updateData: { finPassword: string }
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.find(condition);

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const updated = await this.usersRepository.update(
        await user.setFinPassword(updateData.finPassword)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении финпароля пользователя';
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
        await user.updateBalance(updateData.balance)
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

  async incBalance(
    condition: FilterQuery<User>,
    updateData: { inc: number }
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.find(condition);

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const updated = await this.usersRepository.update(
        await user.updateBalance(user.balance + updateData.inc)
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

  async decBalance(
    condition: FilterQuery<User>,
    updateData: { dec: number }
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.find(condition);

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const updated = await this.usersRepository.update(
        await user.updateBalance(user.balance - updateData.dec)
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
        await user.updateRole(updateData.role)
      );

      this.eventEmitter.emit(
        UserEvents.UPDATED,
        new UserUpdatedEvent(user.userId)
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

  async updateEmail(
    condition: FilterQuery<User>,
    updateData: { email: string }
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.find(condition);

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const updated = await this.usersRepository.update(
        await user.updateEmail(updateData.email)
      );

      this.eventEmitter.emit(
        UserEvents.UPDATED,
        new UserUpdatedEvent(user.userId)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении email пользователя';
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

  async bindAddress(
    condition: FilterQuery<User>,
    address: string
  ): Promise<UserEntity> {
    try {
      const user = await this.find(condition);

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const updated = await this.usersRepository.update(
        await user.setAddress(address)
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

  async updateNotifications(
    condition: FilterQuery<User>,
    updateData: {
      meditationNotifications: string;
      contentNotifications: boolean;
      promoNotifications: boolean;
    }
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.find(condition);

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const updated = await this.usersRepository.update(
        await user.updateNotifications(updateData)
      );

      this.eventEmitter.emit(
        UserEvents.UPDATED,
        new UserUpdatedEvent(user.userId)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении уведомлений пользователя';
      throw new InternalServerErrorException(message);
    }
  }
}
