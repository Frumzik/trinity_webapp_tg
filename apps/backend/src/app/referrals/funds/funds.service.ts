import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { FundsRepository, ReserveFundItemsRepository } from './repositories';
import {
  FundCreateRequestDto,
  FundTitle,
  FundType,
  ReserveFundItemCreateRequestDto,
} from '@trinity/shared';
import { FundEntity, ReserveFundItemEntity } from './entities';
import { Fund, ReserveFundItem } from './models';

@Injectable()
export class FundsService {
  constructor(
    private readonly fundsRepository: FundsRepository,
    private readonly reserveFundItemsRepository: ReserveFundItemsRepository
  ) {}

  async onModuleInit() {
    for (const [key, value] of Object.entries(FundType)) {
      const fund = await this.find({ type: value });

      if (!fund) {
        const title = FundTitle[key as keyof typeof FundTitle]; // ✅
        await this.create({ type: value, title });
      }
    }
  }

  async create(dto: FundCreateRequestDto): Promise<FundEntity> {
    try {
      const existingFund = await this.find({ type: dto.type });

      if (existingFund) {
        throw new Error('Фонд уже создан');
      }

      const newFund = new FundEntity(dto);

      return await this.fundsRepository.create(newFund);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async find(condition: FilterQuery<Fund>): Promise<FundEntity | null> {
    try {
      const fund = await this.fundsRepository.find(condition);

      return fund;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async delete(condition: FilterQuery<Fund>): Promise<{ deleted: boolean }> {
    try {
      const result = await this.fundsRepository.delete(condition);

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async incMain(sum: number) {
    try {
      let fund = await this.fundsRepository.find({ type: FundType.MAIN });

      if (!fund) {
        fund = await this.create({
          type: FundType.MAIN,
          title: FundTitle.MAIN,
        });
      }

      const updated = await this.fundsRepository.update(fund.incBalance(sum));

      return updated;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async incReserve(sum: number) {
    try {
      let fund = await this.fundsRepository.find({ type: FundType.RESERVE });

      if (!fund) {
        fund = await this.create({
          type: FundType.RESERVE,
          title: FundTitle.RESERVE,
        });
      }

      const updated = await this.fundsRepository.update(fund.incBalance(sum));

      return updated;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async decReserve(sum: number) {
    try {
      let fund = await this.fundsRepository.find({ type: FundType.RESERVE });

      if (!fund) {
        fund = await this.create({
          type: FundType.RESERVE,
          title: FundTitle.RESERVE,
        });
      }

      const updated = await this.fundsRepository.update(fund.decBalance(sum));

      return updated;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async createReserveItem(
    dto: ReserveFundItemCreateRequestDto
  ): Promise<ReserveFundItemEntity> {
    try {
      const newFundItem = new ReserveFundItemEntity({
        ...dto,
        endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
      });

      return await this.reserveFundItemsRepository.create(newFundItem);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async findReserveItem(
    condition: FilterQuery<ReserveFundItem>
  ): Promise<ReserveFundItemEntity | null> {
    try {
      const fundItem = await this.reserveFundItemsRepository.find(condition);

      return fundItem;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async deleteReserveItem(
    condition: FilterQuery<ReserveFundItem>
  ): Promise<{ deleted: boolean }> {
    try {
      const result = await this.reserveFundItemsRepository.delete(condition);

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async setIsReturnReserveItem(
    condition: FilterQuery<ReserveFundItem>,
    updateData: { isReturned: boolean }
  ): Promise<ReserveFundItemEntity> {
    try {
      const fundItem = await this.findReserveItem(condition);

      if (!fundItem) {
        throw new NotFoundException('Элемент резервного фонда не найден');
      }

      const result = await this.reserveFundItemsRepository.update(
        fundItem.setIsReturned(updateData.isReturned)
      );

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }
}
