import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { FavoriteType } from './favorites.interface.js';
import { ILesson, ITraining } from '../content/content.interface.js';

//
// 📦 DTO для добавления избранного
//
export class FavoriteAddRequestDto {
  @ApiProperty({
    description: 'Тип избранного',
    enum: FavoriteType,
    example: FavoriteType.LESSON,
  })
  @IsEnum(FavoriteType)
  type!: FavoriteType;

  @ApiPropertyOptional({
    description: 'ID тренинга (если избранное — тренинг)',
    example: 101,
  })
  @IsOptional()
  @IsInt()
  trainingId?: number;

  @ApiPropertyOptional({
    description: 'ID урока (если избранное — урок)',
    example: 205,
  })
  @IsOptional()
  @IsInt()
  lessonId?: number;
}

//
// 📦 DTO для ответа
//
export class FavoriteInfoResponseDto {
  @ApiPropertyOptional({
    description: 'Mongo ObjectId избранного',
    type: String,
    example: '6727b8cfe4dcf9b1f8c2a123',
  })
  _id?: Types.ObjectId;

  @ApiProperty({
    description: 'ID избранного (числовой)',
    example: 12,
  })
  favoriteId!: number;

  @ApiProperty({
    description: 'ID пользователя',
    example: 42,
  })
  userId!: number;

  @ApiProperty({
    description: 'Тип избранного',
    enum: FavoriteType,
    example: FavoriteType.LESSON,
  })
  type!: FavoriteType;

  @ApiPropertyOptional({
    description: 'ID тренинга, если избранное относится к тренингу',
    example: 101,
  })
  trainingId?: number;

  @ApiPropertyOptional({
    description: 'ID урока, если избранное относится к уроку',
    example: 205,
  })
  lessonId?: number;

  @ApiPropertyOptional({
    description: 'Объект тренинга (если включен populate)',
    type: () => Object, // можно заменить на DTO, если он есть
  })
  training?: Types.ObjectId | ITraining;

  @ApiPropertyOptional({
    description: 'Объект урока (если включен populate)',
    type: () => Object, // можно заменить на DTO, если он есть
  })
  lesson?: Types.ObjectId | ILesson;
}


export class FavoriteDeleteRequestDto {
  @ApiProperty()
  @IsNumber()
  favoriteId!: number;
}
