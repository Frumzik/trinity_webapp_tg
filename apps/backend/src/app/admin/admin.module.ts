import { forwardRef, Module } from '@nestjs/common';
import { AdminUserController, AdminUserService } from './user';
import { UsersModule } from '../account';
import { TransactionsModule } from '../billing';

@Module({
  imports: [UsersModule, forwardRef(() => TransactionsModule)],
  providers: [AdminUserService],
  controllers: [AdminUserController],
})
export class AdminModule {}
