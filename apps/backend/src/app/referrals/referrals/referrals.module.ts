import { forwardRef, Module } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Referral, ReferralSchema } from './models';
import { ReferralsRepository } from './repositories';
import { UsersModule } from '../../account';
import { ReferralsController } from './referrals.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
    ]),
    forwardRef(() => UsersModule),
  ],
  providers: [ReferralsService, ReferralsRepository],
  exports: [ReferralsService],
  controllers: [ReferralsController],
})
export class ReferralsModule {}
