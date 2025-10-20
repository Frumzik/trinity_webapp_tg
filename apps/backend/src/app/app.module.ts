import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { CountersModule, getMongoConfig, S3ProviderModule } from './service';
import { AuthModule, UsersModule } from './account';
import { SubscriptionsModule } from './billing';
import { ContentModule } from './content';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // чтобы ConfigModule был доступен везде
      envFilePath: 'apps/backend/envs/.dev.env',
    }),
    MongooseModule.forRootAsync(getMongoConfig()),
    PassportModule,
    EventEmitterModule.forRoot(),
    UsersModule,
    AuthModule,
    CountersModule,
    SubscriptionsModule,
    ContentModule,
    S3ProviderModule
  ],
  controllers: [],
  providers: [],
  exports: [EventEmitterModule],
})
export class AppModule {}
