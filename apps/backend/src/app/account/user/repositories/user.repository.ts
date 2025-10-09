import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/user.module';
import { Model } from 'mongoose';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async createUser(user: UserEntity) {
    const newUser = new this.userModel(user);

    return newUser.save();
  }

  async findUserByTgId(tgId: number) {
    return this.userModel.findOne({ tgId }).exec();
  }

  async findUserByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async deleteUserByTgId(tgId: number) {
    return this.userModel.deleteOne({ tgId }).exec();
  }

  async deleteUserByEmail(email: string) {
    return this.userModel.deleteOne({ email }).exec();
  }
}
