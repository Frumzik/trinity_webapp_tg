import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from '../account';
import { NotificationsListener } from './notifications.listener';
import { ContentModule } from '../lms';

@Module({
  imports: [HttpModule, forwardRef(() => UsersModule), ContentModule],
  providers: [NotificationsService, NotificationsListener],
  controllers: [NotificationsController],
  exports: [NotificationsService]
})
export class NotificationsModule {}
