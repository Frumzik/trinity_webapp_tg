import { Injectable } from '@nestjs/common';
import { RegisterDto } from './auth.controller';
import { UserRepository } from '../user/repositories/user.repository';
import { UserEntity } from '../user/entities/user.entity';
import { UserRole } from '@trinity/shared';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async register({ displayName, tgId, pin }: RegisterDto) {
    const oldUser = await this.userRepository.findUserByTgId(tgId);

    if (oldUser) {
      throw new Error('Такой пользователь уже зарегистрирован');
    }

    const newUserEntity = await new UserEntity({
      tgId,
      displayName,
      role: UserRole.User,
      pinHash: '',
    }).setPin(pin);

    const newUser = await this.userRepository.createUser(newUserEntity);

    return { email: newUser.email };
  }

  async validateUser(tgId: number, pin: string) {
    const user = await this.userRepository.findUserByTgId(tgId);

    if (!user) {
      throw new Error('Неверный логин или пароль');
    }

    const userEntity = new UserEntity(user);

    const isCorrectPin = await userEntity.validatePin(pin);

    if (!isCorrectPin) {
      throw new Error('Неверный логин или пароль');
    }

    return { id: user._id };
  }

  async login(id: string) {
    return {
      access_token: await this.jwtService.signAsync({ id })
    }
  }
}
