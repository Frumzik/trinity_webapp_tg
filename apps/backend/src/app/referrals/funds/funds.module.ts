import { forwardRef, Module } from '@nestjs/common';
import { FundsService } from './funds.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Fund,
  FundSchema,
  ReserveFundItem,
  ReserveFundItemSchema,
} from './models';
import { FundsRepository, ReserveFundItemsRepository } from './repositories';
import { CountersModule } from '../../service';
import { TransactionsModule } from '../../billing';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Fund.name, schema: FundSchema },
      { name: ReserveFundItem.name, schema: ReserveFundItemSchema },
    ]),
    CountersModule,
    forwardRef(() => TransactionsModule),
  ],
  providers: [FundsService, FundsRepository, ReserveFundItemsRepository],
  exports: [FundsService],
})
export class FundsModule {}
