import {
  Controller,
  Get,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionInfoResponseDto } from '@trinity/shared';

@Controller('subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('')
  @UseGuards(JWTAuthGuard)
  async info(
    @UserId() userId: number,
    @Query('populate') populate?: boolean
  ): Promise<SubscriptionInfoResponseDto> {
    const subscription = populate
      ? await this.subscriptionsService.populate({ userId })
      : await this.subscriptionsService.find({ userId });

    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }

    return subscription;
  }
}
