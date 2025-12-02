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
import { AdminPractiseService } from './admin-practise.service';
import { UserRole } from '@trinity/shared';
import { type Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ReserveFundItem } from '../../referrals';

@Roles(UserRole.Admin, UserRole.Moderator)
@UseGuards(JWTAuthGuard)
@ApiBearerAuth('access_token')
@Controller('admin/practise')
export class AdminPractiseController {
  constructor(private readonly adminPractiseService: AdminPractiseService) {}

  /**
   * GET /admin/practise?_start=0&_end=10&_sort=email&_order=ASC&filter={"email":"test"}
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
    const { items, total } = await this.adminPractiseService.getList(options);

    // React-admin требует заголовки
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.set(
      'Content-Range',
      `practise ${options.skip + 1}-${
        options.skip + options.limit + 1
      }/${total}`
    );

    return res.json(items);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.adminPractiseService.getOne(id);
  }

  @Post()
  async create(@Body() dto: Partial<ReserveFundItem>) {
    return await this.adminPractiseService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<ReserveFundItem> & { done: boolean }
  ) {
    return await this.adminPractiseService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.adminPractiseService.delete(id);
  }
}
