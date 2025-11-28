import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from './models';
import { CountersModule } from '../service';
import { BannersRepository } from './repositories';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),
    CountersModule,
  ],
  providers: [BannersService, BannersRepository],
  controllers: [BannersController],
  exports: [BannersService],
})
export class BannersModule {}
