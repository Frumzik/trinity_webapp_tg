/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  GetListOptions,
  PurchaseEvents,
  PurchasePractiseDoneEvent,
  ReserveFundItemCreateRequestDto,
  ReserveFundItemType,
} from '@trinity/shared';
import { FundsService, ReserveFundItem } from '../../referrals';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AdminPractiseService {
  constructor(
    private readonly fundsService: FundsService,
    private readonly eventEmitter: EventEmitter2
  ) {}
  /**
   * LIST: фильтры + сортировка + пагинация
   */
  async getList(params: GetListOptions<ReserveFundItem>) {
    try {
      // Параметры для findAll
      const options = {
        ...params,
        filter: {
          ...params.filter,
          type: ReserveFundItemType.PRACTISE,
        },
      };

      const items = await this.fundsService.findReserveItemAll(options);
      const total = await this.fundsService.countReserveItemAll({
        type: ReserveFundItemType.PRACTISE,
      });

      return {
        items: items.map((u) => ({ ...u, id: u.reserveId })), // React-admin требует поле id
        total,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Failed to load reserves');
    }
  }

  /**
   * GET ONE
   */
  async getOne(id: string | number) {
    // Преобразуем id в number
    const reserveId = typeof id === 'string' ? parseInt(id) : id;

    const reserve = await this.fundsService.findReserveItem({ reserveId });

    if (!reserve) {
      throw new NotFoundException(
        `Заявка на практику с id=${reserveId} не найдена`
      );
    }

    // Возвращаем в формате React-Admin
    return {
      ...reserve,
      id: reserve.reserveId, // React-Admin требует поле id
    };
  }

  /**
   * CREATE
   */
  async create(data: Partial<ReserveFundItem>) {
    const reserve = await this.fundsService.createReserveItem(
      data as ReserveFundItemCreateRequestDto
    );

    if (!reserve) {
      throw new Error('Ошибка создания заявки на практику');
    }

    return {
      id: reserve.reserveId,
      data: { ...reserve, id: reserve.reserveId },
    };
  }

  /**
   * UPDATE
   */
  async update(
    id: string | number,
    data: Partial<ReserveFundItem> & { done: boolean }
  ) {
    const reserveId = typeof id === 'string' ? parseInt(id) : id;

    let reserve = await this.fundsService.findReserveItem({ reserveId });

    if (!reserve) {
      throw new NotFoundException(
        `Заявка на практику с id=${reserveId} не найдена`
      );
    }

    // Обновления
    if (data.accepted === true && data.done == undefined) {
      reserve = await this.fundsService.acceptReserveItem({ reserveId });
    }

    // Обновления
    if (data.done == true && data.userId && data.trainingId) {
      await this.eventEmitter.emit(
        PurchaseEvents.PRACTISE_DONE,
        new PurchasePractiseDoneEvent(+data.userId, +data.trainingId)
      );
    }

    return { id: reserveId, data: { ...reserve, id: reserveId } };
  }

  /**
   * DELETE
   */
  async delete(id: string | number) {
    const reserveId = typeof id === 'string' ? parseInt(id) : id;

    const reserve = await this.fundsService.findReserveItem({ reserveId });

    if (!reserve) {
      throw new NotFoundException(
        `Заявка на практику с id=${reserveId} не найдена`
      );
    }

    const { deleted } = await this.fundsService.deleteReserveItem(
      {
        reserveId,
      },
      { notify: true }
    );

    if (!deleted) {
      throw new Error('Ошибка удаления заявки на практику');
    }

    return { id: reserveId, data: { id: reserveId } };
  }
}
