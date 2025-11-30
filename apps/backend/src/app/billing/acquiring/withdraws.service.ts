import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { WithdrawsRepository } from './repositories';
import { WithdrawEntity } from './entities';
import {
  GetListOptions,
  IWithdraw,
  WithdrawCreateRequestDto,
} from '@trinity/shared';
import { FilterQuery } from 'mongoose';
import { Withdraw } from './models';
import { JWTAuthGuard, ProdcutionGuard } from '../../service';

@UseGuards(JWTAuthGuard, ProdcutionGuard)
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

  async populate(
    condition: FilterQuery<Withdraw>
  ): Promise<WithdrawEntity | null> {
    try {
      const withdraw = await this.withdrawsRepository.populate(condition);

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

  async update(
    condition: FilterQuery<Withdraw>,
    updateData: Partial<Pick<IWithdraw, 'needModeration'>>
  ): Promise<WithdrawEntity> {
    try {
      const withdraw = await this.withdrawsRepository.find(condition);

      if (!withdraw) {
        throw new NotFoundException('Заявка не найдена');
      }

      return await this.withdrawsRepository.update(withdraw.update(updateData));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске заявки';
      throw new InternalServerErrorException(message);
    }
  }

  async count(condition: FilterQuery<Withdraw> = {}): Promise<number> {
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
