import { ISubscription, IUser, UserGender, UserRole } from '@trinity/shared';
import { compare, genSalt, hash } from 'bcryptjs';
import { Types } from 'mongoose';
import { SubscriptionEntity } from '../../../billing';

export class UserEntity implements IUser {
  _id?: Types.ObjectId;
  userId!: number;

  // Ссылки
  subscription: Types.ObjectId | ISubscription | null = null;
  subscriptionId: number | null = null;

  // Credentials
  tgId: number | null = null;
  pinHash: string | null = null;
  email: string | null = null;
  passwordHash: string | null = null;
  finPasswordHash: string | null = null;
  address: string | null = null;

  // Метаинформация
  name: string | null = null;
  username: string | null = null;
  height: number | null = null;
  weight: number | null = null;
  birthDate: Date | null = null;
  gender: UserGender | null = null;

  // Other
  role: UserRole = UserRole.User;
  balance = 0;

  meditationNotifications = '10:00';
  contentNotifications = true;
  promoNotifications = false;

  banned = false;

  // Рефералка
  referralPath = '';
  partnerId: number | null = null;

  constructor(user: Partial<IUser> = {}) {
    Object.assign(this, user);
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public async setFinPassword(finPassword: string) {
    const salt = await genSalt(10);
    this.finPasswordHash = await hash(finPassword, salt);
    return this;
  }

  public validatePassword(password: string) {
    if (!this.passwordHash) {
      return false;
    }

    return compare(password, this.passwordHash);
  }

  public async setPin(pin: string) {
    const salt = await genSalt(10);
    this.pinHash = await hash(pin, salt);

    return this;
  }

  public validatePin(pin: string) {
    if (!this.pinHash) {
      return false; // нет пина — сразу false
    }

    return compare(pin, this.pinHash);
  }

  public async setAddress(address: string) {
    this.address = address;

    return this;
  }

  public updateProfile(
    data: Partial<
      Pick<
        IUser,
        | 'name'
        | 'username'
        | 'email'
        | 'height'
        | 'weight'
        | 'birthDate'
        | 'gender'
      >
    >
  ) {
    if (data.name !== undefined) {
      this.name = data.name;
    }
    if (data.username !== undefined) {
      this.username = data.username;
    }
    if (data.email !== undefined) {
      this.email = data.email;
    }
    if (data.weight !== undefined) {
      this.weight = data.weight;
    }
    if (data.height !== undefined) {
      this.height = data.height;
    }
    if (data.birthDate !== undefined) {
      this.birthDate = data.birthDate;
    }
    if (data.gender !== undefined) {
      this.gender = data.gender;
    }
    return this;
  }

  public bindSubscription(subscription: SubscriptionEntity) {
    if (!subscription._id) {
      throw new Error('Подписка не имеет _id');
    }

    this.subscriptionId = subscription.subscriptionId;
    this.subscription = subscription._id;

    return this;
  }

  public updateBalance(balance: number) {
    this.balance = Math.round(balance * 10) / 10;

    return this;
  }

  public updateRole(role: UserRole) {
    this.role = role;

    return this;
  }

  public updateEmail(email: string) {
    this.email = email;

    return this;
  }

  public updateNotifications(body: {
    meditationNotifications: string;
    contentNotifications: boolean;
    promoNotifications: boolean;
  }) {
    this.meditationNotifications = body.meditationNotifications;
    this.contentNotifications = body.contentNotifications;
    this.promoNotifications = body.promoNotifications;

    return this;
  }

  public setBanned(status: boolean) {
    this.banned = status;

    return this;
  }
}
