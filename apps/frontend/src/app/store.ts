import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { sessionReducer } from "../entities/session/model/session.slice";
import { authApi } from "../shared/api/auth.api";

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (g) => g().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;