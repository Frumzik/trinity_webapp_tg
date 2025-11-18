import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ReferralRegisteredEvent, RefferalEvents } from '@trinity/shared';
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
      partner.userId,
      `В вашей структуре появился новый единомышленник.\nПоколение: ${level}.\nСтруктура продолжает расти.
`
    );
  }
}
