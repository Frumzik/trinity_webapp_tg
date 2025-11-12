import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { Transaction, TransactionEntity } from '../../billing';
import { TransactionsRepository } from './repositories';
import { CounterType, TransactionCreateRequestDto } from '@trinity/shared';
import { CountersService } from '../../service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly countersService: CountersService
  ) {}

  async create(dto: TransactionCreateRequestDto): Promise<TransactionEntity> {
    try {
      const newTransaction = new TransactionEntity({
        transactionId: await this.countersService.saveNextSequence(
          CounterType.TRANSACTION_ID
        ),
        user: dto.user._id,
        userId: dto.user.userId,

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
  ): Promise<TransactionEntity | null> {
    try {
      const transaction = await this.transactionsRepository.populate(condition);

      return transaction;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске транзакции';
      throw new InternalServerErrorException(message);
    }
  }
}
