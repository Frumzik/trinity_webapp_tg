import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { WithdrawsRepository } from './repositories';
import { WithdrawEntity } from './entities';
import { GetListOptions, WithdrawCreateRequestDto } from '@trinity/shared';
import { FilterQuery } from 'mongoose';
import { Withdraw } from './models';

@Injectable()
export class WithdrawsService {
  constructor(private readonly withdrawsRepository: WithdrawsRepository) {}
  async create(dto: WithdrawCreateRequestDto): Promise<WithdrawEntity> {
    try {
      const newWithdraw = new WithdrawEntity({
        ...dto,
      });

      return await this.withdrawsRepository.create(newWithdraw);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при создании заявки';
      throw new InternalServerErrorException(message);
    }
  }

  async find(condition: FilterQuery<Withdraw>): Promise<WithdrawEntity | null> {
    try {
      const withdraw = await this.withdrawsRepository.find(condition);

      return withdraw;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске заявки';
      throw new InternalServerErrorException(message);
    }
  }

  async findAll(options?: GetListOptions<Withdraw>): Promise<WithdrawEntity[]> {
    try {
      const withdraws = await this.withdrawsRepository.findAll(options);

      return withdraws;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске заявки';
      throw new InternalServerErrorException(message);
    }
  }

  async count(condition: FilterQuery<Withdraw>): Promise<number> {
    try {
      const count = await this.withdrawsRepository.count(condition);

      return count;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске заявки';
      throw new InternalServerErrorException(message);
    }
  }

  async delete(
    condition: FilterQuery<Withdraw>
  ): Promise<{ deleted: boolean }> {
    try {
      const result = await this.withdrawsRepository.delete(condition);

      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при удалении заявки';
      throw new InternalServerErrorException(message);
    }
  }
}
