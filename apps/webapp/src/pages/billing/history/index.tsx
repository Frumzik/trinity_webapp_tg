// pages/wallet/billing-history/index.tsx
import { useMemo } from "react";

import TopBar from "../../../widgets/topbarTextpage";
import BalanceCard from "../../../widgets/wallet/BalanceCard";
import TransactionList from "../../../widgets/transactions/TransactionList";
import "./index.scss";

import { useGetUserQuery } from "../../../shared/api/user.api";
import { useGetTransactionsQuery } from "../../../shared/api/transactions.api";
import type { Transaction } from "../../../entities/wallet/model/types";

export default function BillingHistoryPage() {
  const { data, isLoading } = useGetUserQuery({ populate: false });
  const amount = data?.data?.balance ?? 0;

  const {
    data: trxData,
    isLoading: isTrxLoading,
    isError: isTrxError,
  } = useGetTransactionsQuery({ populate: true });

  const items: Transaction[] = useMemo(
    () =>
      (trxData?.data ?? []).map((t) => {
        // в БЭКе type: "Purchase" | ...
        // для твоего UI — Purchase считаем списанием (withdraw)
        const mappedType: Transaction["type"] =
          t.type === "Purchase" ? "withdraw" : "deposit";

        return {
          id: t._id || String(t.transactionId || Math.random()),
          type: mappedType,
          amount: t.sum,
          title: t.description || "Транзакция",
          date: t.date,
        } as Transaction;
      }),
    [trxData]
  );

  return (
    <>
      <TopBar title="Кошелек" />
      <div className="billing-history">
        <BalanceCard
          amount={isLoading ? 0 : amount}
          currency="OM"
          onDeposit={() => {}}
          onWithdraw={() => {}}
        />

        {isTrxLoading && (
          <div style={{ padding: 16, opacity: 0.7 }}>Загрузка транзакций…</div>
        )}

        {isTrxError && !isTrxLoading && (
          <div style={{ padding: 16 }}>
            Не удалось загрузить историю. Попробуй обновить позже.
          </div>
        )}

        {!isTrxLoading && !isTrxError && <TransactionList items={items} />}
      </div>
    </>
  );
}