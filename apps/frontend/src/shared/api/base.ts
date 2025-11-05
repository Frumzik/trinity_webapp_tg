import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { sessionActions } from '../../entities/session/model/session.slice'

type GetState = () => { session?: { token?: string | null } }

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000',
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
  const result = await rawBaseQuery(args, api, extra)
  if (result.error && result.error.status === 401) {
    api.dispatch(sessionActions.logout())
  }
  return result
}