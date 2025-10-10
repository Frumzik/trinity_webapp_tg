import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from './account/users';
import { AuthModule } from './account/auth';
import { CountersModule, getMongoConfig } from './service';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
    PassportModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [],
  providers: [],
  exports: [EventEmitterModule]
})
export class AppModule {}
