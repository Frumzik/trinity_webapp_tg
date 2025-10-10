import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Counter } from '../models/counter.module';
import { CounterType } from '@trinity/shared';

@Injectable()
export class CountersRepository {
  constructor(
    @InjectModel(Counter.name) private readonly counterModel: Model<Counter>
  ) {}

  async getNextSequence(type: CounterType): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { type },
      { $setOnInsert: { seq: 1, type } }, // если нет документа — создается seq=1
      { new: true, upsert: true }
    ).exec();

    return counter.seq;
  }

  async saveNextSequence(type: CounterType): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { type },
      { $inc: { seq: 1 } },
      { new: true, upsert: true } // если нет — создаст новый документ
    );
    return counter.seq;
  }
}
