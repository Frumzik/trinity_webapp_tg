import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LearningService } from './learning.service';
import { JWTAuthGuard, Roles, UserId } from '../../service';
import { ILearning, UserRole } from '@trinity/shared';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}
  @Post('recalculate-all')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
  async recalculateAll(): Promise<boolean> {
    return await this.learningService.recalculateAll();
  }

  @Get('find-all')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
  async findAdll(@UserId() userId: number): Promise<ILearning[]> {
    return await this.learningService.findAll({ userId });
  }
}
