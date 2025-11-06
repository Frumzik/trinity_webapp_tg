import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContentService } from './content.service';
import { JWTAuthGuard, Roles, RolesGuard } from '../../service';
import {
  ContentAddLessonRequestDto,
  ContentAddTrainingRequestDto,
  ContentLessonInfoResponseDto,
  ContentLessonUpdateAccessRulesRequestDto,
  ContentLessonUpdateRequestDto,
  ContentTrainingInfoResponseDto,
  ContentTrainingUpdateAccessRulesRequestDto,
  ContentTrainingUpdateRequestDto,
  TypeContentAccess,
  UserRole,
} from '@trinity/shared';

@ApiTags('Content')
@ApiBearerAuth('access_token')
@UseGuards(JWTAuthGuard, RolesGuard)
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // 📦 Добавление тренинга
  @Post('training/add')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @ApiOperation({ summary: 'Создать новый тренинг' })
  @ApiResponse({ status: 201, type: ContentTrainingInfoResponseDto })
  @ApiBody({ type: ContentAddTrainingRequestDto }) // 💡 только DTO
  async addTraining(
    @Body() dto: ContentAddTrainingRequestDto
  ): Promise<ContentTrainingInfoResponseDto> {
    return await this.contentService.createTraining(dto);
  }

  // 📘 Информация о тренинге
  @Get('training/:id')
  @ApiOperation({ summary: 'Получить информацию о тренинге' })
  @ApiResponse({ status: 200, type: ContentTrainingInfoResponseDto })
  @ApiResponse({ status: 404, description: 'Тренинг не найден' })
  @ApiQuery({
    name: 'populate',
    required: false,
    type: Boolean,
    description: 'Если true — вернуть тренинг с вложенными уроками',
    example: true,
  })
  async infoTraining(
    @Param('id') trainingId: number,
    @Query('populate') populate?: boolean
  ): Promise<ContentTrainingInfoResponseDto> {
    const training = populate
      ? await this.contentService.populateTraining({ trainingId })
      : await this.contentService.findTraining({ trainingId });

    if (!training) throw new NotFoundException('Тренинг не найден');
    return training;
  }

  // 🎥 Добавление урока
  @Post('lesson/add')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @ApiOperation({ summary: 'Создать новый урок' })
  @ApiResponse({ status: 201, type: ContentLessonInfoResponseDto })
  @ApiBody({ type: ContentAddLessonRequestDto }) // 💡 теперь только JSON DTO
  async addLesson(
    @Body() dto: ContentAddLessonRequestDto
  ): Promise<ContentLessonInfoResponseDto> {
    return this.contentService.createLesson(dto);
  }

  // 📄 Информация об уроке
  @Get('lesson/:id')
  @ApiOperation({ summary: 'Получить информацию об урок' })
  @ApiResponse({ status: 200, type: ContentLessonInfoResponseDto })
  @ApiResponse({ status: 404, description: 'Урок не найден' })
  @ApiQuery({
    name: 'populate',
    required: false,
    type: Boolean,
    description: 'Если true — вернуть урок с полной информацией (populate)',
    example: false,
  })
  async infoLesson(
    @Param('id') lessonId: number,
    @Query('populate') populate?: boolean
  ): Promise<ContentLessonInfoResponseDto> {
    const lesson = populate
      ? await this.contentService.populateLesson({ lessonId })
      : await this.contentService.findLesson({ lessonId });

    if (!lesson) throw new NotFoundException('Урок не найден');
    return lesson;
  }

  // 🗑 Удаление тренинга
  @Delete('training/:id')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @ApiOperation({ summary: 'Удалить тренинг' })
  @ApiResponse({ status: 200, description: 'true, если успешно удалено' })
  async deleteTraining(@Param('id') trainingId: number): Promise<boolean> {
    return await this.contentService.deleteTraining(trainingId);
  }

  // 🗑 Удаление урока
  @Delete('lesson/:id')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @ApiOperation({ summary: 'Удалить урок' })
  @ApiResponse({ status: 200, description: 'true, если успешно удалено' })
  async deleteLesson(@Param('id') lessonId: number): Promise<boolean> {
    return await this.contentService.deleteLesson(lessonId);
  }

  // ✏️ Обновление тренинга
  @Post('training/:id/update')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @ApiOperation({ summary: 'Обновить данные тренинга' })
  @ApiResponse({ status: 200, type: ContentTrainingInfoResponseDto })
  async updateTraining(
    @Param('id') trainingId: number,
    @Body() updateData: ContentTrainingUpdateRequestDto
  ): Promise<ContentTrainingInfoResponseDto> {
    return await this.contentService.updateTraining({ trainingId }, updateData);
  }

  // ✏️ Обновление урока
  @Post('lesson/:id/update')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @ApiOperation({ summary: 'Обновить данные урока' })
  @ApiResponse({ status: 200, type: ContentLessonInfoResponseDto })
  async updateLesson(
    @Param('id') lessonId: number,
    @Body() updateData: ContentLessonUpdateRequestDto
  ): Promise<ContentLessonInfoResponseDto> {
    return await this.contentService.updateLesson({ lessonId }, updateData);
  }

  // ⚙️ Обновление правил доступа тренинга
  @Post('training/:id/update/access-rules')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @ApiOperation({ summary: 'Обновить правила доступа тренинга' })
  @ApiResponse({ status: 200, type: ContentTrainingInfoResponseDto })
  async updateTrainingAccessRules(
    @Param('id') trainingId: number,
    @Body() updateData: ContentTrainingUpdateAccessRulesRequestDto
  ): Promise<ContentTrainingInfoResponseDto> {
    return await this.contentService.updateTrainingAccessRules(
      { trainingId },
      { accessRules: updateData.accessRules as unknown as TypeContentAccess[] }
    );
  }

  // ⚙️ Обновление правил доступа урока
  @Post('lesson/:id/update/access-rules')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @ApiOperation({ summary: 'Обновить правила доступа урока' })
  @ApiResponse({ status: 200, type: ContentLessonInfoResponseDto })
  async updateLessonAccessRules(
    @Param('id') lessonId: number,
    @Body() updateData: ContentLessonUpdateAccessRulesRequestDto
  ): Promise<ContentLessonInfoResponseDto> {
    return await this.contentService.updateLessonAccessRules(
      { lessonId },
      { accessRules: updateData.accessRules as unknown as TypeContentAccess[] }
    );
  }
}
