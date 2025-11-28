/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { GetListOptions } from '@trinity/shared';
import {
  AcquiringService,
  Withdraw,
  WithdrawEntity,
  WithdrawsService,
} from '../../billing/acquiring';

@Injectable()
export class AdminWithdrawService {
  constructor(
    private readonly withdrawsService: WithdrawsService,
    private readonly acquiringService: AcquiringService
  ) {}
  /**
   * LIST: фильтры + сортировка + пагинация
   */
  async getList(params: GetListOptions<Withdraw>) {
    try {
      // Параметры для findAll
      const options = {
        ...params,
        populate: ['user'],
      };

      const items = await this.withdrawsService.findAll(options);
      const total = await this.withdrawsService.count();

      return {
        items: items.map((u) => ({ ...u, id: u.withdrawId })), // React-admin требует поле id
        total,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Failed to load withdraws');
    }
  }

  /**
   * GET ONE
   */
  async getOne(id: string | number) {
    // Преобразуем id в number
    const withdrawId = typeof id === 'string' ? parseInt(id) : id;

    const withdraw = await this.withdrawsService.populate({ withdrawId });

    if (!withdraw) {
      throw new NotFoundException(`Вывод с id=${withdrawId} не найден`);
    }

    // Возвращаем в формате React-Admin
    return {
      ...withdraw,
      id: withdraw.withdrawId, // React-Admin требует поле id
    };
  }

  /**
   * CREATE
   */
  async create(data: Partial<WithdrawEntity>) {
    return false;
  }

  /**
   * UPDATE
   */
  async update(id: string | number, data: Partial<WithdrawEntity>) {
    const withdrawId = typeof id === 'string' ? parseInt(id) : id;

    const withdraw = await this.withdrawsService.find({ withdrawId });

    if (!withdraw) {
      throw new NotFoundException(`Вывод с id=${withdrawId} не найден`);
    }

    if (data.needModeration !== undefined) {
      console.log(data.needModeration);

      await this.withdrawsService.update(
        { withdrawId },
        { needModeration: data.needModeration }
      );

      await this.acquiringService.sendWithdrawRequest(
        withdraw.toAddress,
        withdraw.amount
      );
    }

    return { id: withdrawId, data: { ...withdraw, id: withdrawId } };
  }

  /**
   * DELETE
   */
  async delete(id: string | number) {
    const withdrawId = typeof id === 'string' ? parseInt(id) : id;

    const withdraw = await this.withdrawsService.find({ withdrawId });

    if (!withdraw) {
      throw new NotFoundException(`Вывод с id=${withdrawId} не найден`);
    }
    const { deleted } = await this.withdrawsService.delete({ withdrawId: +id });

    if (!deleted) {
      throw new Error('Ошибка удаления вывода');
    }

    return { id: withdrawId, data: { id: withdrawId } };
  }
}
