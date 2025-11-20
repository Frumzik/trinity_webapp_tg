import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./base";

export type DepositAddress = {
  address: string;
};

export type WithdrawBody = {
  address: string;
  amount: string;
};

export type WithdrawRes = { success: boolean };

export const acquiringApi = createApi({
  reducerPath: "acquiringApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (b) => ({
    getDepositAddress: b.query<{ success: true; data: DepositAddress }, void>({
      query: () => ({ url: "/acquiring/deposit-address" }),
    }),
    withdraw: b.mutation<WithdrawRes, WithdrawBody>({
      query: (body) => ({
        url: "/acquiring/withdraw",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetDepositAddressQuery, useWithdrawMutation } = acquiringApi;