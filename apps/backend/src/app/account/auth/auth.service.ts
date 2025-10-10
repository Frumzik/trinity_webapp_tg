import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/repositories/users.repository';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
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
    const oldUser = await this.usersRepository.findUserByTgId(tgId);

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

    const newUser = await this.usersRepository.createUser(newUserEntity);

    if (newUser) {
      await this.countersService.saveNextSequence(CounterType.USER_ID);

      this.eventEmitter.emit(
        UserEvents.REGISTERED,
        new UserRegisteredEvent(newUser.userId)
      );
    }

    return { userId: newUser.userId };
  }

  async validateUserByTgId(
    tgId: number,
    pin: string
  ): Promise<{ userId: number }> {
    const user = await this.usersRepository.findUserByTgId(tgId);

    if (!user) {
      throw new Error('Неверный логин или пароль');
    }

    const userEntity = new UserEntity(user);

    const isCorrectPin = await userEntity.validatePin(pin);

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
    const oldUser = await this.usersRepository.findUserByEmail(email);

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

    const newUser = await this.usersRepository.createUser(newUserEntity);

    if (newUser) {
      await this.countersService.saveNextSequence(CounterType.USER_ID);

      this.eventEmitter.emit(
        UserEvents.REGISTERED,
        new UserRegisteredEvent(newUser.userId)
      );
    }

    return { userId: newUser.userId };
  }

  async validateUserByEmail(
    email: string,
    password: string
  ): Promise<{ userId: number }> {
    const user = await this.usersRepository.findUserByEmail(email);

    if (!user) {
      throw new Error('Неверный логин или пароль');
    }

    const userEntity = new UserEntity(user);

    const isCorrectPassword = await userEntity.validatePassword(password);

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
