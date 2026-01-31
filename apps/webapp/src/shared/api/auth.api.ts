import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './base'

type RegisterTgReq = { type: 'TG'; tgId: number; pin: string; username?: string; name?: string; partnerId?: number }
type RegisterTgRes = { userId: number }

type LoginTgReq = { type: 'TG'; tgId: number; pin: string }
type PromoTgReq = { type: 'PROMO_TG'; tgId: number; pin: string }

type LoginRes = { access_token: string }

type CheckTgRes = { exists?: boolean; data?: boolean } | boolean
type CheckPinRes = { hasPin?: boolean; data?: boolean } | boolean

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithAuth,
  endpoints: (b) => ({
    checkTg: b.query<CheckTgRes, number>({
      query: (tgId) => ({ url: '/auth/check-tg', params: { id: tgId } }),
    }),
    checkPin: b.query<CheckPinRes, number>({
      query: (tgId) => ({ url: '/auth/check-pin', params: { id: tgId } }),
    }),
    registerTg: b.mutation<RegisterTgRes, RegisterTgReq>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    loginTg: b.mutation<LoginRes, LoginTgReq>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    promoSetPin: b.mutation<LoginRes, PromoTgReq>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    checkAuth: b.query<{ ok: true }, void>({
      query: () => ({ url: '/auth/check-auth' }),
    }),
  }),
})

export const {
  useLazyCheckTgQuery,
  useLazyCheckPinQuery,
  useRegisterTgMutation,
  useLoginTgMutation,
  usePromoSetPinMutation,
  useLazyCheckAuthQuery,
} = authApi