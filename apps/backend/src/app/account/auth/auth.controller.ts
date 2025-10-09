import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

export class RegisterDto {
  tgId!: number;
  pin!: string;
  displayName!: string;
}

export class LoginDto {
  tgId!: number;
  pin!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() { tgId, pin }: LoginDto) {
    const { id } = await this.authService.validateUser(tgId, pin);

    return this.authService.login(id);
  }
}
