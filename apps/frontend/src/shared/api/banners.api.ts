// src/shared/api/banners.api.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './base';

export type BannerDto = {
  id?: number | string;
  _id?: number | string;
  bannerId?: number | string;
  title?: string;
  name?: string;
  imageUrl?: string;
  iconUrl?: string;
  coverUrl?: string;
  badge?: string | number;
  counter?: string | number;
};

export type Banner = {
  id: number | string;
  title: string;
  imageUrl: string;
  rightText?: string | number;
};

export const bannersApi = createApi({
  reducerPath: 'bannersApi',
  baseQuery: baseQueryWithAuth, // <- твой общий базовый запрос с auth/credentials
  tagTypes: ['Banners'],
  endpoints: (build) => ({

    // GET /banners
    getBanners: build.query<Banner[], void>({
      query: () => ({ url: '/banners', method: 'GET' }),
      transformResponse: (resp: any): Banner[] => {
        const arr: BannerDto[] = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp) ? resp : [];
        return arr.map((b) => ({
          id: (b.id ?? b._id ?? b.bannerId)!,
          title: (b.title ?? b.name ?? '') as string,
          imageUrl: (b.imageUrl ?? b.iconUrl ?? b.coverUrl ?? '') as string,
          rightText: (b.counter ?? b.badge) as any,
        }));
      },
      providesTags: ['Banners'],
    }),

    // POST /banners/{id}/add-view
    addBannerView: build.mutation<{ success?: boolean }, string | number>({
      query: (id) => ({ url: `/banners/${id}/add-view`, method: 'POST' }),
      // сервер сам «перекинет в конец», но чтобы UI сразу реагировал — инвалидируем
      invalidatesTags: ['Banners'],
    }),

    // опционально, если пригодится админка:
    addBanner: build.mutation<any, FormData | Record<string, any>>({
      query: (body) => ({ url: '/banners/add', method: 'POST', body }),
      invalidatesTags: ['Banners'],
    }),
    deleteBanner: build.mutation<any, { id: string | number }>({
      query: ({ id }) => ({ url: '/banners/delete', method: 'POST', body: { id } }),
      invalidatesTags: ['Banners'],
    }),
    getBannerById: build.query<Banner | null, string | number>({
      query: (id) => ({ url: `/banners/${id}`, method: 'GET' }),
      transformResponse: (b: BannerDto | { data?: BannerDto }) => {
        const d = (b as any)?.data ?? b;
        if (!d) return null;
        return {
          id: (d.id ?? d._id ?? d.bannerId)!,
          title: d.title ?? d.name ?? '',
          imageUrl: d.imageUrl ?? d.iconUrl ?? d.coverUrl ?? '',
          rightText: d.counter ?? d.badge,
        } as Banner;
      },
      providesTags: ['Banners'],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useAddBannerViewMutation,
  useAddBannerMutation,
  useDeleteBannerMutation,
  useGetBannerByIdQuery,
} = bannersApi;