import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { Transaction, TransactionEntity } from '../../billing';
import { TransactionsRepository } from './repositories';
import {
  CounterType,
  GetListOptions,
  TransactionCreateRequestDto,
} from '@trinity/shared';
import { CountersService } from '../../service';
import { UsersService } from '../../account';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly countersService: CountersService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService
  ) {}

  async create(dto: TransactionCreateRequestDto): Promise<TransactionEntity> {
    try {
      const user = await this.usersService.find({ userId: dto.userId });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const newTransaction = new TransactionEntity({
        transactionId: await this.countersService.saveNextSequence(
          CounterType.TRANSACTION_ID
        ),
        user: user._id,
        userId: user.userId,

        type: dto.type,
        date: new Date(),
        sum: dto.sum,
        description: dto.description,
      });

      return await this.transactionsRepository.create(newTransaction);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при создании транзакции';
      throw new InternalServerErrorException(message);
    }
  }

  async find(
    condition: FilterQuery<Transaction>
  ): Promise<TransactionEntity | null> {
    try {
      const transaction = await this.transactionsRepository.find(condition);

      return transaction;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске транзакции';
      throw new InternalServerErrorException(message);
    }
  }

  async findAll(
    options?: GetListOptions<Transaction>
  ): Promise<TransactionEntity[]> {
    try {
      const transactions = await this.transactionsRepository.findAll(options);

      return transactions;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске транзакции';
      throw new InternalServerErrorException(message);
    }
  }

  async count(condition: FilterQuery<Transaction>): Promise<number> {
    try {
      const count = await this.transactionsRepository.count(condition);

      return count;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске транзакции';
      throw new InternalServerErrorException(message);
    }
  }

  async delete(
    condition: FilterQuery<Transaction>
  ): Promise<{ deleted: boolean }> {
    try {
      const result = await this.transactionsRepository.delete(condition);

      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при удалении транзакции';
      throw new InternalServerErrorException(message);
    }
  }

  async populate(
    condition: FilterQuery<Transaction>
  ): Promise<TransactionEntity[]> {
    try {
      const transactions = await this.transactionsRepository.populate(
        condition
      );

      return transactions;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске транзакции';
      throw new InternalServerErrorException(message);
    }
  }
}
