import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthLoginEmailRequestDto,
  AuthLoginTgRequestDto,
  AuthLoginResponseDto,
  AuthRegisterEmailDto,
  AuthRegisterTgDto,
  AuthRegisterResponseDto,
  AuthType,
  UserRole,
} from '@trinity/shared';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JWTAuthGuard, Roles, RolesGuard } from '../../service';
import { IsNumber } from 'class-validator';

class SubloginDto {
  @IsNumber()
  userId!: number;
}

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
          tgId: 1,
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
  @ApiExtraModels(AuthLoginEmailRequestDto, AuthLoginTgRequestDto)
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(AuthLoginTgRequestDto) },
        { $ref: getSchemaPath(AuthLoginEmailRequestDto) },
      ],
      discriminator: {
        propertyName: 'type',
        mapping: {
          [AuthType.TG]: getSchemaPath(AuthLoginTgRequestDto),
          [AuthType.EMAIL]: getSchemaPath(AuthLoginEmailRequestDto),
        },
      },
    },
    examples: {
      [AuthType.TG]: {
        summary: 'Авторизация через Telegram',
        value: {
          type: 'TG',
          tgId: 1,
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
    @Body() dto: AuthLoginEmailRequestDto | AuthLoginTgRequestDto
  ): Promise<AuthLoginResponseDto> {
    return this.authService.login(dto);
  }

  @Post('sublogin')
  @ApiBearerAuth('access_token')
  @Roles(UserRole.Admin)
  @UseGuards(JWTAuthGuard)
  @ApiOperation({ summary: 'Саблогин' })
  @ApiResponse({ type: AuthLoginResponseDto })
  async sublogin(@Body() dto: SubloginDto): Promise<AuthLoginResponseDto> {
    return this.authService.sublogin(dto.userId);
  }

  // 🔍 Проверка Telegram ID
  @Get('check-tg')
  @ApiOperation({
    summary: 'Проверить Telegram-пользователя по ID',
  })
  @ApiQuery({
    name: 'id',
    description: 'Telegram ID пользователя',
    example: 6,
    type: Number,
    required: true,
  })
  async checkTg(@Query('id') tgId: number) {
    return await this.authService.checkTg(tgId);
  }

  // 🔍 Проверка авторизации
  @Get('check-auth')
  @UseGuards(JWTAuthGuard)
  @ApiOperation({
    summary: 'Проверить авторизацию',
  })
  async checkAuth() {
    return true;
  }
}
