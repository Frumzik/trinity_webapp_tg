export enum AuthType {
  TG = 'TG',
  EMAIL = 'EMAIL',
}

export interface IJWTPayload {
  userId: string;
}
