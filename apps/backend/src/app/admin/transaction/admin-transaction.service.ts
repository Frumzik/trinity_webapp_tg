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
import { Transaction, TransactionsService } from '../../billing';

@Injectable()
export class AdminTransactionService {
  constructor(
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService
  ) {}
  /**
   * LIST: фильтры + сортировка + пагинация
   */
  async getList(params: GetListOptions<Transaction>) {
    try {
      // Параметры для findAll
      const options = {
        ...params,
      };

      // Если есть filter.id, заменяем на filter.transactionId
      if (options.filter?.id !== undefined) {
        options.filter.transactionId = options.filter.id;
        delete options.filter.id;
      }

      const items = await this.transactionsService.findAll(options);

      const total = await this.transactionsService.count(
        options.filter?.type == TransactionType.FUND
          ? { type: TransactionType.FUND, sum: { $lt: 0 } }
          : { type: { $ne: TransactionType.FUND } }
      );

      return {
        items: items.map((u) => ({
          ...u,
          id: u.transactionId,
        })), // React-admin требует поле id
        total,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Failed to load transactions');
    }
  }

  /**
   * GET ONE
   */
  async getOne(id: string | number) {
    // Преобразуем id в number
    const transactionId = typeof id === 'string' ? parseInt(id) : id;

    // Получаем тренинг
    const transaction = await this.transactionsService.find({
      transactionId,
    });

    if (!transaction) {
      throw new NotFoundException(`Урок с id=${transaction} не найден`);
    }

    // Возвращаем в формате React-Admin
    return {
      ...transaction,
      id: transaction.transactionId, // React-Admin требует поле id
    };
  }

  /**
   * CREATE
   */
  async create() {
    return false;
  }

  /**
   * UPDATE
   */
  async update() {
    return false;
  }

  /**
   * DELETE
   */
  async delete() {
    return false;
  }
}
