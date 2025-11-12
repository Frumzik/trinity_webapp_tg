export enum CounterType {
  USER_ID = 'USER_ID',
  SUBSCRIPTION_ID = 'SUBSCRIPTION_ID',
  TRAINING_ID = 'TRAINING_ID',
  LESSON_ID = 'LESSON_ID',
  FAVORITE_ID = 'FAVORITE_ID',
  TRANSACTION_ID = 'TRANSACTION_ID',
  PURCHASE_ID = 'PURCHASE_ID',
  BANNER_ID = 'BANNER_ID'
}

export interface ICounter {
  _id?: string;
  seq: number;
  type: CounterType;
}
