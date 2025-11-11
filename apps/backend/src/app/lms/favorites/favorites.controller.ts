import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { FavoritesService } from './favorites.service';
import {
  FavoriteAddRequestDto,
  FavoriteDeleteRequestDto,
  FavoriteInfoResponseDto,
  IFavoritesByTag,
} from '@trinity/shared';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('favorites')
@ApiBearerAuth('access_token') // 🔐 чтобы Swagger знал, что нужно авторизоваться
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Получить информацию об избранном пользователя' })
  @ApiResponse({
    status: 200,
    type: FavoriteInfoResponseDto,
    description: 'Информация о текущем избранном пользователя',
  })
  @ApiResponse({ status: 404, description: 'Избранное не найдено' })
  async find(@UserId() userId: number): Promise<IFavoritesByTag[]> {
    const favorites = await this.favoritesService.populate({ userId });

    if (!favorites) {
      throw new NotFoundException('Избранное не найдено');
    }

    return this.favoritesService.groupFavoritesByTag(favorites);
  }

  @Post('')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Добавить избранное пользователя' })
  @ApiResponse({
    status: 201,
    type: FavoriteInfoResponseDto,
    description: 'Информация о текущем избранном пользователя',
  })
  async add(
    @UserId() userId: number,
    @Body() dto: FavoriteAddRequestDto
  ): Promise<FavoriteInfoResponseDto | null> {
    return await this.favoritesService.create(userId, dto);
  }

  @Delete('')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Удалить избранное пользователя' })
  @ApiResponse({
    status: 200,
    type: FavoriteInfoResponseDto,
    description: 'Информация о текущем избранном пользователя',
  })
  async delete(
    @UserId() userId: number,
    @Body() dto: FavoriteDeleteRequestDto
  ): Promise<{deleted: boolean}> {
    return await this.favoritesService.delete(dto);
  }
}
