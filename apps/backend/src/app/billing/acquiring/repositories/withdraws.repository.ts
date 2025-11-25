import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Withdraw } from '../models';
import { WithdrawEntity } from '../entities';

@Injectable()
export class WithdrawsRepository {
  constructor(
    @InjectModel(Withdraw.name)
    private readonly withdrawModel: Model<Withdraw>
  ) {}

  // Создание заявки
  async create(withdrawEntity: WithdrawEntity): Promise<WithdrawEntity> {
    const created = await new this.withdrawModel(withdrawEntity).save();
    return new WithdrawEntity(created.toObject());
  }

  // Поиск заявки
  async find(condition: FilterQuery<Withdraw>): Promise<WithdrawEntity | null> {
    const withdraw = await this.withdrawModel.findOne(condition).exec();

    return withdraw ? new WithdrawEntity(withdraw.toObject()) : null;
  }

  // Обновление баннера
  async update(withdrawEntity: WithdrawEntity): Promise<WithdrawEntity> {
    if (!withdrawEntity._id) {
      throw new Error('Заявка не имеет _id');
    }

    const updated = await this.withdrawModel
      .findOneAndUpdate(
        { _id: withdrawEntity._id },
        { $set: withdrawEntity },
        { new: true } // вернуть обновлённый документ
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Заявка с id ${withdrawEntity._id} не найдена`
      );
    }

    return new WithdrawEntity(updated.toObject());
  }

  // Удаление заявки
  async delete(
    condition: FilterQuery<Withdraw>
  ): Promise<{ deleted: boolean }> {
    const result = await this.withdrawModel.deleteOne(condition).exec();

    return { deleted: result.deletedCount !== 0 };
  }
}
