import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../service';
import { BannerCreateRequestDto } from '@trinity/shared';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { BannerEntity } from './entities';

@Controller('banners')
@ApiTags('banners')
@ApiBearerAuth('access_token')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post('add')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Добавить баннер' })
  @ApiResponse({
    status: 201,
    type: BannerEntity,
    description: 'Баннер',
  })
  async add(
    @UserId() userId: number,
    @Body() dto: BannerCreateRequestDto
  ): Promise<BannerEntity> {
    return await this.bannersService.create(dto);
  }

  @Post('delete')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Удалить баннер' })
  @ApiResponse({
    status: 201,
    type: Boolean,
    description: 'Удалить',
  })
  async delete(
    @UserId() userId: number,
    @Body() dto: { bannerId: number }
  ): Promise<{ deleted: boolean }> {
    return await this.bannersService.delete(dto);
  }

  @Post(':id/add-view')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Добавить просмотр баннера' })
  @ApiResponse({
    status: 201,
    type: Boolean,
    description: 'Баннер',
  })
  async addViewedUser(
    @UserId() userId: number,
    @Param('id') bannerId: number
  ): Promise<BannerEntity> {
    return await this.bannersService.addViewedUser({ bannerId }, userId);
  }

  @Get(':id')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Получить баннер' })
  @ApiResponse({
    status: 200,
    type: Boolean,
    description: 'Баннер',
  })
  async find(
    @UserId() userId: number,
    @Param('id') bannerId: number
  ): Promise<BannerEntity | null> {
    return await this.bannersService.find({ bannerId });
  }

  @Get('')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Получить баннеры' })
  @ApiResponse({
    status: 200,
    type: Boolean,
    description: 'Баннер',
  })
  async findAll(): Promise<BannerEntity[]> {
    return await this.bannersService.findAll();
  }
}
