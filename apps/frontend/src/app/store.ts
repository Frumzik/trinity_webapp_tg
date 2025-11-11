import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { sessionReducer } from "../entities/session/model/session.slice";
import { authApi } from "../shared/api/auth.api";
import { userApi } from '../shared/api/user.api';
import { contentAdminApi } from '../shared/api/contentAdmin.api';
import { learningApi } from '../shared/api/learning.api';
import { favoritesApi } from '../shared/api/favorites.api';
import { referralsApi } from '../shared/api/referrals.api';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [contentAdminApi.reducerPath]: contentAdminApi.reducer,
    [learningApi.reducerPath]: learningApi.reducer,
    [favoritesApi.reducerPath]: favoritesApi.reducer,
    [referralsApi.reducerPath]: referralsApi.reducer,
  },
  middleware: (g) =>
    g().concat(
      authApi.middleware,
      userApi.middleware,
      contentAdminApi.middleware,
      learningApi.middleware,
      favoritesApi.middleware,
      referralsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;