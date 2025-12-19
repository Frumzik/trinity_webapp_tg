import { IsEnum, IsNumber } from 'class-validator';
import { LearningProgressStatus } from './learning.interface.js';
import { ApiProperty } from '@nestjs/swagger';

export class LearningLessonUpdateProgressRequestDto {
  @IsNumber()
  @ApiProperty({ description: 'ID урока' })
  lessonId!: number;

  @IsEnum(LearningProgressStatus)
  @ApiProperty({ description: 'Статус', enum: LearningProgressStatus })
  progressStatus!: LearningProgressStatus;
}
