import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { LearningsRepository } from './repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Learning, LearningSchema } from './models';
import { UsersModule } from '../../account';
import { SubscriptionsModule } from '../../billing';
import { ContentModule } from '../content';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Learning.name, schema: LearningSchema },
    ]),
    UsersModule,
    SubscriptionsModule,
    ContentModule
  ],
  providers: [LearningService, LearningsRepository],
  controllers: [LearningController],
})
export class LearningModule {}
