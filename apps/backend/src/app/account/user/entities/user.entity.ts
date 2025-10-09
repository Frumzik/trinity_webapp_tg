import { IUser, UserRole } from '@trinity/shared';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  _id?: string;
  displayName!: string;
  tgId!: number;
  pinHash!: string;
  email?: string;
  passwordHash?: string;
  role!: UserRole;

  constructor(user: IUser) {
    this._id = user._id;
    this.displayName = user.displayName;
    this.tgId = user.tgId;
    this.pinHash = user.pinHash;
    this.email = user.email;
    this.passwordHash = user.passwordHash;
    this.role = user.role;
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
    return compare(pin, this.pinHash);
  }
}
