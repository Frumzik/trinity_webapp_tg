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

  public updateUserProfile(data: { username?: string; name?: string }) {
    if (data.name !== undefined) {
      this.name = data.name;
    }
    if (data.username !== undefined) {
      this.username = data.username;
    }
    return this;
  }

  public async updateUserPin(pin: string) {
    if (pin) {
      await this.setPin(pin);
    }

    return this;
  }

  public async updateUserPassword(password: string) {
    if (password) {
      await this.setPassword(password);
    }

    return this;
  }

  public bindSubscription(subscription: SubscriptionEntity) {
    this.subscriptionId = subscription.subscriptionId;
    this._subscriptionId = subscription._id;

    return this;
  }

  public updateUserBalance(balance: number) {
    this.balance = balance;

    return this;
  }

  public updateUserRole(role: UserRole) {
    this.role = role;

    return this;
  }
}
