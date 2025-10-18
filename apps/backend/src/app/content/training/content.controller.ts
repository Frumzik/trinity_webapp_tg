import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { JWTAuthGuard, Roles, RolesGuard } from '../../service';
import {
  ContentAddTrainingRequestDto,
  ContentAddTrainingResponseDto,
  UserRole,
} from '@trinity/shared';
import { TrainingEntity } from './entities';

@Controller('content')
@UseGuards(JWTAuthGuard, RolesGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('training/add')
  @Roles(UserRole.Admin, UserRole.Moderator)
  async addTraining(
    @Body() dto: ContentAddTrainingRequestDto
  ): Promise<ContentAddTrainingResponseDto> {
    const training = await this.contentService.createTraining(dto);

    return training;
  }

  @Get('training/:id')
  async infoTraining(@Param('id') trainingId: number): Promise<TrainingEntity> {
    const training = await this.contentService.findTraining({ trainingId });

    return training;
  }
}
