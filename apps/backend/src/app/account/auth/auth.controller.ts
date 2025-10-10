import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginRequestDto, AuthLoginResponseDto, AuthRegisterRequestDto, AuthRegisterResponseDto, AuthType } from '@trinity/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerByTgId(@Body() dto: AuthRegisterRequestDto): Promise<AuthRegisterResponseDto> {
    switch(dto.type) {
      case AuthType.TG:
        return this.authService.registerByTgId(dto);
      case AuthType.EMAIL:
        return this.authService.registerByEmail(dto);
      default:
        throw new Error(`Неподдерживаемый тип регистрации: ${dto.type}`)
    }
  }

  @Post('login')
  async login(@Body() dto: AuthLoginRequestDto): Promise<AuthLoginResponseDto> {
    let validatedUser;

    switch(dto.type) {
      case AuthType.TG:
        validatedUser = await this.authService.validateUserByTgId(dto.tgId, dto.pin);
        break;
      case AuthType.EMAIL:
        validatedUser = await this.authService.validateUserByEmail(dto.email, dto.password);
        break;
      default:
        throw new Error(`Неподдерживаемый тип авторизации: ${dto.type}`)
    }


    return this.authService.login(validatedUser.userId);
  }
}
