import { forwardRef, Module } from '@nestjs/common';
import { AdminUserController, AdminUserService } from './user';
import { UsersModule } from '../account';
import {
  AcquiringModule,
  TransactionsModule,
} from '../billing';
import { ContentModule } from '../lms';
import { AdminTrainingController, AdminTrainingService } from './training';
import { AdminLessonController, AdminLessonService } from './lesson';
import { AdminFileController } from './file/admin-file.controller';
import { AdminFileService } from './file/admin-file.service';
import { FileModule } from '../service';
import { AdminBannerController, AdminBannerService } from './banner';
import { BannersModule } from '../banners';
import { AdminWithdrawController, AdminWithdrawService } from './withdraw';
import { FundsModule, ReferralsModule } from '../referrals';
import { AdminPractiseController, AdminPractiseService } from './practise';
import { AdminFundService } from './fund/admin-fund.service';
import { AdminFundController } from './fund/admin-fund.controller';
import { AdminTransactionController, AdminTransactionService } from './transaction';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => TransactionsModule),
    ContentModule,
    FileModule,
    BannersModule,
    AcquiringModule,
    forwardRef(() => ReferralsModule),
    FundsModule,
    forwardRef(() => TransactionsModule),
  ],
  providers: [
    AdminUserService,
    AdminTrainingService,
    AdminLessonService,
    AdminFileService,
    AdminBannerService,
    AdminWithdrawService,
    AdminPractiseService,
    AdminFundService,
    AdminTransactionService
  ],
  controllers: [
    AdminUserController,
    AdminTrainingController,
    AdminLessonController,
    AdminFileController,
    AdminBannerController,
    AdminWithdrawController,
    AdminPractiseController,
    AdminFundController,
    AdminTransactionController
  ],
})
export class AdminModule {}
