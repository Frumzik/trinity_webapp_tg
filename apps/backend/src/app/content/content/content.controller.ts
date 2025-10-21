import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { JWTAuthGuard, Roles, RolesGuard, S3Service } from '../../service';
import {
  ContentAddLessonRequestDto,
  ContentAddLessonResponseDto,
  ContentAddTrainingRequestDto,
  ContentAddTrainingResponseDto,
  ILesson,
  ITraining,
  LessonType,
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
  ): Promise<ContentAddTrainingResponseDto> {
    if (file) {
      const url = await this.s3Service.uploadFile(file);

      dto.coverUrl = url;
    }

    const training = await this.contentService.createTraining(dto);

    return training;
  }

  @Get('training/:id')
  async infoTraining(@Param('id') trainingId: number): Promise<ITraining> {
    const training = await this.contentService.findTraining({ trainingId });

    if (!training) {
      throw new NotFoundException('Тренинг не найден');
    }

    return training;
  }

  @Get('training/:id/populate')
  async infoStructureTraining(
    @Param('id') trainingId: number
  ): Promise<ITraining> {
    const training = await this.contentService.populateTraining({
      trainingId,
    });

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
  ): Promise<ContentAddLessonResponseDto> {
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
  async infoLesson(@Param('id') lessonId: number): Promise<ILesson> {
    const lessson = await this.contentService.findLesson({ lessonId });

    if (!lessson) {
      throw new NotFoundException('Урок не найден');
    }

    return lessson;
  }
}
