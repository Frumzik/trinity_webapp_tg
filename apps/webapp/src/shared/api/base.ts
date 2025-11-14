import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { sessionActions } from '../../entities/session/model/session.slice'

type GetState = () => { session?: { token?: string | null } }
const API_URL = import.meta.env.VITE_API_URL as string;
const TG_ID_KEY = 'tgId'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = (getState as GetState)()
    const token = state?.session?.token ?? null
    if (token) headers.set('authorization', `Bearer ${token}`)
    headers.set('content-type', 'application/json')
    return headers
  },
  credentials: 'omit',
})

export const baseQueryWithAuth: BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra
) => {
  if (typeof window !== 'undefined') {
    try {
      const storedTgId = window.localStorage.getItem(TG_ID_KEY)
      const webAppTgId = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.id

      if (storedTgId && webAppTgId && storedTgId !== String(webAppTgId)) {
        api.dispatch(sessionActions.logout())
        return {
          error: {
            status: 'CUSTOM_TG_MISMATCH',
            data: { message: 'tgId mismatch, logged out' },
          },
        } as any
      }
    } catch (e) {}
  }

  const result = await rawBaseQuery(args, api, extra)

  if (result.error && result.error.status === 401) {
    api.dispatch(sessionActions.logout())
  }

  return result
}