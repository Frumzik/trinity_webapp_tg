import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { PurchaseCreateRequestDto } from '@trinity/shared';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';

@Controller('purchase')
@ApiTags('purchase')
@ApiBearerAuth('access_token')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post('add')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Добавить покупку' })
  @ApiResponse({
    status: 201,
    type: Boolean,
    description: 'Статус добавления',
  })
  async add(
    @UserId() userId: number,
    @Body() dto: PurchaseCreateRequestDto
  ): Promise<boolean> {
    return await this.purchaseService.create(userId, dto);
  }
}
