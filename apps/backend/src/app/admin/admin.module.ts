import { forwardRef, Module } from '@nestjs/common';
import { AdminUserController, AdminUserService } from './user';
import { UsersModule } from '../account';
import { TransactionsModule } from '../billing';
import { ContentModule } from '../lms';
import { AdminTrainingController, AdminTrainingService } from './training';
import { AdminLessonController, AdminLessonService } from './lesson';
import { AdminFileController } from './file/admin-file.controller';
import { AdminFileService } from './file/admin-file.service';
import { FileModule } from '../service';
import { AdminBannerController, AdminBannerService } from './banner';
import { BannersModule } from '../banners';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => TransactionsModule),
    ContentModule,
    FileModule,
    BannersModule,
  ],
  providers: [
    AdminUserService,
    AdminTrainingService,
    AdminLessonService,
    AdminFileService,
    AdminBannerService,
  ],
  controllers: [
    AdminUserController,
    AdminTrainingController,
    AdminLessonController,
    AdminFileController,
    AdminBannerController,
  ],
})
export class AdminModule {}
