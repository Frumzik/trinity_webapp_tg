// shared/api/referrals.api.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './base';

// если бек отдаёт другой формат — адаптируй типы минимально
export type ReferralLevelRow = {
  level: number;            // номер уровня
  amount?: number | null;   // сумма вознаграждения по уровню (ОМ)
  count?: number | null;    // опц: кол-во рефералов на уровне
};

export type GetRefStatsRes = {
  success: boolean;
  data: {
    totalIncome?: number | null;     // общий доход пользователя
    levels?: number | null;          // всего уровней
    items: ReferralLevelRow[];       // список уровней
  };
  message?: string[];
};

// элемент списка рефералов (структура может отличаться — рендерим безопасно)
export type ReferralItem = {
  id?: string | number;
  userId?: number;
  name?: string | null;
  email?: string | null;
  joinedAt?: string | null;
  amount?: number | null;            // вклад/доход с этого реферала
  [k: string]: any;                  // чтобы не падать, если бек пришлёт ещё поля
};

export type GetRefListRes = {
  success: boolean;
  data: {
    level: number;
    items: ReferralItem[];
  };
  message?: string[];
};

export const referralsApi = createApi({
  reducerPath: 'referralsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Referrals'],
  endpoints: (b) => ({
    getReferralsStats: b.query<GetRefStatsRes, void>({
      query: () => ({ url: '/referrals/stats' }),
      providesTags: ['Referrals'],
    }),

    // бек обычно ждёт level или generation. Если у тебя другое имя — просто замени ключ ниже.
    getReferralsList: b.query<GetRefListRes, { level: number }>({
      query: ({ level }) => ({
        url: '/referrals/list',
        params: { level }, // <- поменяй на { generation: level } если нужно
      }),
      providesTags: (_r, _e, a) => [{ type: 'Referrals', id: `L${a.level}` }],
    }),
  }),
});

export const {
  useGetReferralsStatsQuery,
  useGetReferralsListQuery,
  useLazyGetReferralsListQuery,
} = referralsApi;