import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LearningService } from './learning.service';
import { JWTAuthGuard, Roles, UserId } from '../../service';
import { ITraining, UserRole } from '@trinity/shared';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}
  @Post('recalculate-all')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
  async recalculateAll(): Promise<boolean> {
    return await this.learningService.recalculateAll();
  }

  @Get('training/tree')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
  async findAll(
    @UserId() userId: number
  ): Promise<ITraining[] | ITraining | null> {
    return await this.learningService.getLearningTree({ userId });
  }

  @Get('training/:id/tree')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
  async findTraining(
    @UserId() userId: number,
    @Param('id') trainingId: number
  ): Promise<ITraining[] | ITraining | null> {
    return await this.learningService.getLearningTree({ userId, trainingId });
  }
}
