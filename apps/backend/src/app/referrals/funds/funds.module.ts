import { Module } from '@nestjs/common';
import { FundsService } from './funds.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Fund,
  FundSchema,
  ReserveFundItem,
  ReserveFundItemSchema,
} from './models';
import { FundsRepository, ReserveFundItemsRepository } from './repositories';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Fund.name, schema: FundSchema },
      { name: ReserveFundItem.name, schema: ReserveFundItemSchema },
    ]),
  ],
  providers: [FundsService, FundsRepository, ReserveFundItemsRepository],
  exports: [FundsService],
})
export class FundsModule {}
