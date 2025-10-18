import {
  IsString,
} from 'class-validator';

export class ContentAddTrainingRequestDto {
  @IsString({ message: 'Название должно быть строкой' })
  title!: string;
}

export class ContentAddTrainingResponseDto {
  trainingId!: number;
}
