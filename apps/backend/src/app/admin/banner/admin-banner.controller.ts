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
import { AdminBannerService } from './admin-banner.service';
import { UserRole } from '@trinity/shared';
import { type Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BannerEntity } from '../../banners';

@Roles(UserRole.Admin, UserRole.Moderator)
@UseGuards(JWTAuthGuard)
@ApiBearerAuth('access_token')
@Controller('admin/banner')
export class AdminBannerController {
  constructor(private readonly adminBannerService: AdminBannerService) {}

  /**
   * GET /admin/banner?_start=0&_end=10&_sort=email&_order=ASC&filter={"email":"test"}
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
    const { items, total } = await this.adminBannerService.getList(options);

    // React-admin требует заголовки
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.set(
      'Content-Range',
      `banner ${options.skip + 1}-${options.skip + options.limit + 1}/${total}`
    );

    return res.json(items);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.adminBannerService.getOne(id);
  }

  @Post()
  async create(@Body() dto: Partial<BannerEntity>) {
    return await this.adminBannerService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<BannerEntity>) {
    return await this.adminBannerService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.adminBannerService.delete(id);
  }
}
