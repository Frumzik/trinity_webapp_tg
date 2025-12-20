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
import { JWTAuthGuard, parseGetListQuery, Roles, UserId } from '../../service';
import { AdminFundService } from './admin-fund.service';
import { UserRole } from '@trinity/shared';
import { type Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FundEntity } from '../../referrals/funds';
import { IsNumber, IsString } from 'class-validator';

export class FundWithdrawRequestDto {
  @IsString()
  fundType!: string;

  @IsString()
  toAddress!: string;

  @IsNumber()
  amount!: number;
}

@Roles(UserRole.Admin, UserRole.Moderator)
@UseGuards(JWTAuthGuard)
@ApiBearerAuth('access_token')
@Controller('admin/fund')
export class AdminFundController {
  constructor(private readonly adminFundService: AdminFundService) {}

  /**
   * GET /admin/fund?_start=0&_end=10&_sort=email&_order=ASC&filter={"email":"test"}
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
    const { items, total } = await this.adminFundService.getList(options);

    // React-admin требует заголовки
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.set(
      'Content-Range',
      `fund ${options.skip + 1}-${options.skip + options.limit + 1}/${total}`
    );

    return res.json(items);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.adminFundService.getOne(id);
  }

  @Post()
  async create(@Body() dto: FundWithdrawRequestDto, @UserId() userId: number) {
    return await this.adminFundService.create(dto, userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<FundEntity>) {
    return await this.adminFundService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.adminFundService.delete(id);
  }
}
