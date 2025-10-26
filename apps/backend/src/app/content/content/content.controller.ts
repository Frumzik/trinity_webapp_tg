import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { JWTAuthGuard, Roles, RolesGuard, S3Service } from '../../service';
import {
  ContentAddLessonRequestDto,
  ContentAddTrainingRequestDto,
  ContentLessonInfoResponseDto,
  ContentLessonUpdateAccessRulesRequestDto,
  ContentLessonUpdateRequestDto,
  ContentTrainingInfoResponseDto,
  ContentTrainingUpdateAccessRulesRequestDto,
  ContentTrainingUpdateRequestDto,
  LessonType,
  TypeContentAccess,
  UserRole,
} from '@trinity/shared';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';

@Controller('content')
@UseGuards(JWTAuthGuard, RolesGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly s3Service: S3Service
  ) {}

  @Post('training/add')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseInterceptors(FileInterceptor('file'))
  async addTraining(
    @Body() dto: ContentAddTrainingRequestDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<ContentTrainingInfoResponseDto> {
    if (file) {
      const url = await this.s3Service.uploadFile(file);

      dto.coverUrl = url;
    }

    const training = await this.contentService.createTraining(dto);

    return training;
  }

  @Get('training/:id')
  async infoTraining(
    @Param('id') trainingId: number,
    @Query('populate') populate?: boolean
  ): Promise<ContentTrainingInfoResponseDto> {
    const training = populate
      ? await this.contentService.populateTraining({
          trainingId,
        })
      : await this.contentService.findTraining({ trainingId });

    if (!training) {
      throw new NotFoundException('Тренинг не найден');
    }

    return training;
  }

  @Post('lesson/add')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'contentFile', maxCount: 1 }, // видео или аудио
      { name: 'coverFile', maxCount: 1 }, // обложка
    ])
  )
  async addLesson(
    @Body() dto: ContentAddLessonRequestDto,
    @UploadedFiles()
    files: {
      contentFile?: Express.Multer.File[];
      coverFile?: Express.Multer.File[];
    }
  ): Promise<ContentLessonInfoResponseDto> {
    if (files.contentFile?.[0]) {
      switch (dto.type) {
        case LessonType.AUDIO:
          dto.content = {
            audioUrl: await this.s3Service.uploadFile(files.contentFile[0]),
          };
          break;
        case LessonType.VIDEO:
          dto.content = {
            videoUrl: await this.s3Service.uploadFile(files.contentFile[0]),
          };
          break;
      }
    }

    if (dto.html && dto.type == LessonType.TEXT) {
      dto.content = {
        html: dto.html,
      };
    }

    if (files.coverFile?.[0]) {
      dto.coverUrl = await this.s3Service.uploadFile(files.coverFile[0]);
    }

    const lessson = await this.contentService.createLesson(dto);

    return lessson;
  }

  @Get('lesson/:id')
  async infoLesson(
    @Param('id') lessonId: number,
    @Query('populate') populate?: boolean
  ): Promise<ContentLessonInfoResponseDto> {
    const lessson = populate
      ? await this.contentService.populateLesson({ lessonId })
      : await this.contentService.findLesson({ lessonId });

    if (!lessson) {
      throw new NotFoundException('Урок не найден');
    }

    return lessson;
  }

  @Delete('training/:id')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
  async deleteTraining(@Param('id') trainingId: number): Promise<boolean> {
    return await this.contentService.deleteTraining(trainingId);
  }

  @Delete('lesson/:id')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
  async deleteLesson(@Param('id') lessonId: number): Promise<boolean> {
    return await this.contentService.deleteLesson(lessonId);
  }

  @Post('training/:id/update')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
  async updateTraining(
    @Param('id') trainingId: number,
    @Body() updateData: ContentTrainingUpdateRequestDto
  ): Promise<ContentTrainingInfoResponseDto> {
    return await this.contentService.updateTraining({ trainingId }, updateData);
  }

  @Post('lesson/:id/update')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
  async updateLesson(
    @Param('id') lessonId: number,
    @Body() updateData: ContentLessonUpdateRequestDto
  ): Promise<ContentLessonInfoResponseDto> {
    return await this.contentService.updateLesson({ lessonId }, updateData);
  }

  @Post('training/:id/update/access-rules')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
  async updateTrainingAccessRules(
    @Param('id') trainingId: number,
    @Body() updateData: ContentTrainingUpdateAccessRulesRequestDto
  ): Promise<ContentTrainingInfoResponseDto> {
    return await this.contentService.updateTrainingAccessRules(
      { trainingId },
      { accessRules: updateData.accessRules as unknown as TypeContentAccess[] }
    );
  }

  @Post('lesson/:id/update/access-rules')
  @Roles(UserRole.Admin, UserRole.Moderator)
  @UseGuards(JWTAuthGuard)
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
