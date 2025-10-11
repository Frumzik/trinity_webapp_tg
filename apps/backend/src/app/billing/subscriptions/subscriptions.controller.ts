import { Controller, Get, UseGuards } from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { SubscriptionsService } from './subscriptions.service';
import { ISubscription } from '@trinity/shared';

@Controller('subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('info')
  @UseGuards(JWTAuthGuard)
  async info(@UserId() userId: number): Promise<ISubscription> {
    const subscription = await this.subscriptionsService.findSubscription({ userId });

    return subscription;
  }

  @Get('info-all')
  @UseGuards(JWTAuthGuard)
  async infoAll(
    @UserId() userId: number
  ): Promise<ISubscription> {
    const subscription = await this.subscriptionsService.findSubscriptionAll({ userId });

    return subscription;
  }
}
