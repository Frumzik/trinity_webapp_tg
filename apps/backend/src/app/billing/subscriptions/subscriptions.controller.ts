import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { SubscriptionsService } from './subscriptions.service';
import { ISubscription } from '@trinity/shared';

@Controller('subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('info')
  @UseGuards(JWTAuthGuard)
  async info(@UserId() userId: number): Promise<ISubscription> {
    const subscription = await this.subscriptionsService.find({ userId });

    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }

    return subscription;
  }

  @Get('info/populate')
  @UseGuards(JWTAuthGuard)
  async infoPopulate(@UserId() userId: number): Promise<ISubscription> {
    const subscription = await this.subscriptionsService.populate({ userId });

    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }

    return subscription;
  }
}
