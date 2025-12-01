import { forwardRef, Module } from '@nestjs/common';
import { AdminUserController, AdminUserService } from './user';
import { UsersModule } from '../account';
import { AcquiringModule, TransactionsModule } from '../billing';
import { ContentModule } from '../lms';
import { AdminTrainingController, AdminTrainingService } from './training';
import { AdminLessonController, AdminLessonService } from './lesson';
import { AdminFileController } from './file/admin-file.controller';
import { AdminFileService } from './file/admin-file.service';
import { FileModule } from '../service';
import { AdminBannerController, AdminBannerService } from './banner';
import { BannersModule } from '../banners';
import { AdminWithdrawController, AdminWithdrawService } from './withdraw';
import { ReferralsModule } from '../referrals';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => TransactionsModule),
    ContentModule,
    FileModule,
    BannersModule,
    AcquiringModule,
    forwardRef(() => ReferralsModule),
  ],
  providers: [
    AdminUserService,
    AdminTrainingService,
    AdminLessonService,
    AdminFileService,
    AdminBannerService,
    AdminWithdrawService,
  ],
  controllers: [
    AdminUserController,
    AdminTrainingController,
    AdminLessonController,
    AdminFileController,
    AdminBannerController,
    AdminWithdrawController,
  ],
})
export class AdminModule {}
