import { Injectable } from '@nestjs/common';
import { UserEntity } from '../users/entities/user.entity';
import {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  AuthRegisterRequestDto,
  AuthRegisterResponseDto,
  AuthType,
  CounterType,
  UserRole,
} from '@trinity/shared';
import { JwtService } from '@nestjs/jwt';
import {
  CountersService,
  UserEvents,
  UserLoggedInEvent,
  UserRegisteredEvent,
} from '../../service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users';
import { SubscriptionEntity, SubscriptionsService } from '../../billing';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly countersService: CountersService,
    private readonly eventEmitter: EventEmitter2,
    private readonly subscriptionsService: SubscriptionsService
  ) {}

  public async register(
    dto: AuthRegisterRequestDto
  ): Promise<AuthRegisterResponseDto> {
    // Проверяем существующего пользователя
    const condition =
      dto.type === 'TG' ? { tgId: dto.tgId } : { email: dto.email };
    const oldUser = await this.usersService
      .findUser(condition)
      .catch(() => null);
    if (oldUser) throw new Error('Такой пользователь уже зарегистрирован');

    // Создаем UserEntity
    const newUserEntity = new UserEntity({
      userId: await this.countersService.saveNextSequence(CounterType.USER_ID),
      name: dto.name,
      username: dto.username,
      tgId: dto.tgId,
      email: dto.email,
      role: UserRole.User,
      balance: 0,
    });

    if (dto.type === 'TG' && dto.pin) {
      await newUserEntity.setPin(dto.pin);
    } else if (dto.type === 'EMAIL' && dto.password) {
      await newUserEntity.setPassword(dto.password);
    }

    let newUser = await this.usersService.createUser(newUserEntity);

    // Создаем SubscriptionEntity
    const newSubscriptionEntity = new SubscriptionEntity({
      subscriptionId: await this.countersService.saveNextSequence(
        CounterType.SUBSCRIPTION_ID
      ),
    });

    const newSubscription = await this.subscriptionsService.createSubscription(
      newSubscriptionEntity
    );

    newUser = await this.usersService.bindSubscription(
      { _id: newUser._id },
      { subscription: newSubscription }
    );
    await this.subscriptionsService.bindUser(
      { _id: newSubscription._id },
      { user: newUser }
    );

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
    const user = await this.usersService.findUser(condition);

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
