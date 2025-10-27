import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';
import {
  TypeContentAccess,
  ILesson,
  ILessonContent,
  ITraining,
  LessonType,
  TrainingType,
  ContentAccessType,
} from './content.interface.js';
import {
  LearningAccessStatus,
  LearningProgressStatus,
} from '../learning/learning.interface.js';

// ─────────────────────────────────────────────
// TRAINING: CREATE / INFO / UPDATE
// ─────────────────────────────────────────────
export class ContentAddTrainingRequestDto {
  @ApiProperty({
    description: 'Название тренинга',
    example: 'Осознанность 101',
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    description: 'Описание тренинга',
    example: 'Базовый курс по осознанности',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'ID родительского тренинга (если вложенный)',
    example: null,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'null' || value === null ? null : Number(value)
  )
  @IsInt()
  parentId?: number;

  @ApiProperty({
    description: 'Тип тренинга',
    enum: TrainingType,
    example: TrainingType.STANDART,
  })
  @IsEnum(TrainingType)
  type!: TrainingType;

  @ApiPropertyOptional({
    description: 'Цена тренинга',
    example: 500,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price?: number;
}

export class ContentTrainingInfoResponseDto implements ITraining {
  @ApiProperty({ description: 'ID Mongo документа' })
  _id?: Types.ObjectId;

  @ApiProperty({ description: 'ID тренинга', example: 1 })
  trainingId!: number;

  @ApiProperty({ description: 'Тип тренинга', enum: TrainingType })
  type!: TrainingType;

  @ApiProperty({
    description: 'Уроки, входящие в тренинг',
    type: () => [Object],
    example: ['32asfsdfasd'],
  })
  lessons!: Types.ObjectId[] | ILesson[];

  @ApiProperty({
    description: 'Дочерние тренинги',
    type: () => [Object],
    example: ['32asfsdfasd'],
  })
  childrens!: Types.ObjectId[] | ITraining[];

  @ApiPropertyOptional({
    description: 'Родительский тренинг',
    type: () => Object,
    example: null,
  })
  parent!: Types.ObjectId | ITraining | null;

  @ApiProperty({ description: 'ID уроков', type: [Number] })
  lessonsId!: number[];

  @ApiProperty({ description: 'ID дочерних тренингов', type: [Number] })
  childrensId!: number[];

  @ApiPropertyOptional({
    description: 'ID родительского тренинга',
    example: null,
  })
  parentId!: number | null;

  @ApiProperty({
    description: 'Название тренинга',
    example: 'Осознанность 101',
  })
  title!: string | null;

  @ApiPropertyOptional({
    description: 'Описание',
    example: 'Основные практики медитации',
  })
  description!: string | null;

  @ApiPropertyOptional({
    description: 'Обложка',
    example: 'https://cdn.site/cover.jpg',
  })
  coverUrl!: string | null;

  @ApiProperty({ description: 'Правила доступа', type: () => [Object] })
  accessRules!: TypeContentAccess[];

  @ApiProperty({ description: 'Цена', example: 500 })
  price!: number | null;

  @ApiPropertyOptional({ enum: LearningAccessStatus })
  accessStatus?: LearningAccessStatus;

  @ApiPropertyOptional({ enum: LearningProgressStatus })
  progressStatus?: LearningProgressStatus;
}

// ─────────────────────────────────────────────
// LESSON: CREATE / INFO / UPDATE
// ─────────────────────────────────────────────

export class LessonVideoContentDto {
  @ApiProperty({
    description: 'Ссылка на видео',
    example: 'https://cdn.site/video.mp4',
  })
  @IsString()
  videoUrl!: string;

  @ApiPropertyOptional({ description: 'Длительность в секундах', example: 180 })
  @IsOptional()
  @IsInt()
  duration?: number;
}

export class LessonAudioContentDto {
  @ApiProperty({
    description: 'Ссылка на аудио',
    example: 'https://cdn.site/audio.mp3',
  })
  @IsString()
  audioUrl!: string;

  @ApiPropertyOptional({ description: 'Длительность в секундах', example: 120 })
  @IsOptional()
  @IsInt()
  duration?: number;
}

export class LessonTextContentDto {
  @ApiProperty({
    description: 'HTML контент урока',
    example: '<p>Привет, это текстовый урок!</p>',
  })
  @IsString()
  html!: string;
}

export class ContentAddLessonRequestDto {
  @ApiProperty({ description: 'Название урока', example: 'Введение в дыхание' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    description: 'Описание урока',
    example: 'Основные дыхательные практики',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID родительского тренинга', example: 1 })
  @Type(() => Number)
  @IsInt()
  parentId!: number;

  @ApiProperty({
    description: 'Тип урока',
    enum: LessonType,
    example: LessonType.VIDEO,
  })
  @IsEnum(LessonType)
  type!: LessonType;

  @ApiPropertyOptional({
    description: 'HTML (если урок текстовый)',
    example: '<p>Привет, это текстовый урок!</p>',
  })
  @ValidateIf((o) => o.type === LessonType.TEXT)
  @IsString()
  @IsNotEmpty()
  html?: string;

  @ValidateNested()
  @Type(() => Object)
  content!:
    | LessonVideoContentDto
    | LessonAudioContentDto
    | LessonTextContentDto;

  @ApiPropertyOptional({ description: 'Цена урока', example: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}

export class ContentLessonInfoResponseDto implements ILesson {
  @ApiProperty({ description: 'ID Mongo документа' })
  _id?: Types.ObjectId;

  @ApiProperty({ description: 'ID урока', example: 12 })
  lessonId!: number;

  @ApiProperty({ description: 'Тип урока', enum: LessonType })
  type!: LessonType;

  @ApiPropertyOptional({
    description: 'Родительский тренинг',
    type: () => Object,
  })
  parent!: Types.ObjectId | ITraining | null;

  @ApiPropertyOptional({ description: 'ID родительского тренинга', example: 1 })
  parentId!: number | null;

  @ApiProperty({ description: 'Название', example: 'Практика дыхания' })
  title!: string | null;

  @ApiPropertyOptional({
    description: 'Описание',
    example: 'Медитативное дыхание',
  })
  description!: string | null;

  @ApiPropertyOptional({
    description: 'Контент урока',
    oneOf: [
      { $ref: getSchemaPath(LessonVideoContentDto) },
      { $ref: getSchemaPath(LessonAudioContentDto) },
      { $ref: getSchemaPath(LessonTextContentDto) },
    ],
  })
  content?: ILessonContent | null;

  @ApiPropertyOptional({
    description: 'URL обложки',
    example: 'https://cdn.site/cover.png',
  })
  coverUrl!: string | null;

  @ApiProperty({ description: 'Правила доступа', type: () => [Object] })
  accessRules!: TypeContentAccess[];

  @ApiPropertyOptional({ description: 'Цена', example: 100 })
  price!: number | null;

  @ApiPropertyOptional({ enum: LearningAccessStatus })
  accessStatus?: LearningAccessStatus;

  @ApiPropertyOptional({ enum: LearningProgressStatus })
  progressStatus?: LearningProgressStatus;
}

// ─────────────────────────────────────────────
// UPDATE DTOs
// ─────────────────────────────────────────────

export class ContentTrainingUpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Новое название',
    example: 'Обновлённый тренинг',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Новое описание',
    example: 'Изменённое описание курса',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL новой обложки',
    example: 'https://cdn.site/new-cover.png',
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional({ description: 'Новая цена', example: 300 })
  @IsOptional()
  @IsInt()
  price?: number;
}

export class ContentLessonUpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Новое название',
    example: 'Обновлённый урок',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Новое описание',
    example: 'Изменённое описание урока',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Новая обложка',
    example: 'https://cdn.site/new-cover.png',
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional({ description: 'Новая цена', example: 50 })
  @IsOptional()
  @IsInt()
  price?: number;

  @ApiPropertyOptional({
    description: 'Новый контент урока',
    oneOf: [
      { $ref: getSchemaPath(LessonVideoContentDto) },
      { $ref: getSchemaPath(LessonAudioContentDto) },
      { $ref: getSchemaPath(LessonTextContentDto) },
    ],
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  content?:
    | LessonVideoContentDto
    | LessonAudioContentDto
    | LessonTextContentDto;
}

// ─────────────────────────────────────────────
// ACCESS RULES DTOs
// ─────────────────────────────────────────────

export class ContentAccessBaseDto {
  @ApiProperty({ enum: ContentAccessType, description: 'Тип доступа' })
  @IsEnum(ContentAccessType)
  type!: ContentAccessType;

  @ApiPropertyOptional({
    description: 'Описание условия доступа',
    example: 'Доступно для подписчиков',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ContentAccessDateUnlockDto extends ContentAccessBaseDto {
  @ApiProperty({
    description: 'Дата открытия контента',
    example: '2025-01-01T00:00:00.000Z',
  })
  @ValidateIf((o) => o.type === ContentAccessType.DATE_UNLOCK)
  @Type(() => Date)
  @IsDate()
  value!: Date;
}

export class ContentAccessTrainingCompletedDto extends ContentAccessBaseDto {
  @ApiProperty({
    description: 'ID тренинга, который должен быть завершён',
    example: 5,
  })
  @ValidateIf((o) => o.type === ContentAccessType.TRAINING_COMPLETED)
  @IsNumber()
  value!: number;
}

export class ContentAccessLessonCompletedDto extends ContentAccessBaseDto {
  @ApiProperty({
    description: 'ID урока, который должен быть завершён',
    example: 42,
  })
  @ValidateIf((o) => o.type === ContentAccessType.LESSON_COMPLETED)
  @IsNumber()
  value!: number;
}

export class ContentTrainingUpdateAccessRulesRequestDto {
  @ApiProperty({
    description: 'Правила доступа тренинга',
    type: [ContentAccessBaseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => ContentAccessBaseDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        {
          name: ContentAccessType.DATE_UNLOCK,
          value: ContentAccessDateUnlockDto,
        },
        {
          name: ContentAccessType.TRAINING_COMPLETED,
          value: ContentAccessTrainingCompletedDto,
        },
        {
          name: ContentAccessType.LESSON_COMPLETED,
          value: ContentAccessLessonCompletedDto,
        },
        { name: ContentAccessType.SUBSCRIPTION, value: ContentAccessBaseDto },
        {
          name: ContentAccessType.ONE_TIME_PAYMENT,
          value: ContentAccessBaseDto,
        },
        { name: ContentAccessType.FREE, value: ContentAccessBaseDto },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  accessRules!: ContentAccessBaseDto[];
}

export class ContentLessonUpdateAccessRulesRequestDto extends ContentTrainingUpdateAccessRulesRequestDto {}
