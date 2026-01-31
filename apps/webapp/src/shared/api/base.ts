import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { sessionActions } from '../../entities/session/model/session.slice'

type GetState = () => { session?: { token?: string | null } }

const API_URL = import.meta.env.VITE_API_URL as string
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

const toPathname = (u: string) => {
  try {
    if (u.startsWith('http')) return new URL(u).pathname
  } catch {}
  return u.startsWith('/') ? u : `/${u}`
}

export const baseQueryWithAuth: BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra,
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
    } catch {}
  }

  const rawUrl =
    typeof args === 'string'
      ? args
      : typeof args === 'object'
        ? String(args.url || '')
        : ''

  const pathFromArgs = toPathname(rawUrl)
  const isAuthRouteFromArgs = pathFromArgs.startsWith('/auth/')
  const isCheckRouteFromArgs = pathFromArgs.startsWith('/auth/check-')

  if (isCheckRouteFromArgs) {
    return rawBaseQuery(args, api, extra)
  }

  if (typeof window !== 'undefined') {
    try {
      const tgId = window.localStorage.getItem(TG_ID_KEY)
      const token = (api.getState() as any)?.session?.token

      if (tgId && token && !isAuthRouteFromArgs) {
        const checkRes = await rawBaseQuery(
          {
            url: '/auth/check-tg',
            method: 'GET',
            params: { id: tgId },
          },
          api,
          extra,
        )

        if ('error' in checkRes && checkRes.error) {
          const status = checkRes.error.status
          if (status === 404 || status === 401) {
            api.dispatch(sessionActions.logout())
            try {
              window.localStorage.removeItem('access_token')
              window.localStorage.removeItem(TG_ID_KEY)
            } catch {}
            window.location.replace('/pin/create')
            return checkRes as any
          }
        } else if ('data' in checkRes && (checkRes as any).data && (checkRes as any).data.success === false) {
          api.dispatch(sessionActions.logout())
          try {
            window.localStorage.removeItem('access_token')
            window.localStorage.removeItem(TG_ID_KEY)
          } catch {}
          window.location.replace('/pin/create')
          return checkRes as any
        }
      }
    } catch {}
  }

  const result = await rawBaseQuery(args, api, extra)

  if (result.error && result.error.status === 401) {
    const routePath = typeof window !== 'undefined' ? window.location.pathname : ''
    const isPinRoute = routePath.startsWith('/pin/')
    const isAuthRoute = isAuthRouteFromArgs

    if (!isPinRoute && !isAuthRoute) {
      api.dispatch(sessionActions.logout())
    }
  }

  return result
}