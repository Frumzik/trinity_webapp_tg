import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './base';

export type Subscription = {
  _id: string;
  subscriptionId: number;
  userId: number;
  user: string;
  type: 'free' | 'pro' | 'premium';
  startDate: string;
  endDate: string | null;
  purchases: unknown[];
  createdAt: string;
  updatedAt: string;
};

export type User = {
  _id: string;
  userId: number;
  subscription?: Subscription | null;
  subscriptionId?: number | null;
  tgId: number;
  name: string | null;
  username: string | null;
  email: string | null;
  birthDate: string | null;
  height: number | null;
  weight: number | null;
  gender: number | 'Male' | 'Female' | null;
  role: 'User' | 'Admin';
  balance: number;
  avatarUrl?: string | null;
  finPasswordHash?: string | null;
  meditationNotifications?: string | null;
  contentNotifications?: boolean;
  promoNotifications?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetUserRes = { success: true; data: User };
export type UpdateProfileBody = Partial<
  Pick<
    User,
    | 'name'
    | 'username'
    | 'birthDate'
    | 'height'
    | 'weight'
    | 'gender'
    | 'avatarUrl'
  >
>;
export type UpdateRoleBody = { role: 'User' | 'Admin' };
export type UpdatePinBody = { pin: string };
export type UpdatePasswordBody = { password: string; oldPassword?: string };
export type UpdateEmailBody = { email: string };
export type UpdateFinPasswordBody = { finPassword: string };
export type UpdateNotificationsBody = {
  meditationNotifications: string;
  contentNotifications: boolean;
  promoNotifications: boolean;
};

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User'],
  endpoints: (b) => ({
    getUser: b.query<GetUserRes, { populate?: boolean } | void>({
      query: (p) => ({
        url: '/user',
        params: { populate: p?.populate ?? true },
      }),
      providesTags: ['User'],
    }),
    updateProfile: b.mutation<GetUserRes, UpdateProfileBody>({
      query: (body) => ({ url: '/user/update/profile', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateRole: b.mutation<GetUserRes, UpdateRoleBody>({
      query: (body) => ({ url: '/user/update/role', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updatePin: b.mutation<{ success: true }, UpdatePinBody>({
      query: (body) => ({ url: '/user/update/pin', method: 'POST', body }),
    }),
    updatePassword: b.mutation<{ success: true }, UpdatePasswordBody>({
      query: (body) => ({ url: '/user/update/password', method: 'POST', body }),
    }),
    updateEmail: b.mutation<GetUserRes, UpdateEmailBody>({
      query: (body) => ({ url: '/user/update/email', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateFinPassword: b.mutation<{ success: true }, UpdateFinPasswordBody>({
      query: (body) => ({
        url: '/user/update/fin-password',
        method: 'POST',
        body,
      }),
    }),
    updateNotifications: b.mutation<{ success: true }, UpdateNotificationsBody>({
      query: (body) => ({
        url: '/user/update/notifications',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserQuery,
  useLazyGetUserQuery,
  useUpdateProfileMutation,
  useUpdateRoleMutation,
  useUpdatePinMutation,
  useUpdatePasswordMutation,
  useUpdateEmailMutation,
  useUpdateFinPasswordMutation,
  useUpdateNotificationsMutation,
} = userApi;
