import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from '../account';
import { NotificationsListener } from './notifications.listener';

@Module({
  imports: [HttpModule, forwardRef(() => UsersModule)],
  providers: [NotificationsService, NotificationsListener],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
