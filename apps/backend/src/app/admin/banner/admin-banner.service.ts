/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  BannerCreateRequestDto,
  BannerUpdateRequestDto,
  GetListOptions,
} from '@trinity/shared';
import { Banner, BannerEntity, BannersService } from '../../banners';

@Injectable()
export class AdminBannerService {
  constructor(private readonly bannersService: BannersService) {}
  /**
   * LIST: фильтры + сортировка + пагинация
   */
  async getList(params: GetListOptions<Banner>) {
    try {
      // Параметры для findAll
      const options = {
        ...params,
      };

      const items = await this.bannersService.findAll(options);
      const total = await this.bannersService.count();

      return {
        items: items.map((u) => ({ ...u, id: u.bannerId })), // React-admin требует поле id
        total,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Failed to load banners');
    }
  }

  /**
   * GET ONE
   */
  async getOne(id: string | number) {
    // Преобразуем id в number
    const bannerId = typeof id === 'string' ? parseInt(id) : id;

    const banner = await this.bannersService.find({ bannerId });

    if (!banner) {
      throw new NotFoundException(`Баннер с id=${bannerId} не найден`);
    }

    // Возвращаем в формате React-Admin
    return {
      ...banner,
      id: banner.bannerId, // React-Admin требует поле id
    };
  }

  /**
   * CREATE
   */
  async create(data: Partial<BannerEntity>) {
    const banner = await this.bannersService.create(
      data as BannerCreateRequestDto
    );

    if (!banner) {
      throw new Error('Ошибка создания баннера');
    }

    return { id: banner.bannerId, data: { ...banner, id: banner.bannerId } };
  }

  /**
   * UPDATE
   */
  async update(id: string | number, data: Partial<BannerEntity>) {
    const bannerId = typeof id === 'string' ? parseInt(id) : id;

    let banner = await this.bannersService.find({ bannerId });

    if (!banner) {
      throw new NotFoundException(`Баннер с id=${bannerId} не найден`);
    }

    // Обновления
    if (
      data.description !== undefined ||
      data.linkUrl !== undefined ||
      data.miniatureUrl !== undefined ||
      data.imageUrl !== undefined ||
      data.endDate !== undefined
    ) {
      banner = await this.bannersService.update(
        { bannerId },
        data as BannerUpdateRequestDto
      );
    }

    return { id: bannerId, data: { ...banner, id: bannerId } };
  }

  /**
   * DELETE
   */
  async delete(id: string | number) {
    const bannerId = typeof id === 'string' ? parseInt(id) : id;

    const banner = await this.bannersService.find({ bannerId });

    if (!banner) {
      throw new NotFoundException(`Баннер с id=${bannerId} не найден`);
    }
    const { deleted } = await this.bannersService.delete({ bannerId: +id });

    if (!deleted) {
      throw new Error('Ошибка удаления баннера');
    }

    return { id: bannerId, data: { id: bannerId } };
  }
}
