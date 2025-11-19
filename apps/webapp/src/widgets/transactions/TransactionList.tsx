import type { Transaction } from "../../entities/wallet/model/types";
import TransactionItem from "./TransactionItem";
import "./transaction-list.scss";

type Props = { items: Transaction[] };

export default function TransactionList({ items }: Props) {
  const hasItems = items.length > 0;

  const dayLabel =
    hasItems && (items[0] as any).date
      ? new Date((items[0] as any).date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      })
      : null;

  return (
    <div className="trx-list">
      <div className="trx-list-title">Список транзакций</div>

      {dayLabel && <div className="trx-list__day">{dayLabel}</div>}

      {hasItems ? (
        items.map((it) => <TransactionItem key={it.id} item={it} />)
      ) : (
        <div className={"history-pust"}>
          История транзакций пока пустая.
        </div>
      )}
    </div>
  );
}