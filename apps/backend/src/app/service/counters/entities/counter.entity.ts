import { CounterType, ICounter } from '@trinity/shared';

export class CounterEntity implements ICounter {
  _id?: string;
  type: CounterType;
  seq: number;
  

  constructor(counter: ICounter) {
    this._id = counter._id;
    this.type = counter.type;
    this.seq = counter.seq;
  }

  public increment(amount = 1) {
    this.seq += amount;
    return this;
  }
}
