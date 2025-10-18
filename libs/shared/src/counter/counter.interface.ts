export enum CounterType {
  USER_ID = 'USER_ID',
  SUBSCRIPTION_ID = 'SUBSCRIPTION_ID',
  TRAINING_ID = 'TRAINING_ID',
}

export interface ICounter {
  _id?: string;
  seq: number;
  type: CounterType;
}
