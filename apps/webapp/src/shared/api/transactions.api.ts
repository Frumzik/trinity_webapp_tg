import { learningApi } from "./learning.api";

export type TransactionDto = {
  _id: string;
  type: string;
  sum: number;
  date: string;
  description?: string;
  transactionId?: number;
};

export type GetTransactionsRes = {
  success: true;
  data: TransactionDto[];
};

export const transactionsApi = learningApi.injectEndpoints({
  endpoints: (build) => ({
    getTransactions: build.query<GetTransactionsRes, { populate?: boolean } | void>({
      query: (arg) => ({
        url: "/transactions",
        params: arg?.populate ? { populate: true } : undefined,
      }),
    }),
  }),
});

export const { useGetTransactionsQuery } = transactionsApi;