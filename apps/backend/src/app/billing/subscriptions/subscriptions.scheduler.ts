// subscription.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionScheduler {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // Проверяем каждый день в 10:00
  @Cron('0 10 * * *')
  async handleCron() {
    await this.subscriptionsService.checkAndUpdateAll();
  }
}
