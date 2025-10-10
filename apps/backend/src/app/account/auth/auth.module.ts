import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users';
import { CountersModule, getJwtConfig } from '../../service';

@Module({
  imports: [UsersModule, JwtModule.registerAsync(getJwtConfig()), CountersModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
