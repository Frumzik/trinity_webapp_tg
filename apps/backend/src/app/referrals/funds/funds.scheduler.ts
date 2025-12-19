// subscription.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FundsService } from './funds.service';

@Injectable()
export class FundsScheduler {
  constructor(private readonly fundsService: FundsService) {}

  // Проверяем каждый день в 10:00
  @Cron('0 10 * * *')
  async handleCron() {
    await this.fundsService.checkAndUpdateAll();
  }
}
