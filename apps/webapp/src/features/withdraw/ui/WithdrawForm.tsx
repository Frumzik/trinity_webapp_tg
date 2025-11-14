import { useEffect, useState } from "react";
import QuickAmounts from "../../../widgets/wallet/QuickAmounts";
import type {
  WithdrawQuote,
  Network,
} from "../../../entities/wallet/model/types";
import GradientButton from "../../../shared/ui/gradient-button";
import "./withdraw-form.scss";

type Props = {
  quote: (value: number) => Promise<WithdrawQuote>;
  submit: (value: number, to: string, net: Network) => Promise<void>;
};

export default function WithdrawForm({ quote, submit }: Props) {
  const [amount, setAmount] = useState(1000);
  const [addr, setAddr] = useState("");
  const [net] = useState<Network>("USDT_BEP20");
  const [q, setQ] = useState<WithdrawQuote | null>(null);
  const recom = [500, 1000, 1500, 2000];

  useEffect(() => {
    quote(amount).then(setQ);
  }, [amount, quote]);

  const onSend = async () => {
    await submit(amount, addr, net);
  };

  return (
    <div className="wform">
      <div className="wform__title">Вывод</div>
      <input
        className="wform__input"
        value={amount}
        onChange={(e) =>
          setAmount(Number(e.target.value.replace(/\D/g, "") || 0))
        }
      />
      <QuickAmounts options={recom} onPick={setAmount} />
      {q && (
        <div className="wform__fee">
          Комиссия составит {q.fee.fixed} $ (фиксированная {q.fee.percent}%)
        </div>
      )}
      <input
        className="wform__addr"
        placeholder="Вставьте адрес USDT BEP 20"
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
      />
      <div className="wform__agree">
        Нажимая кнопку «вывести», я подтверждаю, что ознакомился с Правилами
        сервиса
      </div>
      <GradientButton onClick={onSend}>
        Вывести ${q ? q.total.toFixed(0) : amount}
      </GradientButton>
    </div>
  );
}
