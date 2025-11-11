import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './base';

export type FavoriteType = 'Lesson' | 'Training';

export type FavoriteItem = {
  type: FavoriteType;
  trainingId?: number;
  lessonId?: number;
};

export type GetFavoritesRes =
  | { success: true; data: FavoriteItem[] }
  | { success: false; message: string[] };

export type AddFavoriteReq = {
  type: FavoriteType;
  trainingId?: number;
  lessonId?: number;
};

export type AddFavoriteRes = { success: true; data: true };

export const favoritesApi = createApi({
  reducerPath: 'favoritesApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Favorites'],
  endpoints: (b) => ({
    // 404 = «Избранное не найдено» -> считаем как пустой список
    getFavorites: b.query<FavoriteItem[], { populate?: boolean } | void>({
      async queryFn(arg, _api, _extra, baseQuery) {
        const res: any = await baseQuery({
          url: '/favorites',
          params: arg?.populate ? { populate: true } : undefined,
        });
        if (res.error) {
          if (res.error.status === 404) return { data: [] as FavoriteItem[] }; // <-- важно
          return { error: res.error };
        }
        return { data: (res.data?.data ?? []) as FavoriteItem[] };
      },
      providesTags: ['Favorites'],
    }),

    addFavorite: b.mutation<AddFavoriteRes, AddFavoriteReq>({
      query: (body) => ({ url: '/favorites', method: 'POST', body }),
      invalidatesTags: ['Favorites'],
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useLazyGetFavoritesQuery,
  useAddFavoriteMutation,
} = favoritesApi;