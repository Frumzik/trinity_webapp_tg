import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './base'

type BucketsRes = { success: true; data: { name: string }[] }
type UploadRes  = { success: true; url: string; key: string; fileName: string }
type DeleteRes  = { success: true }

export const filesApi = createApi({
  reducerPath: 'filesApi',
  baseQuery: baseQueryWithAuth,
  endpoints: (b) => ({
    getBuckets: b.query<BucketsRes, void>({
      query: () => ({ url: '/file/buckets' }),
    }),

    uploadFile: b.mutation<
      UploadRes,
      { file: File; bucket?: string; path?: string }
    >({
      query: ({ file, bucket, path }) => {
        const form = new FormData()
        form.append('file', file)
        if (bucket) form.append('bucket', bucket)
        if (path) form.append('path', path)
        return {
          url: '/file/upload',
          method: 'POST',
          body: form,
        }
      },
    }),

    deleteFile: b.mutation<DeleteRes, { key: string; bucket?: string }>({
      query: ({ key, bucket }) => ({
        url: '/file/delete',
        method: 'DELETE',
        body: { key, bucket },
      }),
    }),
  }),
})

export const {
  useGetBucketsQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
} = filesApi