import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { LessonsRepository, TrainingsRepository } from './repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema, Training, TrainingSchema } from './models';
import { CountersModule, FileModule } from '../../service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Training.name, schema: TrainingSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
    CountersModule,
    FileModule
  ],
  providers: [ContentService, TrainingsRepository, LessonsRepository],
  controllers: [ContentController],
  exports: [ContentService],
})
export class ContentModule {}
