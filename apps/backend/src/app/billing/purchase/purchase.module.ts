import { forwardRef, Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PurchasesRepository } from './repositories';
import { CountersModule } from '../../service';
import { Purchase, PurchaseSchema } from './models';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../../account';
import { SubscriptionsModule } from '../subscriptions';
import { TransactionsModule } from '../transactions';
import { ContentModule } from '../../lms';
import { PurchaseListener } from './purchase.listener';
import { FundsModule, ReferralsModule } from '../../referrals';
import { NotificationsModule } from '../../notifications';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
    CountersModule,
    forwardRef(() => UsersModule),
    forwardRef(() => SubscriptionsModule),
    forwardRef(() => TransactionsModule),
    forwardRef(() => ContentModule),
    FundsModule,
    forwardRef(() => NotificationsModule),
    forwardRef(() => ReferralsModule)
  ],
  providers: [PurchaseService, PurchasesRepository, PurchaseListener],
  controllers: [PurchaseController],
  exports: [PurchaseService],
})
export class PurchaseModule {}
