import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users';
import { CountersModule, getJwtConfig } from '../../service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AcquiringModule, SubscriptionsModule } from '../../billing';
import { ReferralsModule } from '../../referrals';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    CountersModule,
    SubscriptionsModule,
    JwtModule.registerAsync(getJwtConfig()),
    ReferralsModule,
    AcquiringModule
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
