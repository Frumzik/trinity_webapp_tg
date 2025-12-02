import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { ITransaction, TransactionType } from '@trinity/shared';

@Controller('transactions')
@ApiTags('transactions')
@ApiBearerAuth('access_token')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Получить все транзакции' })
  @ApiResponse({
    status: 200,
    description: 'Транзакции',
  })
  @ApiQuery({
    name: 'populate',
    required: false,
    type: Boolean,
    description: 'Если true — вернуть данные с полной информацией (populate)',
    example: false,
  })
  async add(
    @UserId() userId: number,
    @Query('populate') populate?: boolean
  ): Promise<ITransaction[]> {
    return await this.transactionsService.findAll({
      filter: { userId, type: { $ne: TransactionType.FUND } },
      populate: populate ? ['user'] : [],
    });
  }
}
