import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

export class RegisterDto {
    tgId!: number;

    pin!: string;

    name!: string;

    username!: string;
  }

  export class LoginDto {
    tgId!: number;

    pin!: string;
  }

  export class RegisterResponseDto {
    tgId!: number;
  }

   export class LoginResponseDto {
    access_token!: string;
  }

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async loginByTgId(@Body() { tgId, pin }: LoginDto) {
    const validatedUser = await this.authService.validateUserByTgId(tgId, pin);

    return this.authService.login(validatedUser.userId);
  }
}
