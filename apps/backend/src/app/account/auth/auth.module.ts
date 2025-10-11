import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users';
import { CountersModule, getJwtConfig } from '../../service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SubscriptionsModule } from '../../billing';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    CountersModule,
    SubscriptionsModule,
    JwtModule.registerAsync(getJwtConfig()),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
