import { Module } from '@nestjs/common';
import { FavoritesRepository } from './repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './models';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { CountersModule } from '../../service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    CountersModule
  ],
  providers: [FavoritesService, FavoritesRepository],
  controllers: [FavoritesController],
})
export class FavoritesModule {}
