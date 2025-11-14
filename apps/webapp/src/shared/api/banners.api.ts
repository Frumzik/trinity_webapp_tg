import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './base';

export type BannerDto = {
  _id?: string | number;
  bannerId?: number | string;

  miniatureUrl?: string;
  imageUrl?: string;
  linkUrl?: string | null;
  description?: string | null;

  viewedUsers?: number[];
  endDate?: string | null;

  // старые возможные поля
  title?: string;
  name?: string;
  iconUrl?: string;
  coverUrl?: string;
  badge?: string | number;
  counter?: string | number;
};

export type Banner = {
  id: number | string;        // bannerId/_id/id
  title: string;              // description (или запасной текст)
  imageUrl: string;           // miniatureUrl > imageUrl > ...
  rightText?: string | number; // viewedUsers.length или badge/counter
  linkUrl?: string | null;    // НУЖНО для клика
};

export const bannersApi = createApi({
  reducerPath: 'bannersApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Banners'],
  endpoints: (build) => ({

    getBanners: build.query<Banner[], void>({
      query: () => ({ url: '/banners', method: 'GET' }),
      transformResponse: (resp: any): Banner[] => {
        const arr: BannerDto[] = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp) ? resp : [];

        return arr.map((b, i) => {
          const id = (b.bannerId ?? b._id ?? i)!;

          // title берём из description; если нет — из title/name; если нет — из человекочитаемого linkUrl
          const linkReadable =
            (b.linkUrl?.startsWith('/') ? b.linkUrl.slice(1) : b.linkUrl)?.replace(/^https?:\/\/(www\.)?/, '') || '';
          const title =
            (b.description?.trim?.()) ||
            (b.title?.trim?.()) ||
            (b.name?.trim?.()) ||
            linkReadable ||
            '—';

          const imageUrl =
            b.miniatureUrl || b.imageUrl || b.iconUrl || b.coverUrl || '';

          const rightText =
            Array.isArray(b.viewedUsers) ? b.viewedUsers.length :
              (b.counter ?? b.badge);

          return {
            id,
            title,
            imageUrl,
            rightText,
            linkUrl: b.linkUrl ?? null,
          } as Banner;
        });
      },
      providesTags: ['Banners'],
    }),

    addBannerView: build.mutation<{ success?: boolean }, string | number>({
      query: (id) => ({ url: `/banners/${id}/add-view`, method: 'POST' }),
      invalidatesTags: ['Banners'],
    }),

    // оставляю на будущее
    addBanner: build.mutation<any, Record<string, any>>({
      query: (body) => ({ url: '/banners/add', method: 'POST', body }),
      invalidatesTags: ['Banners'],
    }),
    deleteBanner: build.mutation<any, { id: string | number }>({
      query: ({ id }) => ({ url: '/banners/delete', method: 'POST', body: { id } }),
      invalidatesTags: ['Banners'],
    }),
    getBannerById: build.query<Banner | null, string | number>({
      query: (id) => ({ url: `/banners/${id}`, method: 'GET' }),
      transformResponse: (r: any) => {
        const b: BannerDto | undefined = (r && r.data) || r;
        if (!b) return null;

        const linkReadable =
          (b.linkUrl?.startsWith('/') ? b.linkUrl.slice(1) : b.linkUrl)?.replace(/^https?:\/\/(www\.)?/, '') || '';

        return {
          id: (b.bannerId ?? b._id ?? b as any)!,
          title: b.description?.trim?.() || b.title?.trim?.() || b.name?.trim?.() || linkReadable || '—',
          imageUrl: b.miniatureUrl || b.imageUrl || b.iconUrl || b.coverUrl || '',
          rightText: Array.isArray(b.viewedUsers) ? b.viewedUsers.length : (b.counter ?? b.badge),
          linkUrl: b.linkUrl ?? null,
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