import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TrainingRepository } from './repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Training, TrainingSchema } from './models';
import { CountersModule } from '../../service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Training.name, schema: TrainingSchema },
    ]),
    CountersModule
  ],
  providers: [ContentService, TrainingRepository],
  controllers: [ContentController],
  exports: [ContentService],
})
export class ContentModule {}
