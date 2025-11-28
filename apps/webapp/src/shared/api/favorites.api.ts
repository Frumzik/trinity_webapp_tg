import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./base";

export type FavoriteType = "Lesson" | "Training";

export type FavoriteTraining = {
  _id: string;
  trainingId: number;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  coverUrl?: string | null;
  iconUrl?: string | null;
};

export type FavoriteLesson = {
  lessonId: number;
  title?: string | null;
  duration?: string | null;
  coverUrl?: string | null;
  training?: FavoriteTraining;
};

export type FavoriteEntry = {
  _id: string;
  type: FavoriteType;
  favoriteId: number;
  userId: number;
  trainingId?: number;
  lessonId?: number;
  training?: FavoriteTraining;
  lesson?: FavoriteLesson;
};

export type FavoriteCategory = {
  tag?: string | null;
  title: string;
  favorites: FavoriteEntry[];
};

export const favoritesApi = createApi({
  reducerPath: "favoritesApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Favorites"],
  endpoints: (b) => ({
    getFavorites: b.query<FavoriteCategory[], { populate?: boolean } | void>({
      async queryFn(arg, _api, _extra, baseQuery) {
        const params: any = { _ts: Date.now() }; // 👈 анти-кешовый параметр
        if (arg?.populate) params.populate = true;

        const res: any = await baseQuery({
          url: "/favorites",
          params,
          cache: "no-store" as RequestCache,
        });

        if (res.error) {
          if (res.error.status === 404) {
            return { data: [] as FavoriteCategory[] };
          }
          return { error: res.error };
        }

        return { data: (res.data?.data ?? []) as FavoriteCategory[] };
      },
      providesTags: ["Favorites"],
    }),

    addFavorite: b.mutation<
      { success: true; data: true },
      { type: FavoriteType; trainingId?: number; lessonId?: number }
    >({
      query: (body) => ({ url: "/favorites", method: "POST", body }),
      invalidatesTags: ["Favorites"],
    }),

    deleteFavorite: b.mutation<
      { success: true; data: true },
      { favoriteId: number }
    >({
      query: (body) => ({
        url: "/favorites",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Favorites"],
    }),
  }),
});
export const { useGetFavoritesQuery, useAddFavoriteMutation, useDeleteFavoriteMutation } = favoritesApi;