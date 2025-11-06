import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { ReferralsRepository } from './repositories';
import { ReferralEntity } from './entities';
import { Referral } from './models';
import { IReferral } from '@trinity/shared';

@Injectable()
export class ReferralsService {
  constructor(private readonly referralsRepository: ReferralsRepository) {}

  async create(dto: IReferral): Promise<ReferralEntity> {
    try {
      const newReferral = new ReferralEntity(dto);

      return await this.referralsRepository.create(newReferral);
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

  async delete(
    condition: FilterQuery<Referral>
  ): Promise<{ deleted: boolean }> {
    try {
      const result = await this.referralsRepository.delete(condition);

      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ошибка при удалении реферала';
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
}
