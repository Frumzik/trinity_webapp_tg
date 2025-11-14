import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './base'

export type AccessRule = {
  type: 'subscription' | string
  description?: string
}

export type TrainingType = 'standart' | 'premium' | string

export type TrainingDTO = {
  _id: string
  trainingId: number
  type: TrainingType
  favoritesTag?: string | null
  lessons?: string[]
  childrens?: string[]
  parent?: string | null
  lessonsId?: number[]
  childrensId?: number[]
  parentId?: number | null
  title: string
  description?: string | null
  shortDescription?: string | null
  duration?: string | null
  coverUrl?: string | null
  iconUrl?: string | null
  accessRules?: AccessRule[]
  price?: number | null
  salePrice?: number | null
  accessStatus?: 'available' | 'locked' | string
  progressStatus?: 'not_started' | 'in_progress' | 'completed' | string
  createdAt?: string
  updatedAt?: string
}

export type LessonDTO = {
  mediaUrl: any;
  _id: string;
  lessonId: number;
  type: 'video' | 'audio' | 'text' | string;
  favoritesTag?: string | null;
  parent?: string | null;
  parentId?: number | null;
  title: string;
  description?: string | null;
  duration?: string | null;
  content?: unknown;
  coverUrl?: string | null;
  bgUrl?: string | null;
  accessRules?: AccessRule[];
  price?: number | null;
  salePrice?: number | null;
  accessStatus?: 'available' | 'locked' | string;
  progressStatus?: 'not_started' | 'in_progress' | 'completed' | string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTrainingBody = {
  title: string
  description?: string | null
  shortDescription?: string | null
  coverUrl?: string | null
  iconUrl?: string | null
  duration?: string | null
  parentId?: number | null
  type?: TrainingType
  favoritesTag?: string | null
  price?: number | null
  salePrice?: number | null
  accessRules?: AccessRule[]
}

export type UpdateTrainingBody = Partial<CreateTrainingBody> & {
  accessRules?: AccessRule[]
}

export type CreateLessonBody = {
  title: string
  description?: string | null
  duration?: string | null
  parentId: number
  type?: string
  favoritesTag?: string | null
  price?: number | null
  salePrice?: number | null
  coverUrl?: string | null
  bgUrl?: string | null
  content?: unknown
  accessRules?: AccessRule[]
}

export type UpdateLessonBody = Partial<CreateLessonBody> & {
  accessRules?: AccessRule[]
}


export const contentAdminApi = createApi({
  reducerPath: 'contentAdminApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Training', 'Lesson'],

  endpoints: (b) => ({
    /** ---------- Тренинги ---------- */

    createTraining: b.mutation<{ success: true; data: TrainingDTO }, CreateTrainingBody>({
      query: (body) => ({ url: '/content/training/add', method: 'POST', body }),
      invalidatesTags: (_r, _e, _a) => ['Training'],
    }),

    getTrainingAdmin: b.query<{ success: true; data: TrainingDTO }, { id: number; populate?: boolean }>({
      query: ({ id, populate = true }) => ({
        url: `/content/training/${id}`,
        params: { populate },
      }),
      providesTags: (_r, _e, a) => [{ type: 'Training', id: a.id }],
    }),

    updateTraining: b.mutation<{ success: true; data: TrainingDTO }, { id: number; body: UpdateTrainingBody }>({
      query: ({ id, body }) => ({ url: `/content/training/${id}/update`, method: 'POST', body }),
      invalidatesTags: (_r, _e, a) => [{ type: 'Training', id: a.id }],
    }),

    updateTrainingAccess: b.mutation<{ success: true; data: TrainingDTO }, { id: number; accessRules: AccessRule[] }>(
      {
        query: ({ id, accessRules }) => ({
          url: `/content/training/${id}/update/access-rules`,
          method: 'POST',
          body: { accessRules },
        }),
        invalidatesTags: (_r, _e, a) => [{ type: 'Training', id: a.id }],
      }
    ),

    deleteTraining: b.mutation<{ success: true }, { id: number }>({
      query: ({ id }) => ({ url: `/content/training/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, a) => [{ type: 'Training', id: a.id }],
    }),

    /** ---------- Уроки ---------- */

    createLesson: b.mutation<{ success: true; data: LessonDTO }, CreateLessonBody>({
      query: (body) => ({ url: '/content/lesson/add', method: 'POST', body }),
      invalidatesTags: (_r, _e, a) => ['Lesson'],
    }),

    getLessonAdmin: b.query<{ success: true; data: LessonDTO }, { id: number; populate?: boolean }>({
      query: ({ id, populate = false }) => ({
        url: `/content/lesson/${id}`,
        params: { populate },
      }),
      providesTags: (_r, _e, a) => [{ type: 'Lesson', id: a.id }],
    }),

    updateLesson: b.mutation<{ success: true; data: LessonDTO }, { id: number; body: UpdateLessonBody }>({
      query: ({ id, body }) => ({ url: `/content/lesson/${id}/update`, method: 'POST', body }),
      invalidatesTags: (_r, _e, a) => [{ type: 'Lesson', id: a.id }],
    }),

    updateLessonAccess: b.mutation<{ success: true; data: LessonDTO }, { id: number; accessRules: AccessRule[] }>({
      query: ({ id, accessRules }) => ({
        url: `/content/lesson/${id}/update/access-rules`,
        method: 'POST',
        body: { accessRules },
      }),
      invalidatesTags: (_r, _e, a) => [{ type: 'Lesson', id: a.id }],
    }),

    deleteLesson: b.mutation<{ success: true }, { id: number }>({
      query: ({ id }) => ({ url: `/content/lesson/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, a) => [{ type: 'Lesson', id: a.id }],
    }),
  }),
})

export const {
  useCreateTrainingMutation,
  useGetTrainingAdminQuery,
  useLazyGetTrainingAdminQuery,
  useUpdateTrainingMutation,
  useUpdateTrainingAccessMutation,
  useDeleteTrainingMutation,

  useCreateLessonMutation,
  useGetLessonAdminQuery,
  useLazyGetLessonAdminQuery,
  useUpdateLessonMutation,
  useUpdateLessonAccessMutation,
  useDeleteLessonMutation,
} = contentAdminApi