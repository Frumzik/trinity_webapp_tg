import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  AuthRegisterRequestDto,
  AuthRegisterResponseDto,
} from '@trinity/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerByTgId(
    @Body() dto: AuthRegisterRequestDto
  ): Promise<AuthRegisterResponseDto> {
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: AuthLoginRequestDto): Promise<AuthLoginResponseDto> {
    return await this.authService.login(dto);
  }
}
