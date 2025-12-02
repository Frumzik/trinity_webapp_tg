/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FundType, GetListOptions } from '@trinity/shared';
import { Fund, FundEntity, FundsService } from '../../referrals/funds';
import { AcquiringService } from '../../billing';
import { FundWithdrawRequestDto } from './admin-fund.controller';

@Injectable()
export class AdminFundService {
  constructor(
    private readonly fundsService: FundsService,
    private readonly acquiringService: AcquiringService
  ) {}
  /**
   * LIST: фильтры + сортировка + пагинация
   */
  async getList(params: GetListOptions<Fund>) {
    try {
      // Параметры для findAll
      const options = {
        ...params,
        filter: {
          ...params.filter,
          $or: [
            {
              type: FundType.ADMIN,
            },
            {
              type: FundType.MAIN,
            },
          ],
        },
      };

      const items = await this.fundsService.findAll(options);
      const total = await this.fundsService.count();

      return {
        items: items.map((u) => ({ ...u, id: u.type })), // React-admin требует поле id
        total,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Failed to load funds');
    }
  }

  /**
   * GET ONE
   */
  async getOne(id: string | number) {
    // Преобразуем id в number
    const fundType = typeof id === 'string' ? parseInt(id) : id;

    const fund = await this.fundsService.find({ fundType });

    if (!fund) {
      throw new NotFoundException(`Фонд с id=${fundType} не найден`);
    }

    // Возвращаем в формате React-Admin
    return {
      ...fund,
      id: fund.type, // React-Admin требует поле id
    };
  }

  /**
   * CREATE
   */
  async create(data: FundWithdrawRequestDto) {
    await this.acquiringService.fundWithdraw(
      data.fundType as FundType,
      data.toAddress,
      data.amount
    );

    return { id: 0 };
  }

  /**
   * UPDATE
   */
  async update(id: string | number, data: Partial<FundEntity>) {
    return false;
  }

  /**
   * DELETE
   */
  async delete(id: string | number) {
    return false;
  }
}
