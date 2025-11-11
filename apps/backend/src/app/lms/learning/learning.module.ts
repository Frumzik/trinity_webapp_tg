import { forwardRef, Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { LearningsRepository } from './repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Learning, LearningSchema } from './models';
import { UsersModule } from '../../account';
import { PurchaseModule, SubscriptionsModule } from '../../billing';
import { ContentModule } from '../content';
import { LearningListener } from './learning.listener';
import { Training, TrainingSchema } from '../content/models';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Learning.name, schema: LearningSchema },
      { name: Training.name, schema: TrainingSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => SubscriptionsModule),
    forwardRef(() => ContentModule),
    forwardRef(() => PurchaseModule),
  ],
  providers: [LearningService, LearningsRepository, LearningListener],
  controllers: [LearningController],
})
export class LearningModule {}
