import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsRepository } from './repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from './models';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }])
  ],
  providers: [SubscriptionsService, SubscriptionsRepository],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
