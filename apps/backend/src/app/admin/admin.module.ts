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

@Module({
  imports: [
    UsersModule,
    forwardRef(() => TransactionsModule),
    ContentModule,
    FileModule,
  ],
  providers: [
    AdminUserService,
    AdminTrainingService,
    AdminLessonService,
    AdminFileService,
  ],
  controllers: [
    AdminUserController,
    AdminTrainingController,
    AdminLessonController,
    AdminFileController,
  ],
})
export class AdminModule {}
