import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JWTAuthGuard, UserId } from '../../service';
import { FavoritesService } from './favorites.service';
import {
  FavoriteAddRequestDto,
  FavoriteInfoResponseDto,
  FavoriteType,
} from '@trinity/shared';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
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
  @ApiQuery({
    name: 'populate',
    required: false, // 👈 необязательный query-параметр
    type: Boolean,
    description:
      'Если true — вернуть избранное с полной информацией (populate)',
    example: true,
  })
  async find(
    @UserId() userId: number,
    @Query('populate') populate?: boolean
  ): Promise<FavoriteInfoResponseDto[] | FavoriteInfoResponseDto | null> {
    const favorites = populate
      ? await this.favoritesService.populate({ userId })
      : await this.favoritesService.find({ userId });

    if (!favorites) {
      throw new NotFoundException('Избранное не найдено');
    }

    return favorites;
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
    let existingFavorite = null;

    switch (dto.type) {
      case FavoriteType.TRAINING:
        existingFavorite = await this.favoritesService.find({
          userId,
          trainingId: dto.trainingId,
        });

        break;
      case FavoriteType.LESSON:
        existingFavorite = await this.favoritesService.find({
          userId,
          lessonId: dto.lessonId,
        });

        break;
    }

    if (existingFavorite) {
      throw new Error('Избранное уже добавлено');
    }

    const favorite = await this.favoritesService.create(dto);

    return favorite;
  }
}
