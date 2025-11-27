import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Transaction } from '../models';
import { TransactionEntity } from '../entities';
import { GetListOptions } from '@trinity/shared';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>
  ) {}

  // Создание транзакции
  async create(
    transactionEntity: TransactionEntity
  ): Promise<TransactionEntity> {
    const created = await new this.transactionModel(transactionEntity).save();
    return new TransactionEntity(created.toObject());
  }

  // Поиск транзакции
  async find(
    condition: FilterQuery<Transaction>
  ): Promise<TransactionEntity | null> {
    const transaction = await this.transactionModel.findOne(condition).exec();

    return transaction ? new TransactionEntity(transaction.toObject()) : null;
  }

  // Поиск транзакций
  async findAll(
    options?: GetListOptions<Transaction>
  ): Promise<TransactionEntity[]> {
    const {
      skip = 0,
      limit = 0,
      sort = {},
      filter = {},
      populate = [],
    } = options || {};

    const transactions = await this.transactionModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate.map((path) => ({ path })))
      .lean()
      .exec();

    return transactions.map((u) => new TransactionEntity(u));
  }

  // Подсчет транзакций по условию
  async count(filter: FilterQuery<Transaction> = {}): Promise<number> {
    return await this.transactionModel.countDocuments(filter).exec();
  }

  // Обновление транзакции
  async update(
    transactionEntity: TransactionEntity
  ): Promise<TransactionEntity> {
    if (!transactionEntity._id) {
      throw new Error('Транзакция не имеет _id');
    }

    const updated = await this.transactionModel
      .findOneAndUpdate(
        { _id: transactionEntity._id },
        { $set: transactionEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Транзакция с id ${transactionEntity._id} не найдена`
      );
    }

    return new TransactionEntity(updated.toObject());
  }

  // Удаление транзакции
  async delete(
    condition: FilterQuery<Transaction>
  ): Promise<{ deleted: boolean }> {
    const result = await this.transactionModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }

  // Получение с пользователем
  async populate(
    condition: FilterQuery<Transaction>
  ): Promise<TransactionEntity[]> {
    const transactions = await this.transactionModel
      .find(condition)
      .populate([
        {
          path: 'user',
        },
      ])
      .lean()
      .exec();

    return transactions.map(
      (transaction) => new TransactionEntity(transaction)
    );
  }
}
