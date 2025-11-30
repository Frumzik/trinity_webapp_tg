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

      // Если есть filter.id, заменяем на filter.userId
      if (options.filter?.id !== undefined) {
        options.filter.userId = options.filter.id;
        delete options.filter.id;
      }

      // Если есть q → создаём поиск по userId, username или name
      if (options.filter?.q !== undefined) {
        const q = options.filter.q;
        const userId = Number(q);

        // Создаём $or фильтр для mongoose
        const or: any[] = [];

        if (!isNaN(userId)) {
          or.push({ userId }); // ищем по числовому ID
        }

        or.push({ username: { $regex: q, $options: 'i' } });
        or.push({ name: { $regex: q, $options: 'i' } });

        options.filter = { $or: or };
      }

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
      data.name !== undefined ||
      data.email !== undefined ||
      data.username !== undefined ||
      data.email !== undefined ||
      data.height !== undefined ||
      data.height !== undefined ||
      data.birthDate !== undefined ||
      data.gender !== undefined
    ) {
      user = await this.usersService.updateProfile({ userId }, data);
    }

    // Обновление роли
    if (data.role !== undefined) {
      user = await this.usersService.updateRole(
        { userId },
        { role: data.role }
      );
    }

    // Обновление баланса
    if (data.balance !== undefined) {
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
    if (data.password !== undefined) {
      user = await this.usersService.updatePassword(
        { userId },
        {
          password: data.password,
        }
      );
    }

    // Обновление пина
    if (data.pin !== undefined) {
      user = await this.usersService.updatePin(
        { userId },
        {
          pin: data.pin,
        }
      );
    }

    // Обновление фин. пароля
    if (data.finPassword !== undefined) {
      user = await this.usersService.updateFinPassword(
        { userId },
        {
          finPassword: data.finPassword,
        }
      );
    }

    // Обновление фин. пароля
    if (data.banned !== undefined) {
      user = await this.usersService.setBanned(
        { userId },
        {
          banned: data.banned,
        }
      );
    }

    // Обновление фин. пароля
    if (data.partnerId !== undefined) {
      user = await this.usersService.changePartner(
        { userId },
        {
          partnerId: data.partnerId,
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

    await this.usersService.delete({ userId });

    return { id: userId, data: { id: userId } };
  }
}
