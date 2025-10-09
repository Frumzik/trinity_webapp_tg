import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user';
import { getJwtConfig } from '../../service';

@Module({
  imports: [UserModule, JwtModule.registerAsync(getJwtConfig())],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
