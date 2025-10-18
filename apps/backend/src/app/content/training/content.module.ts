import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { LessonRepository, TrainingRepository } from './repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema, Training, TrainingSchema } from './models';
import { CountersModule } from '../../service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Training.name, schema: TrainingSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
    CountersModule,
  ],
  providers: [ContentService, TrainingRepository, LessonRepository],
  controllers: [ContentController],
  exports: [ContentService],
})
export class ContentModule {}
