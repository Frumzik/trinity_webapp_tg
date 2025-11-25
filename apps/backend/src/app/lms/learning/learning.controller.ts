import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { LearningService } from './learning.service';
import { JWTAuthGuard, Roles, UserId } from '../../service';
import {
  ILearning,
  ITraining,
  LearningLessonUpdateProgressRequestDto,
  UserRole,
} from '@trinity/shared';

@ApiTags('Learning')
@ApiBearerAuth('access_token')
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  // 🔄 Пересчитать всё обучение
  @Post('recalculate-all')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Пересчитать весь прогресс обучения' })
  @ApiResponse({
    status: 200,
    description: 'Результат пересчёта прогресса',
    schema: { example: true },
  })
  async recalculateAll(): Promise<boolean> {
    return await this.learningService.recalculateAll();
  }

  // 📚 Получить всё дерево обучения для пользователя
  @Get('training')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Получить дерево всех тренингов пользователя' })
  @ApiQuery({
    name: 'depth',
    required: false,
    description: 'Глубина дерева. Если не указано — возвращается всё дерево',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Дерево тренингов и прогресс пользователя',
    type: Object, // 👈 Можно заменить на DTO, если есть
  })
  async findAll(
    @UserId() userId: number,
    @Query('depth') depth?: number
  ): Promise<ITraining[] | ITraining | null> {
    return await this.learningService.getLearningTree({ userId }, depth);
  }

  // 📘 Получить конкретный тренинг по ID
  @Get('training/:id')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Получить конкретный тренинг пользователя по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID тренинга',
    example: 5,
    type: Number,
  })
  @ApiQuery({
    name: 'depth',
    required: false,
    description: 'Глубина дерева. Если не указано — возвращается всё дерево',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о тренинге с прогрессом пользователя',
    type: Object, // 👈 Аналогично, можешь указать DTO при наличии
  })
  async findTraining(
    @UserId() userId: number,
    @Param('id') trainingId: number,
    @Query('depth') depth?: number
  ): Promise<ITraining[] | ITraining | null> {
    return await this.learningService.getLearningTree(
      { userId, trainingId },
      depth
    );
  }

  // 📘 Получить конкретный тренинг по ID
  @Get('current-stage')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Получить прогресс по текущей ступени' })
  @ApiResponse({
    status: 200,
    description: 'Информация о тренинге с прогрессом пользователя',
    type: Object,
  })
  async getCurrentStage(@UserId() userId: number): Promise<ITraining | null> {
    return await this.learningService.getCurrentStage(userId);
  }

  // 📘 Получить конкретный тренинг по ID
  @Post('lesson/update-progress')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Обновить прогресс по уроку' })
  @ApiResponse({
    status: 200,
    description: 'Объект прогресса',
    type: Object,
  })
  async updateLessonProgress(
    @UserId() userId: number,
    @Body() dto: LearningLessonUpdateProgressRequestDto
  ): Promise<ILearning> {
    return await this.learningService.updateLessonProgress(
      userId,
      dto.lessonId,
      dto.progressStatus
    );
  }
}
