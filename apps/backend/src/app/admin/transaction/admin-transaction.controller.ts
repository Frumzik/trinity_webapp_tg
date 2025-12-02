/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  Query,
  Param,
  Body,
  Res,
} from '@nestjs/common';
import { JWTAuthGuard, parseGetListQuery, Roles } from '../../service';
import { AdminTransactionService } from './admin-transaction.service';
import { UserRole } from '@trinity/shared';
import { type Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@Roles(UserRole.Admin, UserRole.Moderator)
@UseGuards(JWTAuthGuard)
@ApiBearerAuth('access_token')
@Controller('admin/transaction')
export class AdminTransactionController {
  constructor(private readonly adminTransactionService: AdminTransactionService) {}

  @Get()
  async getList(
    @Query('range') range: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
    @Res() res: Response
  ) {
    const options = parseGetListQuery({ range, sort, filter });

    // Передаём все в сервис
    const { items, total } = await this.adminTransactionService.getList(options);

    // React-admin требует заголовки
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.set(
      'Content-Range',
      `user ${options.skip + 1}-${options.skip + options.limit + 1}/${total}`
    );

    return res.json(items);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.adminTransactionService.getOne(id);
  }

  @Post()
  async create(@Body() dto: never) {
    return await this.adminTransactionService.create();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: never) {
    return await this.adminTransactionService.update();
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.adminTransactionService.delete();
  }
}
