import type { Transaction } from "../../entities/wallet/model/types";
import "./transaction-item.scss";

type Props = { item: Transaction; showDivider?: boolean };

export default function TransactionItem({ item, showDivider = true }: Props) {
  const amount = item.amount;

  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  const amountAbs = Math.abs(amount);

  const [intPart, fracPart] = amountAbs.toFixed(2).split(".");
  const intPretty = Number(intPart).toLocaleString("en-US");

  const time = item.date
    ? new Date(item.date).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "";


  return (
    <div className="trx">
      <div className="trx__left">
        <div className="trx__avatar">
          <span />
        </div>
      </div>

      <div className="trx__mid">
        <div className="trx__sum">
          {sign}
          {intPretty}
          <span className="trx__cents">.{fracPart}</span>
          <span className="trx__cur"> OM</span>
        </div>
        <div className="trx__title">{item.title}</div>
      </div>

      <div className="trx__right">
        {time && <span className="trx__time">{time}</span>}
      </div>

      {showDivider && <div className="trx__sep" />}
    </div>
  );
}