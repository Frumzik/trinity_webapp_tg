import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { LessonType, TrainingType } from './content.interface.js';
import { Type } from 'class-transformer';
export class ContentAddTrainingRequestDto {
  @IsString({ message: 'Название должно быть строкой' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'ID родителя должно быть числом или null' })
  parentId?: number;

  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @IsEnum(TrainingType)
  type!: TrainingType;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Цена должна быть целым числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price?: number;
}

export class ContentAddTrainingResponseDto {
  trainingId!: number;
}

// Добавление урока
// 🎥 Видео контент
export class LessonVideoContentDto {
  @IsString()
  videoUrl!: string;

  @IsOptional()
  @IsInt()
  duration?: number;
}

// 🎧 Аудио контент
export class LessonAudioContentDto {
  @IsString()
  audioUrl!: string;

  @IsOptional()
  @IsInt()
  duration?: number;
}

// 📖 Текстовый контент
export class LessonTextContentDto {
  @IsString()
  html!: string;
}

export class ContentAddLessonRequestDto {
  @IsString({ message: 'Название должно быть строкой' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @Type(() => Number)
  @IsInt({ message: 'ID родителя должно быть числом' })
  parentId!: number;

  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @IsEnum(LessonType)
  type!: LessonType;

  // 📖 Для текстового урока
  @ValidateIf((o) => o.type === LessonType.TEXT)
  @IsString({ message: 'HTML должен быть строкой' })
  @IsNotEmpty({ message: 'HTML не может быть пустым' })
  html!: string;

  // 🎯 Универсальное поле content
  @ValidateNested()
  @Type(() => Object) // ← временная подмена типа
  content!:
    | LessonVideoContentDto
    | LessonAudioContentDto
    | LessonTextContentDto;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'Цена должна быть целым числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price?: number;
}

export class ContentAddLessonResponseDto {
  lessonId!: number;
}
