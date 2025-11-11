import { learningApi } from "./learning.api"

type AddPurchaseReq = { trainingId: number }
type AddPurchaseRes = { success: true }

export const purchaseApi = learningApi.injectEndpoints({
  endpoints: (b) => ({
    addPurchase: b.mutation<AddPurchaseRes, AddPurchaseReq>({
      query: ({ trainingId }) => ({
        url: `/purchase/add`,
        method: "POST",
        params: { trainingId },   // <-- id уходит в query
        body: {},                 // <-- пустое тело, иначе 400
      }),
      invalidatesTags: (_r, _e, a) => [
        "Learning",
        { type: "Learning", id: a.trainingId },
      ],
    }),
  }),
})

export const { useAddPurchaseMutation } = purchaseApi