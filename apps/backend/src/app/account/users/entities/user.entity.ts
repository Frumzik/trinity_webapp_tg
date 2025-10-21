import { IUser, UserRole } from '@trinity/shared';
import { compare, genSalt, hash } from 'bcryptjs';
import { Types } from 'mongoose';
import { SubscriptionEntity } from '../../../billing';

export class UserEntity implements IUser {
  _id?: Types.ObjectId;
  userId!: number;

  // Ссылки
  subscription: Types.ObjectId | null = null;
  subscriptionId: number | null = null;

  // Credentials
  tgId: number | null = null;
  pinHash: string | null = null;
  email: string | null = null;
  passwordHash: string | null = null;

  // Метаинформация
  name: string | null = null;
  username: string | null = null;
  // Other

  role: UserRole = UserRole.User;
  balance = 0;

  constructor(user: Partial<IUser> = {}) {
    Object.assign(this, user);
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

  public updateUserProfile(data: Partial<Pick<IUser, 'name' | 'username'>>) {
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
    if (!subscription._id) {
      throw new Error("Подписка не имеет _id")
    }

    this.subscriptionId = subscription.subscriptionId;
    this.subscription = subscription._id;

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
