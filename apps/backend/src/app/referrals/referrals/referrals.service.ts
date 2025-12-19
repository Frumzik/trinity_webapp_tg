import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { ReferralsRepository } from './repositories';
import { ReferralEntity } from './entities';
import { Referral } from './models';
import { UserEntity, UsersService } from '../../account';
import {
  IUser,
  ReferralRegisteredEvent,
  ReferralEvents,
  GetListOptions,
} from '@trinity/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ReferralsService {
  constructor(
    private readonly referralsRepository: ReferralsRepository,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(
    partner: UserEntity,
    referral: UserEntity
  ): Promise<ReferralEntity> {
    try {
      if (!partner?._id || !referral?._id) {
        throw new BadRequestException('Не указан partner или referral');
      }

      let level = 1;
      let currentPartner: UserEntity | null = partner;
      let firstLevelReferral: ReferralEntity | null = null;

      while (currentPartner && level <= 9) {
        const referralEntity = new ReferralEntity({
          partner: currentPartner._id,
          referral: referral._id,
          partnerId: currentPartner.userId,
          referralId: referral.userId,
          level,
          earn: 0,
        });

        const created = await this.referralsRepository.create(referralEntity);

        // Событие
        this.eventEmitter.emit(
          ReferralEvents.REGISTERED,
          new ReferralRegisteredEvent(
            currentPartner.userId,
            referral.userId,
            level
          )
        );

        if (level === 1) firstLevelReferral = created;

        level++;

        if (!currentPartner.referralPath) break;

        const pathParts = currentPartner.referralPath
          .split('/')
          .filter((p) => p);
        const parentIdStr = pathParts[pathParts.length - 1];
        const parentId = Number(parentIdStr);

        if (!parentId || parentId === currentPartner.userId) break;

        currentPartner = (await this.usersService.find({
          userId: parentId,
        })) as UserEntity;
      }

      if (!firstLevelReferral) {
        throw new InternalServerErrorException(
          'Ошибка создания реферала на первом уровне'
        );
      }

      return firstLevelReferral;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при создании Реферала';
      throw new InternalServerErrorException(message);
    }
  }

  async find(condition: FilterQuery<Referral>): Promise<ReferralEntity | null> {
    try {
      const referral = await this.referralsRepository.find(condition);

      return referral;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске реферала';
      throw new InternalServerErrorException(message);
    }
  }

  async findAll(options?: GetListOptions<Referral>): Promise<ReferralEntity[]> {
    try {
      const funds = await this.referralsRepository.findAll(options);

      return funds;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async count(condition: FilterQuery<Referral>): Promise<number> {
    try {
      const count = await this.referralsRepository.count(condition);

      return count;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async delete(
    condition: FilterQuery<Referral>
  ): Promise<{ deleted: boolean }> {
    try {
      const result = await this.referralsRepository.delete(condition);

      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при удалении реферала';
      throw new InternalServerErrorException(message);
    }
  }

  async populate(
    condition: FilterQuery<Referral>
  ): Promise<ReferralEntity | null> {
    try {
      const referral = await this.referralsRepository.populate(condition);

      return referral;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске реферала';
      throw new InternalServerErrorException(message);
    }
  }

  async incEarn(
    condition: FilterQuery<Referral>,
    updateData: { inc: number }
  ): Promise<ReferralEntity> {
    try {
      const referral = await this.find(condition);

      if (!referral) {
        throw new NotFoundException('Реферал не найден');
      }

      const updated = await this.referralsRepository.update(
        referral.incEarn(updateData.inc)
      );

      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске реферала';
      throw new InternalServerErrorException(message);
    }
  }

  async getReferralStats(
    partnerId: number
  ): Promise<{ level: number; count: number; totalEarn: number }[]> {
    try {
      const referral = await this.referralsRepository.getReferralStats(
        partnerId
      );

      return referral;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске реферала';
      throw new InternalServerErrorException(message);
    }
  }

  async getReferralList(partnerId: number): Promise<
    {
      level: number;
      totalEarn: number;
      referrals: { referralId: number; earn: number; user: IUser | null }[];
    }[]
  > {
    try {
      const referralList = await this.referralsRepository.getReferralList(
        partnerId
      );

      return referralList;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске реферала';
      throw new InternalServerErrorException(message);
    }
  }
}
