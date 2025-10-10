import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users';
import { CountersModule, getJwtConfig } from '../../service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync(getJwtConfig()),
    CountersModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
