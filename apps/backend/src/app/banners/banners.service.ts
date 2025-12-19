import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BannersRepository } from './repositories';
import { CountersService } from '../service';
import { BannerEntity } from './entities';
import {
  BannerCreateRequestDto,
  BannerUpdateRequestDto,
  CounterType,
  GetListOptions,
} from '@trinity/shared';
import { FilterQuery } from 'mongoose';
import { Banner } from './models';

@Injectable()
export class BannersService {
  constructor(
    private readonly bannersRepository: BannersRepository,
    private readonly countersService: CountersService
  ) {}

  async create(dto: BannerCreateRequestDto): Promise<BannerEntity> {
    try {
      const newBanner = new BannerEntity({
        bannerId: await this.countersService.saveNextSequence(
          CounterType.BANNER_ID
        ),
        ...dto,
      });

      return await this.bannersRepository.create(newBanner);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при создании баннера';
      throw new InternalServerErrorException(message);
    }
  }

  async find(condition: FilterQuery<Banner>): Promise<BannerEntity | null> {
    try {
      const banner = await this.bannersRepository.find(condition);

      return banner;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске баннера';
      throw new InternalServerErrorException(message);
    }
  }

  async findAll(options?: GetListOptions<Banner>): Promise<BannerEntity[]> {
    try {
      const banners = await this.bannersRepository.findAll(options);

      return banners;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске баннера';
      throw new InternalServerErrorException(message);
    }
  }

  async count(condition: FilterQuery<Banner> = {}): Promise<number> {
    try {
      const count = await this.bannersRepository.count(condition);

      return count;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске баннера';
      throw new InternalServerErrorException(message);
    }
  }

  async update(
    condition: FilterQuery<Banner> = {},
    dto: BannerUpdateRequestDto
  ): Promise<BannerEntity> {
    try {
      let banner = await this.find(condition);

      if (!banner) {
        throw new NotFoundException('Баннер не найден');
      }

      banner = await this.bannersRepository.update(banner.update(dto));

      return banner;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске баннера';
      throw new InternalServerErrorException(message);
    }
  }

  async delete(condition: FilterQuery<Banner>): Promise<{ deleted: boolean }> {
    try {
      const result = await this.bannersRepository.delete(condition);

      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при удалении баннера';
      throw new InternalServerErrorException(message);
    }
  }

  async addViewedUser(
    condition: FilterQuery<Banner>,
    userId: number
  ): Promise<BannerEntity> {
    try {
      const banner = await this.find(condition);

      if (!banner) {
        throw new NotFoundException('Баннер не найден');
      }
      const result = await this.bannersRepository.update(
        banner.addViewedUser(userId)
      );

      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при удалении баннера';
      throw new InternalServerErrorException(message);
    }
  }
}
