import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ReferralBuyStageEvent,
  ReferralRegisteredEvent,
  RefferalEvents,
} from '@trinity/shared';
import { NotificationsService } from './notifications.service';
import { UsersService } from '../account';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService
  ) {}

  @OnEvent(RefferalEvents.REGISTERED)
  async onReferralRegistered({ partnerId, level }: ReferralRegisteredEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `В вашей структуре появился новый единомышленник.\nПоколение: ${level}.\nСтруктура продолжает расти.`
    );
  }

  @OnEvent(RefferalEvents.BUY_STAGE)
  async onReferralEarn({
    partnerId,
    level,
    sum,
    stageLevel,
    stage,
  }: ReferralBuyStageEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Ваш единомышленник в ${level} поколении открыл ${stageLevel}-${stage} Ступень Духа.\nВы получили +${sum} OM`
    );
  }

  @OnEvent(RefferalEvents.RESERVE)
  async onReserve({
    partnerId,
    level,
    sum,
    stageLevel,
    stage,
  }: ReferralBuyStageEvent) {
    const partner = await this.usersService.find({ userId: partnerId });

    if (!partner) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.notificationsService.sendBotMessage(
      partner.tgId as number,
      `Вы упустили вознаграждение ${sum} OM с ${level} поколения за открытие ${stageLevel}-${stage} Ступени Духа
Причина: не открыта ${stageLevel}-${stage} Ступень Духа
Вознаградение отправлено в Резервный Фонд (срок хранения: 33 дня).
Откройте Ступень Духа, чтобы вернуть упущенное вознаграждение обратно.`
    );
  }
}
