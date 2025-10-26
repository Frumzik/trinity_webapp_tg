import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  TypeContentAccess,
  ILesson,
  type ILessonContent,
  ITraining,
  LessonType,
  TrainingType,
  ContentAccessType,
} from './content.interface.js';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import {
  LearningAccessStatus,
  LearningProgressStatus,
} from '../learning/learning.interface.js';
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

export class ContentTrainingInfoResponseDto implements ITraining {
  _id?: Types.ObjectId;

  trainingId!: number;
  type!: TrainingType;

  // Вложенность
  lessons!: Types.ObjectId[] | ILesson[];
  childrens!: Types.ObjectId[] | ITraining[];
  parent!: Types.ObjectId | ITraining | null;

  lessonsId!: number[];
  childrensId!: number[];
  parentId!: number | null;

  // Метаданные
  title!: string | null;
  description!: string | null;
  coverUrl!: string | null;

  // Условия доступности
  accessRules!: TypeContentAccess[];
  price!: number | null;
  accessStatus?: LearningAccessStatus;
  progressStatus?: LearningProgressStatus;
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

export class ContentLessonInfoResponseDto implements ILesson {
  _id?: Types.ObjectId;

  lessonId!: number;
  type!: LessonType;

  // Вложенность
  parent!: Types.ObjectId | ITraining | null;
  parentId!: number | null;

  // Метаданные
  title!: string | null;
  description!: string | null;
  content?: ILessonContent | null;
  coverUrl!: string | null;

  // Условия доступности
  accessRules!: TypeContentAccess[];
  price!: number | null;
  accessStatus?: LearningAccessStatus;
  progressStatus?: LearningProgressStatus;
}

// training/update
export class ContentTrainingUpdateRequestDto {
  @IsOptional()
  @IsString({ message: 'title должно быть строкой' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'description должен быть строкой' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'coverUrl должен быть строкой' })
  coverUrl?: string;

  @IsOptional()
  @IsInt({ message: 'price должен быть числом' })
  price?: number;
}

// lesson/update
export class ContentLessonUpdateRequestDto {
  @IsOptional()
  @IsString({ message: 'title должно быть строкой' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'description должен быть строкой' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'coverUrl должен быть строкой' })
  coverUrl?: string;

  @IsOptional()
  @IsInt({ message: 'price должен быть числом' })
  price?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object) // ← временная подмена типа
  content?:
    | LessonVideoContentDto
    | LessonAudioContentDto
    | LessonTextContentDto;
}

export class ContentAccessBaseDto {
  @IsEnum(ContentAccessType, { message: 'Некорректный тип доступа' })
  type!: ContentAccessType;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;
}

export class ContentAccessDateUnlockDto extends ContentAccessBaseDto {
  @ValidateIf((o) => o.type === ContentAccessType.DATE_UNLOCK)
  @Type(() => Date)
  @IsDate({ message: 'value должно быть датой' })
  value!: Date;
}

export class ContentAccessTrainingCompletedDto extends ContentAccessBaseDto {
  @ValidateIf((o) => o.type === ContentAccessType.TRAINING_COMPLETED)
  @IsNumber({}, { message: 'value должно быть числом' })
  value!: number;
}

export class ContentAccessLessonCompletedDto extends ContentAccessBaseDto {
  @ValidateIf((o) => o.type === ContentAccessType.LESSON_COMPLETED)
  @IsNumber({}, { message: 'value должно быть числом' })
  value!: number;
}

// training/update/access-rules
export class ContentTrainingUpdateAccessRulesRequestDto {
  @ValidateNested({ each: true })
  @Type(() => ContentAccessBaseDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        {
          value: ContentAccessDateUnlockDto,
          name: ContentAccessType.DATE_UNLOCK,
        },
        {
          value: ContentAccessTrainingCompletedDto,
          name: ContentAccessType.TRAINING_COMPLETED,
        },
        {
          value: ContentAccessLessonCompletedDto,
          name: ContentAccessType.LESSON_COMPLETED,
        },
        { value: ContentAccessBaseDto, name: ContentAccessType.SUBSCRIPTION },
        {
          value: ContentAccessBaseDto,
          name: ContentAccessType.ONE_TIME_PAYMENT,
        },
        { value: ContentAccessBaseDto, name: ContentAccessType.FREE },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  accessRules!: ContentAccessBaseDto[];
}

// lesson/update/access-rules
export class ContentLessonUpdateAccessRulesRequestDto {
  @ValidateNested({ each: true })
  @Type(() => ContentAccessBaseDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        {
          value: ContentAccessDateUnlockDto,
          name: ContentAccessType.DATE_UNLOCK,
        },
        {
          value: ContentAccessTrainingCompletedDto,
          name: ContentAccessType.TRAINING_COMPLETED,
        },
        {
          value: ContentAccessLessonCompletedDto,
          name: ContentAccessType.LESSON_COMPLETED,
        },
        { value: ContentAccessBaseDto, name: ContentAccessType.SUBSCRIPTION },
        {
          value: ContentAccessBaseDto,
          name: ContentAccessType.ONE_TIME_PAYMENT,
        },
        { value: ContentAccessBaseDto, name: ContentAccessType.FREE },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  accessRules!: ContentAccessBaseDto[];
}
