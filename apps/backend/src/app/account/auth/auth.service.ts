import { Injectable } from '@nestjs/common';
import { UserEntity } from '../users/entities/user.entity';
import {
  AuthLoginResponseDto,
  AuthRegisterRequestDto,
  AuthRegisterResponseDto,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly countersService: CountersService,
    private eventEmitter: EventEmitter2
  ) {}

  async registerByTgId({
    tgId,
    pin,
    name,
    username,
  }: AuthRegisterRequestDto): Promise<AuthRegisterResponseDto> {
    const oldUser = await this.usersService
      .findUser({ tgId })
      .catch(() => null);

    if (oldUser) {
      throw new Error('Такой пользователь уже зарегистрирован');
    }

    const newUserEntity = await new UserEntity({
      userId: await this.countersService.getNextSequence(CounterType.USER_ID),
      tgId,
      name,
      username,
      role: UserRole.User,
      pinHash: '',
    }).setPin(pin);

    const newUser = await this.usersService.createUser(newUserEntity);

    await this.countersService.saveNextSequence(CounterType.USER_ID);

    this.eventEmitter.emit(
      UserEvents.REGISTERED,
      new UserRegisteredEvent(newUser.userId)
    );

    return { userId: newUser.userId };
  }

  async validateUserByTgId(
    tgId: number,
    pin: string
  ): Promise<{ userId: number }> {
    const user = await this.usersService.findUser({ tgId });

    const isCorrectPin = await user.validatePin(pin);

    if (!isCorrectPin) {
      throw new Error('Неверный логин или пароль');
    }

    return { userId: user.userId };
  }

  async registerByEmail({
    email,
    password,
    name,
  }: AuthRegisterRequestDto): Promise<AuthRegisterResponseDto> {
    const oldUser = await this.usersService
      .findUser({ email })
      .catch(() => null);

    if (oldUser) {
      throw new Error('Такой пользователь уже зарегистрирован');
    }

    const newUserEntity = await new UserEntity({
      userId: await this.countersService.getNextSequence(CounterType.USER_ID),
      email,
      name,
      role: UserRole.User,
      passwordHash: '',
    }).setPassword(password);

    const newUser = await this.usersService.createUser(newUserEntity);

    await this.countersService.saveNextSequence(CounterType.USER_ID);

    this.eventEmitter.emit(
      UserEvents.REGISTERED,
      new UserRegisteredEvent(newUser.userId)
    );

    return { userId: newUser.userId };
  }

  async validateUserByEmail(
    email: string,
    password: string
  ): Promise<{ userId: number }> {
    const user = await this.usersService.findUser({ email });

    const isCorrectPassword = await user.validatePassword(password);

    if (!isCorrectPassword) {
      throw new Error('Неверный логин или пароль');
    }

    return { userId: user.userId };
  }

  async login(userId: number): Promise<AuthLoginResponseDto> {
    this.eventEmitter.emit(UserEvents.LOGGED_IN, new UserLoggedInEvent(userId));

    return {
      access_token: await this.jwtService.signAsync({ userId }),
    };
  }
}
