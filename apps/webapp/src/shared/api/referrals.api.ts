import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './base'

export type RefStat = { level: number; count: number; totalEarn: number }
export type RefLevelList = { level: number; totalEarn: number; referrals: Array<Record<string, any>> }

export const referralsApi = createApi({
  reducerPath: 'referralsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Referrals'],
  endpoints: (b) => ({
    getReferralsStats: b.query<RefStat[], void>({
      async queryFn(_a, _api, _e, baseQuery) {
        const r: any = await baseQuery({ url: '/referrals/stats' })
        if (r.error) return { error: r.error }
        return { data: (r.data?.data ?? []) as RefStat[] }
      },
      providesTags: ['Referrals'],
    }),
    getReferralsLevels: b.query<RefLevelList[], void>({
      async queryFn(_a, _api, _e, baseQuery) {
        const r: any = await baseQuery({ url: '/referrals/list' })
        if (r.error) return { error: r.error }
        return { data: (r.data?.data ?? []) as RefLevelList[] }
      },
      providesTags: ['Referrals'],
    }),
  }),
})

export const { useGetReferralsStatsQuery, useGetReferralsLevelsQuery, useLazyGetReferralsLevelsQuery } = referralsApi