/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../../account';
import { NotificationsService } from '../../notifications';
import { sanitizeTelegramHtml } from '../../service';

@Injectable()
export class AdminMailingService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService
  ) {}

  /**
   * CREATE
   */
  async create(data: { text: string }) {
    const users = await this.usersService.findAll();

    const message = sanitizeTelegramHtml(data.text);

    for (const user of users) {
      await this.notificationsService.sendBotMessage(
        user.tgId as number,
        message,
        true
      );
    }

    return { id: 0, data: { id: 0 } };
  }
}
