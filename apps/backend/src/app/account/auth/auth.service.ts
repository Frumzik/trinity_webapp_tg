import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../users/entities/user.entity';
import {
  AuthLoginTgRequestDto,
  AuthLoginResponseDto,
  AuthRegisterEmailDto,
  AuthRegisterResponseDto,
  AuthRegisterTgDto,
  AuthType,
  UserEvents,
  UserLoggedInEvent,
  UserRegisteredEvent,
  AuthLoginEmailRequestDto,
} from '@trinity/shared';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users';
import { AcquiringService, SubscriptionsService } from '../../billing';
import { ReferralsService } from '../../referrals';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly referralsService: ReferralsService,
    private readonly acquiringService: AcquiringService
  ) {}

  public async register(
    dto: AuthRegisterEmailDto | AuthRegisterTgDto
  ): Promise<AuthRegisterResponseDto> {
    let referralPath = '';

    if (dto.partnerId) {
      const partner = await this.usersService.find({
        userId: dto.partnerId,
      });

      if (partner) {
        const referralPathArr = (partner?.referralPath ?? '')
          .split('/')
          .filter((p) => p); // убираем пустые
        referralPathArr.push(partner.userId.toString());
        referralPath = referralPathArr.join('/');
      }
    }

    let newUser = await this.usersService.create({ ...dto }, { referralPath });
    let newSubscription = await this.subscriptionsService.create();
    const newWallet = await this.acquiringService.createAccount(
      newUser.userId.toString()
    );

    newUser = await this.usersService.bindSubscription(
      newUser,
      newSubscription
    );
    newSubscription = await this.subscriptionsService.bindUser(
      newSubscription,
      newUser
    );

    newUser = await this.usersService.bindAddress({userId: newUser.userId}, newWallet.address);

    if (dto.partnerId) {
      const partner = await this.usersService.find({ userId: dto.partnerId });

      if (partner) {
        await this.referralsService.create(partner, newUser);
      }
    }

    // Событие регистрации
    this.eventEmitter.emit(
      UserEvents.REGISTERED,
      new UserRegisteredEvent(newUser.userId)
    );

    return { userId: newUser.userId };
  }

  // AuthService
  async validate(
    dto: AuthLoginTgRequestDto | AuthLoginEmailRequestDto
  ): Promise<UserEntity> {
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

  async login(
    dto: AuthLoginTgRequestDto | AuthLoginEmailRequestDto
  ): Promise<AuthLoginResponseDto> {
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

  async checkTg(tgId: number): Promise<boolean> {
    const user = await this.usersService.find({ tgId });

    return Boolean(user);
  }
}
