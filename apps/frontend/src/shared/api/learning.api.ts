import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './base'

export type AccessRuleType = 'free' | 'subscription' | 'one_time_payment' | 'training_completed' | string

export type LearningLesson = {
  _id: string
  lessonId: number
  title: string
  duration?: string | null
  coverUrl?: string | null
  accessStatus: 'available' | 'locked'
  progressStatus: 'not_started' | 'in_progress' | 'completed'
}

export type LearningNode = {
  _id: string
  trainingId: number
  type: string
  title: string
  description?: string | null
  coverUrl?: string | null
  accessStatus: 'available' | 'locked'
  accessRules: { type: AccessRuleType; value?: number; description?: string }[]
  price?: number | null
  salePrice?: number | null
  progressStatus: 'not_started' | 'in_progress' | 'completed'
  childrens: LearningNode[]
  lessons: LearningLesson[]
}

export type GetTrainingTreeRes = { success: true; data: LearningNode[] }
export type GetUserTrainingRes = { success: true; data: LearningNode }

export const learningApi = createApi({
  reducerPath: 'learningApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Learning'],
  endpoints: (b) => ({
    getTrainingTree: b.query<GetTrainingTreeRes, void>({
      query: () => ({ url: '/learning/training' }),
      providesTags: ['Learning'],
    }),

    getUserTrainingById: b.query<GetUserTrainingRes, { id: number; populate?: boolean }>({
      query: ({ id, populate }) => ({
        url: `/learning/training/${id}`,
        params: populate ? { populate: true } : undefined,
      }),
      providesTags: (_r, _e, a) => [{ type: 'Learning', id: a.id }],
    }),
  }),
})

export const {
  useGetTrainingTreeQuery,
  useLazyGetTrainingTreeQuery,
  useGetUserTrainingByIdQuery,
  useLazyGetUserTrainingByIdQuery,
} = learningApi