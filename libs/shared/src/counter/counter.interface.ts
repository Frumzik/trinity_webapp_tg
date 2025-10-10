export enum CounterType {
  USER_ID = 'USER_ID'
}

export interface ICounter {
  _id?: string;
  seq: number;
  type: CounterType;
}
