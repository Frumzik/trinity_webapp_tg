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
import { AdminLessonService } from './admin-lesson.service';
import { UserRole } from '@trinity/shared';
import { type Response } from 'express';

@Roles(UserRole.Admin, UserRole.Moderator)
@UseGuards(JWTAuthGuard)
@Controller('admin/lesson')
export class AdminLessonController {
  constructor(private readonly adminLessonService: AdminLessonService) {}

  @Get()
  async getList(
    @Query('range') range: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
    @Res() res: Response
  ) {
    const options = parseGetListQuery({ range, sort, filter });

    // Передаём все в сервис
    const { items, total } = await this.adminLessonService.getList(options);

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
    return await this.adminLessonService.getOne(id);
  }

  @Post()
  async create(@Body() dto: never) {
    return await this.adminLessonService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: never) {
    return await this.adminLessonService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.adminLessonService.delete(id);
  }
}
