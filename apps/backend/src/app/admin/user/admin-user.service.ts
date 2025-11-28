/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { GetListOptions, TransactionType } from '@trinity/shared';
import { User, UserEntity, UsersService } from '../../account';
import { TransactionsService } from '../../billing';

@Injectable()
export class AdminUserService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService
  ) {}
  /**
   * LIST: фильтры + сортировка + пагинация
   */
  async getList(params: GetListOptions<User>) {
    try {
      // Параметры для findAll
      const options = {
        ...params,
        populate: ['subscription'], // если нужно populate
      };

      const items = await this.usersService.findAll(options);
      const total = await this.usersService.count();

      return {
        items: items.map((u) => ({ ...u, id: u.userId })), // React-admin требует поле id
        total,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Failed to load users');
    }
  }

  /**
   * GET ONE
   */
  async getOne(id: string | number) {
    // Преобразуем id в number
    const userId = typeof id === 'string' ? parseInt(id) : id;

    // Получаем пользователя
    const user = await this.usersService.populate({ userId });

    if (!user) {
      throw new NotFoundException(`Пользователь с id=${userId} не найден`);
    }

    // Возвращаем в формате React-Admin
    return {
      ...user,
      id: user.userId, // React-Admin требует поле id
    };
  }

  /**
   * CREATE
   */
  async create(data: Partial<UserEntity>) {
    return false;
  }

  /**
   * UPDATE
   */
  async update(
    id: string | number,
    data: Partial<UserEntity> & {
      password: string;
      pin: string;
      finPassword: string;
    }
  ) {
    const userId = typeof id === 'string' ? parseInt(id) : id;

    let user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException(`Пользователь с id=${userId} не найден`);
    }

    // Обновления профиля
    if (
      data.name ||
      data.email ||
      data.username ||
      data.email ||
      data.height ||
      data.height ||
      data.birthDate ||
      data.gender
    ) {
      user = await this.usersService.updateProfile({ userId }, data);
    }

    // Обновление роли
    if (data.role) {
      user = await this.usersService.updateRole(
        { userId },
        { role: data.role }
      );
    }

    // Обновление баланса
    if (data.balance) {
      const diff = data.balance - user.balance;

      if (diff !== 0) {
        user = await this.usersService.updateBalance(
          { userId },
          {
            balance: data.balance,
          }
        );

        await this.transactionsService.create({
          type: TransactionType.STANDART,
          sum: diff,
          userId,
          description: `${diff > 0 ? 'Пополнение' : 'Списание'} баланса`,
        });
      }
    }

    // Обновление пароля
    if (data.password) {
      user = await this.usersService.updatePassword(
        { userId },
        {
          password: data.password,
        }
      );
    }

    // Обновление пина
    if (data.pin) {
      user = await this.usersService.updatePin(
        { userId },
        {
          pin: data.pin,
        }
      );
    }

    // Обновление фин. пароля
    if (data.finPassword) {
      user = await this.usersService.updateFinPassword(
        { userId },
        {
          finPassword: data.finPassword,
        }
      );
    }

    return { id: userId, data: { ...user, id: userId } };
  }

  /**
   * DELETE
   */
  async delete(id: string | number) {
    const userId = typeof id === 'string' ? parseInt(id) : id;

    let user = await this.usersService.find({ userId });

    if (!user) {
      throw new NotFoundException(`Пользователь с id=${userId} не найден`);
    }
    user = await this.usersService.delete({ userId: +id });

    return { id: userId, data: { ...user, id: userId } };
  }
}
