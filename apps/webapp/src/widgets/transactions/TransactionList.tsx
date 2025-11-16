import type { Transaction } from "../../entities/wallet/model/types";
import TransactionItem from "./TransactionItem";
import "./transaction-list.scss";

type Props = { items: Transaction[] };
const mockItems: Transaction[] = [
  {
    id: "t1",
    type: "deposit",
    amount: 150,
    title: "Пополнение кошелька",
  } as Transaction,
  {
    id: "t2",
    type: "withdraw",
    amount: 25.5,
    title: "Вывод средств",
  } as Transaction,
  {
    id: "t3",
    type: "deposit",
    amount: 320,
    title: "Вознаграждение за друзей",
  } as Transaction,
  {
    id: "t4",
    type: "deposit",
    amount: 150,
    title: "Пополнение кошелька",
  } as Transaction,
  {
    id: "t5",
    type: "withdraw",
    amount: 25.5,
    title: "Вывод средств",
  } as Transaction,
  {
    id: "t6",
    type: "deposit",
    amount: 320,
    title: "Вознаграждение за друзей",
  } as Transaction,
  {
    id: "t7",
    type: "deposit",
    amount: 150,
    title: "Пополнение кошелька",
  } as Transaction,
  {
    id: "t8",
    type: "withdraw",
    amount: 25.5,
    title: "Вывод средств",
  } as Transaction,
  {
    id: "t9",
    type: "deposit",
    amount: 320,
    title: "Вознаграждение за друзей",
  } as Transaction,
];
export default function TransactionList({ items }: Props) {
  const list = items.length ? items : mockItems;
  return (
    <div className="trx-list">
      <div className="trx-list-title">Список транзакций</div>

      <div className="trx-list__day">16 марта</div>
      {list.map((it) => (
        <TransactionItem key={it.id} item={it} />
      ))}
    </div>
  );
}
