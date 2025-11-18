import { forwardRef, Module } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Referral, ReferralSchema } from './models';
import { ReferralsRepository } from './repositories';
import { UsersModule } from '../../account';
import { ReferralsController } from './referrals.controller';
import { ReferralsListener } from './referrals.listener';
import { ContentModule } from '../../lms';
import { FundsModule } from '../funds';
import { PurchaseModule, TransactionsModule } from '../../billing';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => ContentModule),
    FundsModule,
    TransactionsModule,
    forwardRef(() => PurchaseModule),
  ],
  providers: [ReferralsService, ReferralsRepository, ReferralsListener],
  exports: [ReferralsService],
  controllers: [ReferralsController],
})
export class ReferralsModule {}
