import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './models';
import { CountersModule } from '../../service';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './repositories';
import { UsersModule } from '../../account';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    CountersModule,
    forwardRef(() => UsersModule)
  ],
  providers: [TransactionsService, TransactionsRepository],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
