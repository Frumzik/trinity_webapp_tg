import { forwardRef, Module } from '@nestjs/common';
import { AdminUserController, AdminUserService } from './user';
import { UsersModule } from '../account';
import { TransactionsModule } from '../billing';
import { ContentModule } from '../lms';
import { AdminTrainingController, AdminTrainingService } from './training';
import { AdminLessonController, AdminLessonService } from './lesson';

@Module({
  imports: [UsersModule, forwardRef(() => TransactionsModule), ContentModule],
  providers: [AdminUserService, AdminTrainingService, AdminLessonService],
  controllers: [
    AdminUserController,
    AdminTrainingController,
    AdminLessonController,
  ],
})
export class AdminModule {}
