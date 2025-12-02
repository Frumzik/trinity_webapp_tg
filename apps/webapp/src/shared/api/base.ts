// src/shared/api/base.ts
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
    const ls = localStorage.getItem(TG_ID_KEY);
    const wa = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    return ls || (wa ? String(wa) : null);
  } catch {
    return null;
  }
}

function forceLogoutAndGoToPin(api: any) {
  api.dispatch(sessionActions.logout());
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem(TG_ID_KEY);
  } catch {}

  if (!window.location.pathname.startsWith('/pin')) {
    window.location.replace('/pin/create');
  }
}

export const baseQueryWithAuth: BaseQueryFn<
  FetchArgs | string,
  unknown,
  FetchBaseQueryError
> = async (args, api, extra) => {
  const token = (api.getState() as any)?.session?.token ?? null;
  const tgId = typeof window !== 'undefined' ? getTgIdSafe() : null;

  const url =
    typeof args === 'string'
      ? args
      : typeof args === 'object'
        ? String(args.url || '')
        : '';

  const isAuthRoute =
    url.startsWith('/auth/') ||
    url.startsWith('/pin/') ||
    url.startsWith('/tg/') ||
    url.startsWith('/user/update/pin');

  const isUserRoute = url.startsWith('/user');

  if (typeof window !== 'undefined' && tgId && token && !isAuthRoute) {
    const checkRes = await rawBaseQuery(
      {
        url: '/auth/check-tg',
        method: 'GET',
        params: { id: tgId, _ts: Date.now() },
        cache: 'no-store',
      } as any,
      api,
      extra
    );

    if ('error' in checkRes && checkRes.error) {
      const st = checkRes.error.status;
      if (st === 404 || st === 401) {
        // пользователя нет → выкидываем
        forceLogoutAndGoToPin(api);
        return checkRes as any;
      }
    }

    if ('data' in checkRes && checkRes.data) {
      const d: any = checkRes.data;
      const exists = d?.exists ?? d?.data?.exists ?? d?.data?.userExists;

      if (exists === false) {
        forceLogoutAndGoToPin(api);
        return checkRes as any;
      }
    }
  }

  const result = await rawBaseQuery(args, api, extra);

  if (result.error) {
    const st = result.error.status;

    if (st === 401) {
      forceLogoutAndGoToPin(api);
    }

    if (st === 404 && isUserRoute) {
      forceLogoutAndGoToPin(api);
    }
  }

  return result;
};