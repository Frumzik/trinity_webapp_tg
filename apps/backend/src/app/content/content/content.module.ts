import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { LessonsRepository, TrainingsRepository } from './repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema, Training, TrainingSchema } from './models';
import { CountersModule, S3ProviderModule } from '../../service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Training.name, schema: TrainingSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
    CountersModule,
    S3ProviderModule
  ],
  providers: [ContentService, TrainingsRepository, LessonsRepository],
  controllers: [ContentController],
  exports: [ContentService],
})
export class ContentModule {}
