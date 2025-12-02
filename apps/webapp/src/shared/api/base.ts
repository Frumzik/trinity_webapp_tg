import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { sessionActions } from '../../entities/session/model/session.slice';

type GetState = () => { session?: { token?: string | null } };

const API_URL = import.meta.env.VITE_API_URL as string;
const TG_ID_KEY = 'tgId';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = (getState as GetState)();
    const token = state?.session?.token ?? null;
    if (token) headers.set('authorization', `Bearer ${token}`);
    headers.set('content-type', 'application/json');
    return headers;
  },
  credentials: 'omit',
});

function getTgIdSafe() {
  try {
    const ls = window.localStorage.getItem(TG_ID_KEY);
    const wa = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    return ls || (wa ? String(wa) : null);
  } catch {
    return null;
  }
}

function forceLogoutAndGoToPin(api: any) {
  api.dispatch(sessionActions.logout());
  try {
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem(TG_ID_KEY);
  } catch {}

  window.location.replace('/pin/create');
}

export const baseQueryWithAuth: BaseQueryFn<
  FetchArgs | string,
  unknown,
  FetchBaseQueryError
> = async (args, api, extra) => {
  // 1. Проверка, что tgId не поменялся (твоя логика)
  if (typeof window !== 'undefined') {
    try {
      const storedTgId = window.localStorage.getItem(TG_ID_KEY);
      const webAppTgId = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (storedTgId && webAppTgId && storedTgId !== String(webAppTgId)) {
        forceLogoutAndGoToPin(api);
        return {
          error: {
            status: 'CUSTOM_TG_MISMATCH',
            data: { message: 'tgId mismatch, logged out' },
          },
        } as any;
      }
    } catch {}
  }

  if (typeof window !== 'undefined') {
    const url =
      typeof args === 'string'
        ? args
        : typeof args === 'object'
          ? String(args.url || '')
          : '';
    const isAuthRoute = url.startsWith('/auth/');
    const token = (api.getState() as any)?.session?.token ?? null;
    const tgId = getTgIdSafe();

    if (!isAuthRoute && tgId && token) {
      const checkRes = await rawBaseQuery(
        {
          url: '/auth/check-tg',
          method: 'GET',
          params: { id: tgId },
        },
        api,
        extra
      );


      if ('error' in checkRes && checkRes.error) {
        const st = checkRes.error.status;
        if (st === 404 || st === 401) {
          forceLogoutAndGoToPin(api);
          return checkRes as any;
        }
      }

      if ('data' in checkRes && checkRes.data) {
        const d: any = checkRes.data;
        const exists =
          d?.exists ?? d?.data?.exists ?? d?.data?.userExists ?? null;
        const success = d?.success;

        if (success === false || exists === false) {
          forceLogoutAndGoToPin(api);
          return checkRes as any;
        }
      }
    }
  }

  const result = await rawBaseQuery(args, api, extra);

  if (result.error && result.error.status === 401) {
    forceLogoutAndGoToPin(api);
  }

  return result;
};