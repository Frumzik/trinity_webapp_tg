import { useEffect, useState } from "react";
import {
  getBalance,
  getTransactions,
} from "../../../entities/wallet/api/walet.api.ts";
import BalanceCard from "../../../widgets/wallet/BalanceCard";
import TransactionList from "../../../widgets/transactions/TransactionList";
import type { Transaction } from "../../../entities/wallet/model/types";
import "./index.scss";
import TopBar from "../../../widgets/topbarTextpage";

export default function BillingHistoryPage() {
  const [amount, setAmount] = useState(0);
  const [list, setList] = useState<Transaction[]>([]);
  useEffect(() => {
    getBalance().then((b) => setAmount(b.amount));
    getTransactions().then(setList);
  }, []);
  return (
    <>
      <TopBar title="Общий доход" />
      <div className="billing-history">
        <BalanceCard
          amount={amount}
          currency="$"
          onDeposit={() => {}}
          onWithdraw={() => {}}
        />
        <TransactionList items={list} />
      </div>
    </>
  );
}
