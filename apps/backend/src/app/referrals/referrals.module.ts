import { Module } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Referral, ReferralSchema } from './models';
import { ReferralsRepository } from './repositories';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
    ]),
  ],
  providers: [ReferralsService, ReferralsRepository],
  exports: [ReferralsService],
})
export class ReferralsModule {}
