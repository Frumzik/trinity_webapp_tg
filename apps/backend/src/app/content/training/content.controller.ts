import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { JWTAuthGuard } from '../../service';
import {
  ContentAddTrainingRequestDto,
  ContentAddTrainingResponseDto,
} from '@trinity/shared';
import { TrainingEntity } from './entities';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('training/add')
  @UseGuards(JWTAuthGuard)
  async addTraining(
    @Body() dto: ContentAddTrainingRequestDto
  ): Promise<ContentAddTrainingResponseDto> {
    return await this.contentService.createTraining(dto);
  }

  @Get('training/:id')
  @UseGuards(JWTAuthGuard)
  async infoTraining(@Param('id') trainingId: number): Promise<TrainingEntity> {
    return await this.contentService.findTraining({ trainingId });
  }
}
