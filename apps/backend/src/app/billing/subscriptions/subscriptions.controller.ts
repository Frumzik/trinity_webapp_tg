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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Subscription')
@ApiBearerAuth('access_token') // 🔐 чтобы Swagger знал, что нужно авторизоваться
@Controller('subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Получить информацию о подписке пользователя' })
  @ApiResponse({
    status: 200,
    type: SubscriptionInfoResponseDto,
    description: 'Информация о текущей подписке пользователя',
  })
  @ApiResponse({ status: 404, description: 'Подписка не найдена' })
  @ApiQuery({
    name: 'populate',
    required: false, // 👈 необязательный query-параметр
    type: Boolean,
    description: 'Если true — вернуть подписку с полной информацией (populate)',
    example: true,
  })
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
