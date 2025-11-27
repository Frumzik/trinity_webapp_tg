import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Fund } from '../models';
import { FundEntity } from '../entities';
import { GetListOptions } from '@trinity/shared';

@Injectable()
export class FundsRepository {
  constructor(
    @InjectModel(Fund.name)
    private readonly fundModel: Model<Fund>
  ) {}

  // Создание реферала
  async create(fundEntity: FundEntity): Promise<FundEntity> {
    const created = await new this.fundModel(fundEntity).save();
    return new FundEntity(created.toObject());
  }

  // Поиск реферала
  async find(condition: FilterQuery<Fund>): Promise<FundEntity | null> {
    const fund = await this.fundModel.findOne(condition).exec();

    return fund ? new FundEntity(fund.toObject()) : null;
  }

  // Получение всех тренингов
  async findAll(options?: GetListOptions<Fund>): Promise<FundEntity[]> {
    const {
      skip = 0,
      limit = 0,
      sort = {},
      filter = {},
      populate = [],
    } = options || {};

    const funds = await this.fundModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate.map((path) => ({ path })))
      .lean()
      .exec();

    return funds.map((u) => new FundEntity(u));
  }

  // Подсчет баннера по условию
  async count(filter: FilterQuery<Fund> = {}): Promise<number> {
    return await this.fundModel.countDocuments(filter).exec();
  }

  // Обновление реферала
  async update(fundEntity: FundEntity): Promise<FundEntity> {
    if (!fundEntity._id) {
      throw new Error('Фонд не имеет _id');
    }

    const updated = await this.fundModel
      .findOneAndUpdate(
        { _id: fundEntity._id },
        { $set: fundEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Фонд с id ${fundEntity._id} не найдена`);
    }

    return new FundEntity(updated.toObject());
  }

  // Удаление реферала
  async delete(condition: FilterQuery<Fund>): Promise<{ deleted: boolean }> {
    const result = await this.fundModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }
}
