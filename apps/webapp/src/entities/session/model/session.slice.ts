import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TgUser = { id: number; username?: string; first_name?: string; last_name?: string } | null;

type SessionState = {
  token: string | null;
  tgUser: TgUser;
};

const initialState: SessionState = {
  token: typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null,
  tgUser: null,
};

const slice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (action.payload) localStorage.setItem("access_token", action.payload);
      else localStorage.removeItem("access_token");
    },
    setTgUser(state, action: PayloadAction<TgUser>) {
      state.tgUser = action.payload;
    },
    logout(state) {
      state.token = null;
      localStorage.removeItem("access_token");
    },
  },
});

export const sessionReducer = slice.reducer;
export const sessionActions = slice.actions;