import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JWTAuthGuard, UserId } from '../../service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IUser } from '@trinity/shared';

@Controller('referrals')
@UseGuards(JWTAuthGuard)
@ApiTags('referrals')
@ApiBearerAuth('access_token')
export class ReferralsController {
  constructor(private readonly referralsServce: ReferralsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику по уровням рефералки' })
  @ApiResponse({
    status: 200,
    description: 'Статистика рефералки',
    type: Object, // 👈 Можно заменить на DTO, если есть
  })
  async getReferralStats(
    @UserId() userId: number
  ): Promise<{ level: number; count: number; totalEarn: number }[]> {
    return await this.referralsServce.getReferralStats(userId);
  }

  @Get('list')
  @ApiOperation({ summary: 'Получить дерево рефералов' })
  @ApiResponse({
    status: 200,
    description: 'Дерево рефералов',
    type: Object, // 👈 Можно заменить на DTO, если есть
  })
  async getReferralList(@UserId() userId: number): Promise<
      {
        level: number;
        totalEarn: number;
        referrals: { referralId: number; earn: number; user: IUser | null }[];
      }[]
    >  {
    return await this.referralsServce.getReferralList(userId);
  }
}
