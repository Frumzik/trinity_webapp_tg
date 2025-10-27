import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../users/entities/user.entity';
import {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  AuthRegisterEmailDto,
  AuthRegisterResponseDto,
  AuthRegisterTgDto,
  AuthType,
  UserEvents,
  UserLoggedInEvent,
  UserRegisteredEvent,
} from '@trinity/shared';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users';
import { SubscriptionsService } from '../../billing';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly subscriptionsService: SubscriptionsService
  ) {}

  public async register(
    dto: AuthRegisterEmailDto | AuthRegisterTgDto
  ): Promise<AuthRegisterResponseDto> {
    const newUser = await this.usersService.create(dto);
    const newSubscription = await this.subscriptionsService.create();

    await this.usersService.bindSubscription(newUser, newSubscription);
    await this.subscriptionsService.bindUser(newSubscription, newUser);

    // Событие регистрации
    this.eventEmitter.emit(
      UserEvents.REGISTERED,
      new UserRegisteredEvent(newUser.userId)
    );

    return { userId: newUser.userId };
  }

  // AuthService
  async validate(dto: AuthLoginRequestDto): Promise<UserEntity> {
    const condition =
      dto.type === AuthType.TG ? { tgId: dto.tgId } : { email: dto.email };
    const user = await this.usersService.find(condition);

    if (!user) {
      throw new NotFoundException('Неверный логин или пароль');
    }

    const isValid =
      dto.type === AuthType.TG
        ? await user.validatePin(dto.pin)
        : await user.validatePassword(dto.password);

    if (!isValid) throw new Error('Неверный логин или пароль');

    return user;
  }

  async login(dto: AuthLoginRequestDto): Promise<AuthLoginResponseDto> {
    const user = await this.validate(dto);

    this.eventEmitter.emit(
      UserEvents.LOGGED_IN,
      new UserLoggedInEvent(user.userId)
    );

    return {
      access_token: await this.jwtService.signAsync({
        userId: user.userId,
        role: user.role,
      }),
    };
  }
}
