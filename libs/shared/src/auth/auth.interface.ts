import { UserRole } from "../user/user.interface.js";

export enum AuthType {
  TG = 'TG',
  EMAIL = 'EMAIL',
  PROMO_TG = 'PROMO_TG',
}

export interface IJWTPayload {
  userId: string;
  role: UserRole;
}
