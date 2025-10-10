import { Injectable } from '@nestjs/common';
import { RegisterDto } from './auth.controller';
import { UsersRepository } from '../users/repositories/users.repository';
import { UserEntity } from '../users/entities/user.entity';
import { CounterType, UserRole } from '@trinity/shared';
import { JwtService } from '@nestjs/jwt';
import { CountersService } from '../../service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly countersService: CountersService
  ) {}

  async register({ name, tgId, pin, username }: RegisterDto) {
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

    if(newUser) {
      await this.countersService.saveNextSequence(CounterType.USER_ID)
    }

    return { userId: newUser.userId };
  }

  async validateUserByTgId(tgId: number, pin: string) {
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

  async login(userId: number) {
    return {
      access_token: await this.jwtService.signAsync({ userId })
    }
  }
}
