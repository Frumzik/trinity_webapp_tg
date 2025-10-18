import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { JWTAuthGuard, Roles, RolesGuard } from '../../service';
import {
  ContentAddLessonRequestDto,
  ContentAddLessonResponseDto,
  ContentAddTrainingRequestDto,
  ContentAddTrainingResponseDto,
  UserRole,
} from '@trinity/shared';
import { LessonEntity, TrainingEntity } from './entities';

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

  @Get('training/:id/structure')
  async infoStructureTraining(@Param('id') trainingId: number): Promise<TrainingEntity> {
    const training = await this.contentService.findStructureTraining({ trainingId });

    return training;
  }

  @Post('lesson/add')
  @Roles(UserRole.Admin, UserRole.Moderator)
  async addLesson(
    @Body() dto: ContentAddLessonRequestDto
  ): Promise<ContentAddLessonResponseDto> {
    const lessson = await this.contentService.createLesson(dto);

    return lessson;
  }

  @Get('lesson/:id')
  async infoLesson(@Param('id') lessonId: number): Promise<LessonEntity> {
    const lessson = await this.contentService.findLesson({ lessonId });

    return lessson;
  }
}
