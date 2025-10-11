import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { CountersModule, getMongoConfig } from './service';
import { AuthModule, UsersModule } from './account';
import { SubscriptionsModule } from './billing';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // чтобы ConfigModule был доступен везде
      envFilePath: 'apps/backend/src/envs/.dev.env',
    }),
    MongooseModule.forRootAsync(getMongoConfig()),
    PassportModule,
    EventEmitterModule.forRoot(),
    UsersModule,
    AuthModule,
    CountersModule,
    SubscriptionsModule,
  ],
  controllers: [],
  providers: [],
  exports: [EventEmitterModule],
})
export class AppModule {}
