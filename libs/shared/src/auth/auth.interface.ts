import { UserRole } from "../user/user.interface.js";

export enum AuthType {
  TG = 'TG',
  EMAIL = 'EMAIL',
}

export interface IJWTPayload {
  userId: string;
  role: UserRole;
}
