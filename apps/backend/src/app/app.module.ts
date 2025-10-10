import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './account/users';
import { AuthModule } from './account/auth';
import { CountersModule, getMongoConfig } from './service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // чтобы ConfigModule был доступен везде
      envFilePath: 'apps/backend/src/envs/.dev.env',
    }),
    MongooseModule.forRootAsync(getMongoConfig()),
    UsersModule,
    AuthModule,
    CountersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
