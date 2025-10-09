export enum UserRole {
  User = 'User',
  Moderator = 'Moderator',
  Admin = 'Admin',
}

export interface IUser {
  _id?: string;
  displayName: string;
  tgId: number;
  pinHash: string;
  email?: string;
  passwordHash?: string;
  role: UserRole;

}
