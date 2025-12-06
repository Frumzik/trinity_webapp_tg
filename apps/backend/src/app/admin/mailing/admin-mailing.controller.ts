/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { JWTAuthGuard, Roles } from '../../service';
import { AdminMailingService } from './admin-mailing.service';
import { UserRole } from '@trinity/shared';
import { ApiBearerAuth } from '@nestjs/swagger';

@Roles(UserRole.Admin, UserRole.Moderator)
@UseGuards(JWTAuthGuard)
@ApiBearerAuth('access_token')
@Controller('admin/mailing')
export class AdminMailingController {
  constructor(private readonly adminMailingService: AdminMailingService) {}

  @Post()
  async create(@Body() dto: { text: string }) {
    return await this.adminMailingService.create(dto);
  }
}
