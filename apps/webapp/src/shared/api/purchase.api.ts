// shared/api/purchase.api.ts
import { learningApi } from "./learning.api";

export type AddPurchaseReq = {
  type: "Training" | "Subscription" | "Lesson";
  content?: number[];
  sale?: boolean;
  subscriptionDays?: number;
  subscriptionSum?: number;
};

export type AddPurchaseRes = { success: true };

export const purchaseApi = learningApi.injectEndpoints({
  endpoints: (b) => ({
    addPurchase: b.mutation<AddPurchaseRes, AddPurchaseReq>({
      query: (body) => ({
        url: `/purchase/add`,
        method: "POST",
        body,
      }),
      invalidatesTags: ['Learning'],
    }),
  }),
});

export const { useAddPurchaseMutation } = purchaseApi;