import type { Transaction } from "../../entities/wallet/model/types";
import TransactionItem from "./TransactionItem";
import "./transaction-list.scss";

type Props = { items: Transaction[] };

export default function TransactionList({ items }: Props) {
  return (
    <div className="trx-list">
      <div className="trx-list-title">Список транзакций</div>
      <div className="trx-list__day">16 марта</div>
      {items.map((it) => (
        <TransactionItem key={it.id} item={it} />
      ))}
      <div className="trx-list__day">16 марта</div>
      {items.map((it) => (
        <TransactionItem key={it.id} item={it} />
      ))}
    </div>
  );
}
