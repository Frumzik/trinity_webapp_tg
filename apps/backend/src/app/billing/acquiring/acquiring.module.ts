import { forwardRef, Module } from '@nestjs/common';
import { AcquiringService } from './acquiring.service';
import { AcquiringController } from './acquiring.controller';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from '../../account';
import { TransactionsModule } from '../transactions';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => UsersModule),
    forwardRef(() => TransactionsModule),
  ],
  providers: [AcquiringService],
  controllers: [AcquiringController],
  exports: [AcquiringService],
})
export class AcquiringModule {}
