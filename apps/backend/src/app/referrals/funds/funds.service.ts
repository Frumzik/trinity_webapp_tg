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
  ReferralReserveExpiredEvent,
  ReferralEvents,
  ReserveFundItemCreateRequestDto,
  ReferralReserveStageReturnedEvent,
  ReserveFundItemType,
  ReferralReserveSubscriptionReturnedEvent,
  ReferralReserveDaysLeftEvent,
  PurchaseEvents,
  PurchasePractiseDoneEvent,
  PurchasePractiseAbortEvent,
  GetListOptions,
  PurchasePractiseAcceptEvent,
  CounterType,
} from '@trinity/shared';
import { FundEntity, ReserveFundItemEntity } from './entities';
import { Fund, ReserveFundItem } from './models';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CountersService } from '../../service';

@Injectable()
export class FundsService {
  constructor(
    private readonly fundsRepository: FundsRepository,
    private readonly reserveFundItemsRepository: ReserveFundItemsRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly countersService: CountersService
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

  async findAll(options?: GetListOptions<Fund>): Promise<FundEntity[]> {
    try {
      const funds = await this.fundsRepository.findAll(options);

      return funds;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async count(condition: FilterQuery<Fund>): Promise<number> {
    try {
      const count = await this.fundsRepository.count(condition);

      return count;
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
      let fund = await this.fundsRepository.find({ type: FundType.INVESTMENT });

      if (!fund) {
        fund = await this.create({
          type: FundType.INVESTMENT,
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
        reserveId: await this.countersService.saveNextSequence(
          CounterType.RESERVE_ID
        ),
      });

      await this.incReserve(dto.sum);

      console.log(newFundItem);

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

  async acceptReserveItem(
    condition: FilterQuery<ReserveFundItem>
  ): Promise<ReserveFundItemEntity | null> {
    try {
      const fundItem = await this.findReserveItem(condition);

      if (!fundItem) {
        throw new NotFoundException('Элемент не найден');
      }

      // Событие
      if (fundItem.type == ReserveFundItemType.PRACTISE) {
        await this.eventEmitter.emit(
          PurchaseEvents.PRACTISE_ACCEPT,
          new PurchasePractiseAcceptEvent(
            fundItem.userId,
            fundItem.trainingId as number
          )
        );
      }

      return await this.reserveFundItemsRepository.update(fundItem.accept());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async findReserveItemAll(
    options?: GetListOptions<ReserveFundItem>
  ): Promise<ReserveFundItemEntity[]> {
    try {
      const funds = await this.reserveFundItemsRepository.findAll(options);

      return funds;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async countReserveItemAll(
    condition: FilterQuery<ReserveFundItem> = {}
  ): Promise<number> {
    try {
      const count = await this.reserveFundItemsRepository.count(condition);

      return count;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async deleteReserveItem(
    condition: FilterQuery<ReserveFundItem>,
    extra?: { notify?: boolean }
  ): Promise<{ deleted: boolean }> {
    try {
      const fundItem = await this.findReserveItem(condition);

      if (!fundItem) {
        throw new NotFoundException('Элемент резервного фонда не найден');
      }

      const result = await this.reserveFundItemsRepository.delete(fundItem);

      await this.decReserve(fundItem.sum);
      await this.incMain(fundItem.sum);

      // Событие
      if (fundItem.type == ReserveFundItemType.PRACTISE) {
        if (extra?.notify) {
          await this.eventEmitter.emit(
            PurchaseEvents.PRACTISE_ABORT,
            new PurchasePractiseAbortEvent(
              fundItem.userId,
              fundItem.trainingId as number
            )
          );
        }
      } else {
        await this.eventEmitter.emit(
          ReferralEvents.RESERVE_EXPIRED,
          new ReferralReserveExpiredEvent(fundItem.userId, fundItem.sum)
        );
      }

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async returnReserveItem(
    condition: FilterQuery<ReserveFundItem>
  ): Promise<{ deleted: boolean }> {
    try {
      const fundItem = await this.findReserveItem(condition);

      if (!fundItem) {
        throw new NotFoundException('Элемент резервного фонда не найден');
      }

      const result = await this.reserveFundItemsRepository.delete(fundItem);

      await this.decReserve(fundItem.sum);

      // Событие
      if (fundItem.type == ReserveFundItemType.STAGE) {
        await this.eventEmitter.emit(
          ReferralEvents.RESERVE_STAGE_RETURNED,
          new ReferralReserveStageReturnedEvent(fundItem.userId, fundItem.sum)
        );
      } else if (fundItem.type == ReserveFundItemType.SUBSCRIPTION) {
        await this.eventEmitter.emit(
          ReferralEvents.RESERVE_SUBSCRIPTION_RETURNED,
          new ReferralReserveSubscriptionReturnedEvent(
            fundItem.userId,
            fundItem.sum
          )
        );
      } else if (fundItem.type == ReserveFundItemType.PRACTISE) {
        await this.eventEmitter.emit(
          PurchaseEvents.PRACTISE_DONE,
          new PurchasePractiseDoneEvent(
            fundItem.userId,
            fundItem.trainingId as number
          )
        );
      }

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async checkAndUpdateAll() {
    const fundItems = await this.reserveFundItemsRepository.findAll();

    const now = new Date();

    for (const fundItem of fundItems) {
      if (!fundItem.endDate) continue;

      const diffMs = fundItem.endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // осталось 3 дня
      if (diffDays == 3) {
        await this.eventEmitter.emit(
          ReferralEvents.RESERVE_DAYS_LEFT,
          new ReferralReserveDaysLeftEvent(
            fundItem.userId,
            fundItem.sum,
            diffDays
          )
        );
      } else if (fundItem.endDate <= now) {
        await this.deleteReserveItem(fundItem);
      }
    }
  }
}
