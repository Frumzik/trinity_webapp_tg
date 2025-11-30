import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { UsersRepository } from './repositories/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CountersModule } from '../../service';
import {
  Purchase,
  PurchaseSchema,
  Subscription,
  SubscriptionSchema,
  Transaction,
  TransactionSchema,
  Withdraw,
  WithdrawSchema,
} from '../../billing';
import { Banner, BannerSchema } from '../../banners';
import { Favorite, FavoriteSchema, Learning, LearningSchema } from '../../lms';
import {
  Fund,
  FundSchema,
  Referral,
  ReferralSchema,
  ReserveFundItem,
  ReserveFundItemSchema,
} from '../../referrals';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Banner.name, schema: BannerSchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: Fund.name, schema: FundSchema },
      { name: ReserveFundItem.name, schema: ReserveFundItemSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: Withdraw.name, schema: WithdrawSchema },
      { name: Learning.name, schema: LearningSchema },
    ]),
    CountersModule,
  ],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
