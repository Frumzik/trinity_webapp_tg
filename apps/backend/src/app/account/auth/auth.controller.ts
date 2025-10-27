import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthLoginEmailDto,
  AuthLoginTgDto,
  AuthLoginResponseDto,
  AuthRegisterEmailDto,
  AuthRegisterTgDto,
  AuthRegisterResponseDto,
  AuthType,
} from '@trinity/shared';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* ==================== REGISTER ==================== */
  @Post('register')
  @ApiOperation({ summary: 'Зарегистрировать пользователя' })
  @ApiExtraModels(AuthRegisterEmailDto, AuthRegisterTgDto)
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(AuthRegisterTgDto) },
        { $ref: getSchemaPath(AuthRegisterEmailDto) },
      ],
      discriminator: {
        propertyName: 'type',
        mapping: {
          [AuthType.TG]: getSchemaPath(AuthRegisterTgDto),
          [AuthType.EMAIL]: getSchemaPath(AuthRegisterEmailDto),
        },
      },
    },
    examples: {
      [AuthType.TG]: {
        summary: 'Регистрация через Telegram',
        value: {
          type: 'TG',
          tgId: 1234,
          pin: '1234',
          username: 'ivan_tg',
          name: 'Иван',
        },
      },
      [AuthType.EMAIL]: {
        summary: 'Регистрация по email',
        value: {
          type: 'EMAIL',
          email: 'user@example.com',
          password: 'qwerty123',
          name: 'Иван Иванов',
        },
      },
    },
  })
  @ApiResponse({ type: AuthRegisterResponseDto })
  async register(
    @Body() dto: AuthRegisterEmailDto | AuthRegisterTgDto
  ): Promise<AuthRegisterResponseDto> {
    return this.authService.register(dto);
  }

  /* ==================== LOGIN ==================== */
  @Post('login')
  @ApiOperation({ summary: 'Авторизовать пользователя' })
  @ApiExtraModels(AuthLoginEmailDto, AuthLoginTgDto)
  @ApiOperation({ summary: 'Зарегистрировать пользователя' })
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(AuthLoginTgDto) },
        { $ref: getSchemaPath(AuthLoginEmailDto) },
      ],
      discriminator: {
        propertyName: 'type',
        mapping: {
          [AuthType.TG]: getSchemaPath(AuthLoginTgDto),
          [AuthType.EMAIL]: getSchemaPath(AuthLoginEmailDto),
        },
      },
    },
    examples: {
      [AuthType.TG]: {
        summary: 'Авторизация через Telegram',
        value: {
          type: 'TG',
          tgId: 1234,
          pin: '1234',
        },
      },
      [AuthType.EMAIL]: {
        summary: 'Авторизация по email',
        value: {
          type: 'EMAIL',
          email: 'user@example.com',
          password: 'qwerty123',
        },
      },
    },
  })
  @ApiResponse({ type: AuthLoginResponseDto })
  async login(
    @Body() dto: AuthLoginEmailDto | AuthLoginTgDto
  ): Promise<AuthLoginResponseDto> {
    return this.authService.login(dto);
  }
}
