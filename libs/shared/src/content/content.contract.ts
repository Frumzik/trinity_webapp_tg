import {
  IsDate,
  IsEnum,
  IsInt,
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
  TrainingTag,
} from './content.interface.js';
import {
  LearningAccessStatus,
  LearningProgressStatus,
} from '../learning/learning.interface.js';
import { FavoritesTag } from '../favorites/favorites.interface.js';

// ─────────────────────────────────────────────
// TRAINING: CREATE / INFO / UPDATE
// ─────────────────────────────────────────────
export class ContentAddTrainingRequestDto implements Partial<ITraining> {
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
    description: 'Краткое описание тренинга',
    example: 'Информация',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    description: 'ID наставника',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'null' || value === null ? null : Number(value)
  )
  @IsInt()
  merchantId?: number | null;

  // Если ступень
  @ApiPropertyOptional({
    description: 'Номер ступени',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  stage?: number;

  @ApiPropertyOptional({
    description: 'Номер уровня ступени',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  stageLevel?: number;

  @ApiPropertyOptional({
    description: 'Url обложки',
    example: 'https://...',
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional({
    description: 'Url фона',
    example: 'https://...',
  })
  @IsOptional()
  @IsString()
  bgUrl?: string;

  @ApiPropertyOptional({
    description: 'Url иконки',
    example: 'https://...',
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({
    description: 'Длительность',
    example: '10 мин',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({
    description: 'Ссылка',
    example: 'https://...',
  })
  @IsOptional()
  @IsString()
  link?: string;

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
    example: TrainingType.TRAINING,
  })
  @IsEnum(TrainingType)
  type!: TrainingType;

  @ApiProperty({
    description: 'Тэг тренинга',
    enum: TrainingTag,
    example: TrainingTag.STANDART,
  })
  @IsEnum(TrainingTag)
  tag!: TrainingTag;

  @ApiProperty({
    description: 'Тип тренинга',
    enum: FavoritesTag,
    example: FavoritesTag.STANDART,
  })
  @IsEnum(FavoritesTag)
  favoritesTag!: FavoritesTag;

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

  @ApiPropertyOptional({
    description: 'Цена тренинга со скидкой',
    example: null,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salePrice?: number;

  @ApiProperty({ description: 'Правила доступа', type: () => [Object] })
  @IsOptional()
  accessRules?: TypeContentAccess[];
}

export class ContentTrainingInfoResponseDto implements ITraining {
  @ApiProperty({ description: 'ID Mongo документа' })
  _id?: Types.ObjectId;

  @ApiProperty({ description: 'ID тренинга', example: 1 })
  trainingId!: number;

  @ApiProperty({ description: 'Тип тренинга', enum: TrainingType })
  type!: TrainingType;

  @ApiProperty({ description: 'Тэг тренинга', enum: TrainingTag })
  tag!: TrainingTag;

  @ApiProperty({ description: 'Тип избранного', enum: FavoritesTag })
  favoritesTag!: FavoritesTag;

  // Наставник
  @ApiProperty({ description: 'ID наставника', example: 1, nullable: true })
  merchantId!: number | null;

  // Если ступень
  @ApiPropertyOptional({ description: 'Номер ступени', example: 1 })
  stage?: number;

  @ApiPropertyOptional({ description: 'Номер уровня ступени', example: 1 })
  stageLevel?: number;

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
    description: 'Ссылка',
    example: 'Основные практики медитации',
  })
  link!: string | null;

  @ApiPropertyOptional({
    description: 'Короткое описание',
    example: 'Информация',
  })
  shortDescription!: string | null;

  @ApiPropertyOptional({
    description: 'Длительность',
    example: '10 мин',
  })
  duration!: string | null;

  @ApiPropertyOptional({
    description: 'Обложка',
    example: 'https://cdn.site/cover.jpg',
  })
  coverUrl!: string | null;

  @ApiPropertyOptional({
    description: 'Иконка',
    example: 'https://cdn.site/icon.jpg',
  })
  iconUrl!: string | null;

  @ApiPropertyOptional({
    description: 'Обложка',
    example: 'https://cdn.site/bg.jpg',
  })
  bgUrl!: string | null;

  @ApiProperty({ description: 'Правила доступа', type: () => [Object] })
  accessRules!: TypeContentAccess[];

  @ApiProperty({ description: 'Цена', example: 500 })
  price!: number | null;

  @ApiProperty({ description: 'Цена со скидкой', example: null })
  salePrice!: number | null;

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
}

export class LessonAudioContentDto {
  @ApiProperty({
    description: 'Ссылка на аудио',
    example: 'https://cdn.site/audio.mp3',
  })
  @IsString()
  audioUrl!: string;
}

export class LessonTextContentDto {
  @ApiProperty({
    description: 'HTML контент урока',
    example: '<p>Привет, это текстовый урок!</p>',
  })
  @IsString()
  html!: string;
}

export class LessonFilmContentDto {
  @ApiProperty({
    description: 'HTML контент видео - урока',
    example: '<p>Привет, это текстовый урок!</p>',
  })
  @IsString()
  html!: string;
}

export class LessonPractiseContentDto {
  @ApiProperty({
    description: 'HTML контент видео - урока',
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

  @ApiPropertyOptional({
    description: 'Короткое описание урока',
    example: 'Практика',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    description: 'Длительность урока',
    example: '10 min',
  })
  @IsOptional()
  @IsString()
  duration?: string;

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

  @ApiProperty({
    description: 'Тэг избранного',
    enum: FavoritesTag,
    example: FavoritesTag.STANDART,
  })
  @IsEnum(FavoritesTag)
  favoritesTag!: FavoritesTag;

  @ValidateNested()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Type(({ object }: any) => {
    switch (object?.type) {
      case LessonType.VIDEO:
        return LessonVideoContentDto;
      case LessonType.AUDIO:
        return LessonAudioContentDto;
      case LessonType.TEXT:
        return LessonTextContentDto;
      case LessonType.FILM:
        return LessonFilmContentDto;
      case LessonType.PRACTISE:
        return LessonPractiseContentDto;
      default:
        return LessonTextContentDto;
    }
  })
  content?:
    | LessonVideoContentDto
    | LessonAudioContentDto
    | LessonTextContentDto
    | LessonFilmContentDto
    | LessonPractiseContentDto;

  @ApiPropertyOptional({ description: 'Цена урока', example: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Цена со скидкой', nullable: true })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({
    description: 'Url обложки',
    example: 'https://...',
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional({
    description: 'Url иконки',
    example: 'https://...',
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({
    description: 'Url иконки',
    example: 'https://...',
  })
  @IsOptional()
  @IsString()
  bgUrl?: string;

  @ApiProperty({ description: 'Правила доступа', type: () => [Object] })
  @IsOptional()
  accessRules?: TypeContentAccess[];
}

export class ContentLessonInfoResponseDto implements ILesson {
  @ApiProperty({ description: 'ID Mongo документа' })
  _id?: Types.ObjectId;

  @ApiProperty({ description: 'ID урока', example: 12 })
  lessonId!: number;

  @ApiProperty({ description: 'Тип урока', enum: LessonType })
  type!: LessonType;

  @ApiProperty({ description: 'Тип избранного', enum: FavoritesTag })
  favoritesTag!: FavoritesTag;

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
    description: 'Короткое описание',
    example: 'Практика',
  })
  shortDescription!: string | null;

  @ApiPropertyOptional({
    description: 'Длительность',
    example: '15 min',
  })
  duration!: string | null;

  @ApiPropertyOptional({
    description: 'Контент урока',
    oneOf: [
      { $ref: getSchemaPath(LessonVideoContentDto) },
      { $ref: getSchemaPath(LessonAudioContentDto) },
      { $ref: getSchemaPath(LessonTextContentDto) },
      { $ref: getSchemaPath(LessonFilmContentDto) },
    ],
  })
  content?: ILessonContent | null;

  @ApiPropertyOptional({
    description: 'URL обложки',
    example: 'https://cdn.site/cover.png',
  })
  coverUrl!: string | null;

  @ApiPropertyOptional({
    description: 'URL иконки',
    example: 'https://cdn.site/icon.png',
  })
  iconUrl!: string | null;

  @ApiPropertyOptional({
    description: 'URL фона',
    example: 'https://cdn.site/bg.png',
  })
  bgUrl!: string | null;

  @ApiProperty({ description: 'Правила доступа', type: () => [Object] })
  accessRules!: TypeContentAccess[];

  @ApiPropertyOptional({ description: 'Цена', example: 100 })
  price!: number | null;

  @ApiPropertyOptional({ description: 'Цена со скидкой', example: null })
  salePrice!: number | null;

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
    description: 'Короткое описание',
    example: 'Краткое описание курса',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    description: 'Длительность тренинга',
    example: '30 мин',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  // Картинки
  @ApiPropertyOptional({
    description: 'URL обложки',
    example: 'https://cdn.site/new-cover.png',
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional({
    description: 'URL иконки',
    example: 'https://cdn.site/new-icon.png',
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({
    description: 'URL фона',
    example: 'https://cdn.site/new-bg.png',
  })
  @IsOptional()
  @IsString()
  bgUrl?: string;

  // Наставник
  @ApiPropertyOptional({ description: 'ID наставника', example: 123 })
  @IsOptional()
  @IsInt()
  merchantId?: number;

  // Цены
  @ApiPropertyOptional({ description: 'Цена', example: 300 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Цена со скидкой', example: 250 })
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  // Ступени
  @ApiPropertyOptional({ description: 'Ступень', example: 2 })
  @IsOptional()
  @IsInt()
  stage?: number;

  @ApiPropertyOptional({ description: 'Уровень ступени', example: 1 })
  @IsOptional()
  @IsInt()
  stageLevel?: number;

  // SELECT поля
  @ApiPropertyOptional({ description: 'Тип тренинга', enum: TrainingType })
  @IsOptional()
  @IsEnum(TrainingType)
  type?: TrainingType;

  @ApiPropertyOptional({ description: 'Тэг тренинга', enum: TrainingTag })
  @IsOptional()
  @IsEnum(TrainingTag)
  tag?: TrainingTag;

  @ApiPropertyOptional({ description: 'Тэг избранного', enum: FavoritesTag })
  @IsOptional()
  @IsEnum(FavoritesTag)
  favoritesTag?: FavoritesTag;
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
      { $ref: getSchemaPath(LessonFilmContentDto) },
      { $ref: getSchemaPath(LessonPractiseContentDto) },
    ],
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  content?:
    | LessonVideoContentDto
    | LessonAudioContentDto
    | LessonTextContentDto
    | LessonFilmContentDto
    | LessonPractiseContentDto;

  @ApiPropertyOptional({
    description: 'Короткое описание',
    example: 'Краткое описание',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    description: 'Длительность урока',
    example: '30 мин',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  // Картинки
  @ApiPropertyOptional({
    description: 'URL иконки',
    example: 'https://cdn.site/new-icon.png',
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({
    description: 'URL фона',
    example: 'https://cdn.site/new-bg.png',
  })
  @IsOptional()
  @IsString()
  bgUrl?: string;

  // Цены
  @ApiPropertyOptional({ description: 'Цена со скидкой', example: 250 })
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @ApiPropertyOptional({ description: 'Тэг избранного', enum: FavoritesTag })
  @IsOptional()
  @IsEnum(FavoritesTag)
  favoritesTag?: FavoritesTag;
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

export class ContentAccessTrainingPurchasedDto extends ContentAccessBaseDto {
  @ApiProperty({
    description: 'ID тренинга, который должен быть куплен',
    example: 5,
  })
  @ValidateIf((o) => o.type === ContentAccessType.TRAINING_PURCHASED)
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
          name: ContentAccessType.TRAINING_PURCHASED,
          value: ContentAccessTrainingPurchasedDto,
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
