import { IsInt, IsOptional, IsString } from 'class-validator';

export class ContentAddTrainingRequestDto {
  @IsString({ message: 'Название должно быть строкой' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @IsOptional()
  @IsInt({ message: 'ID родителя должно быть числом или null' })
  parentId?: number | null;
}

export class ContentAddTrainingResponseDto {
  trainingId!: number;
}

export class ContentAddLessonRequestDto {
  @IsString({ message: 'Название должно быть строкой' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @IsInt({ message: 'ID родителя должно быть числом' })
  parentId!: number;
}

export class ContentAddLessonResponseDto {
  lessonId!: number;
}
