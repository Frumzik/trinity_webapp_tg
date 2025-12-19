import { forwardRef, Module } from '@nestjs/common';
import { AcquiringService } from './acquiring.service';
import { AcquiringController } from './acquiring.controller';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from '../../account';
import { TransactionsModule } from '../transactions';
import { MongooseModule } from '@nestjs/mongoose';
import { Withdraw, WithdrawSchema } from './models';
import { WithdrawsService } from './withdraws.service';
import { WithdrawsRepository } from './repositories';
import { CountersModule } from '../../service';
import { FundsModule } from '../../referrals';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Withdraw.name, schema: WithdrawSchema },
    ]),
    HttpModule,
    forwardRef(() => UsersModule),
    forwardRef(() => TransactionsModule),
    CountersModule,
    FundsModule
  ],
  providers: [AcquiringService, WithdrawsService, WithdrawsRepository],
  controllers: [AcquiringController],
  exports: [AcquiringService, WithdrawsService],
})
export class AcquiringModule {}
