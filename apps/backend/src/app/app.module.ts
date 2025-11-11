import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { CountersModule, getMongoConfig, FileModule } from './service';
import { AuthModule, UsersModule } from './account';
import { SubscriptionsModule } from './billing';
import { ContentModule } from './lms';
import { LearningModule } from './lms/learning';
import { FavoritesModule } from './lms/favorites';
import { TransactionsModule } from './billing/transactions/transactions.module';
import { PurchaseModule } from './billing/purchase/purchase.module';
import { BannersModule } from './banners/banners.module';
import { FundsModule, ReferralsModule } from './referrals';

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
    FileModule,
    LearningModule,
    FavoritesModule,
    TransactionsModule,
    ReferralsModule,
    PurchaseModule,
    BannersModule,
    FundsModule,
  ],
  controllers: [],
  providers: [],
  exports: [EventEmitterModule],
})
export class AppModule {}
