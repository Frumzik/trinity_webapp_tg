import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsRepository } from './repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from './models';
import { CountersModule } from '../../service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }]),
    CountersModule
  ],
  providers: [SubscriptionsService, SubscriptionsRepository],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
