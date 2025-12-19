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
import { AdminWithdrawService } from './admin-withdraw.service';
import { UserRole } from '@trinity/shared';
import { type Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawEntity } from '../../billing/acquiring';

@Roles(UserRole.Admin, UserRole.Moderator)
@UseGuards(JWTAuthGuard)
@ApiBearerAuth('access_token')
@Controller('admin/withdraw')
export class AdminWithdrawController {
  constructor(private readonly adminWithdrawService: AdminWithdrawService) {}

  /**
   * GET /admin/withdraw?_start=0&_end=10&_sort=email&_order=ASC&filter={"email":"test"}
   */
  @Get()
  async getList(
    @Query('range') range: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
    @Res() res: Response
  ) {
    const options = parseGetListQuery({ range, sort, filter });

    // Передаём все в сервис
    const { items, total } = await this.adminWithdrawService.getList(options);

    // React-admin требует заголовки
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.set(
      'Content-Range',
      `withdraw ${options.skip + 1}-${
        options.skip + options.limit + 1
      }/${total}`
    );

    return res.json(items);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.adminWithdrawService.getOne(id);
  }

  @Post()
  async create(@Body() dto: Partial<WithdrawEntity>) {
    return await this.adminWithdrawService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<WithdrawEntity>) {
    return await this.adminWithdrawService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.adminWithdrawService.delete(id);
  }
}
