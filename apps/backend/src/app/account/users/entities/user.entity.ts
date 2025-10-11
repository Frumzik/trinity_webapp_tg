import { IUser, UserRole } from '@trinity/shared';
import { compare, genSalt, hash } from 'bcryptjs';
import { Types } from 'mongoose';
import { SubscriptionEntity } from '../../../billing';

export class UserEntity implements IUser {
  _id?: Types.ObjectId;
  _subscriptionId?: Types.ObjectId;
  userId: number;
  name?: string;
  username?: string;
  tgId?: number;
  pinHash?: string;
  email?: string;
  passwordHash?: string;
  role!: UserRole;
  balance!: number;
  subscriptionId?: number;

  constructor(user: IUser) {
    this._id = user._id;
    this._subscriptionId = user._subscriptionId;
    this.userId = user.userId;
    this.name = user.name;
    this.tgId = user.tgId;
    this.username = user.username;
    this.pinHash = user.pinHash;
    this.email = user.email;
    this.passwordHash = user.passwordHash;
    this.role = user.role;
    this.balance = user.balance;
    this.subscriptionId = user.subscriptionId;
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
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

  public async updateUser(
    data: Partial<UserEntity> & { password?: string; pin?: string }
  ) {
    // Хэшируем password и pin отдельно
    if (data.password) {
      await this.setPassword(data.password);
      delete data.password;
    }

    if (data.pin) {
      await this.setPin(data.pin);
      delete data.pin;
    }

    // Копируем все остальные свойства динамически
    Object.assign(this, data);

    return this;
  }

  public bindSubscription(subscription: SubscriptionEntity) {
    this.subscriptionId = subscription.subscriptionId;
    this._subscriptionId = subscription._id;
  }
}
