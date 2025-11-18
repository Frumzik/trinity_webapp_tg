import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TgUser = { id: number; username?: string; first_name?: string; last_name?: string } | null;

type SessionState = {
  token: string | null;
  tgUser: TgUser;
};

const ACCESS_TOKEN_KEY = "access_token";
const TG_ID_KEY = "tgId";

const initialState: SessionState = {
  token: typeof localStorage !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null,
  tgUser: null,
};

const slice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;

      if (typeof localStorage === "undefined") return;

      if (action.payload) localStorage.setItem(ACCESS_TOKEN_KEY, action.payload);
      else localStorage.removeItem(ACCESS_TOKEN_KEY);
    },

    setTgUser(state, action: PayloadAction<TgUser>) {
      state.tgUser = action.payload;

      if (typeof localStorage === "undefined") return;

      const id = action.payload?.id;
      if (id) localStorage.setItem(TG_ID_KEY, String(id));
      else localStorage.removeItem(TG_ID_KEY);
    },

    logout(state) {
      state.token = null;
      state.tgUser = null;

      if (typeof localStorage === "undefined") return;

      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(TG_ID_KEY);
    },
  },
});

export const sessionReducer = slice.reducer;
export const sessionActions = slice.actions;