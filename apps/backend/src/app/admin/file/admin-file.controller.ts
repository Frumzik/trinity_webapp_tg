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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileItem, JWTAuthGuard, Roles } from '../../service';
import { AdminFileService } from './admin-file.service';
import { UserRole } from '@trinity/shared';
import { type Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

@Roles(UserRole.Admin, UserRole.Moderator)
@UseGuards(JWTAuthGuard)
@ApiBearerAuth('access_token')
@Controller('admin/file')
export class AdminFileController {
  constructor(private readonly adminFileService: AdminFileService) {}

  @Get()
  async getList(
    @Res() res: Response,
    @Query('range') rangeRaw?: string,
    @Query('sort') sortRaw?: string,
    @Query('filter') filterRaw?: string
  ) {
    console.log(sortRaw);
    // Парсим параметры
    const range = rangeRaw
      ? (JSON.parse(rangeRaw) as [number, number])
      : ([0, 100000000000] as [number, number]);
    const sort = sortRaw
      ? (JSON.parse(sortRaw) as [keyof FileItem, 'ASC' | 'DESC'])
      : (['Key', 'ASC'] as [keyof FileItem, 'ASC' | 'DESC']);
    const filter = filterRaw ? JSON.parse(filterRaw) : {};

    const options = { range, sort, filter };

    // Передаём все в сервис
    const { items, total } = await this.adminFileService.getList(options);

    // React-admin требует заголовки
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.set('Content-Range', `user ${range[0] + 1}-${range[1] + 1}/${total}`);

    return res.json(items);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.adminFileService.getOne(id);
  }

  @Post('')
  @UseInterceptors(FileInterceptor('file')) // имя поля "file" в форме
  async create(@UploadedFile() file: Express.Multer.File) {
    return await this.adminFileService.create(file);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return await this.adminFileService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.adminFileService.delete(id);
  }
}
