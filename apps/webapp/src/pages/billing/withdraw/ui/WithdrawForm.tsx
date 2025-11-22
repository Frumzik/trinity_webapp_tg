import { useMemo, useState } from "react";
import GradientButton from "../../../../shared/ui/gradient-button";
import { useGetUserQuery } from "../../../../shared/api/user.api";
import { getTelegramUser } from "../../../../shared/telegram/telegram";
import "./withdraw-form.scss";
import { Link } from "react-router-dom";

type Props = {
  avatarSrc?: string;
  title: string;
  subtitle?: string;
  balance: number;
  loading?: boolean;
  submit: (value: number, to: string) => Promise<void>;
};

const PERCENT_FEE = 0.5;

function avatarFrom(username?: string | null, name?: string | null) {
  const seed = username || name || "user";
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    seed
  )}`;
}

export default function WithdrawForm({
                                       avatarSrc,
                                       title,
                                       subtitle,
                                       balance,
                                       loading = false,
                                       submit,
                                     }: Props) {
  const [amount, setAmount] = useState(0);
  const [addr, setAddr] = useState("");
  const [sending, setSending] = useState(false);

  const { data } = useGetUserQuery({ populate: true });
  const u = (data as any)?.data;
  const tg = getTelegramUser();

  const displayName = useMemo(() => {
    if (u?.name) return u.name;
    if (tg?.first_name || tg?.last_name) {
      return [tg?.first_name, tg?.last_name].filter(Boolean).join(" ");
    }
    return "Без имени";
  }, [u, tg]);

  const displayUsername = useMemo(() => {
    return u?.username || tg?.username || "—";
  }, [u, tg]);

  const autoAvatar = useMemo(() => {
    return (
      (u as any)?.avatarUrl ||
      (tg as any)?.photo_url ||
      avatarFrom(displayUsername, displayName)
    );
  }, [u, tg, displayUsername, displayName]);

  const finalAvatar = avatarSrc || autoAvatar;

  const [intPart, fracPart] = useMemo(() => {
    const safe = Number.isFinite(amount) ? amount : 0;
    const s = safe.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const [i, f = "00"] = s.split(".");
    return [i, f];
  }, [amount]);

  const fee = useMemo(() => (amount) / 100, [amount]);
  const total = useMemo(() => amount + fee, [amount, fee]);

  const totalText = useMemo(
    () =>
      total.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [total]
  );

  const hasBalance = total <= balance;
  const canSend =
    amount > 0 && addr.trim().length > 0 && !sending && !loading && hasBalance;

  const onSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      await submit(amount, addr.trim());
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="wform">
      <div className="wform__head">
        <img className="wform__avatar" src={finalAvatar} alt="" />
        <div className="wform__title">{title}</div>
        {subtitle && <div className="wform__sub">{subtitle}</div>}
      </div>

      <div className="wform__amount">
        <div className="wform__label">Введите количество OM</div>
        <div className="wform__input-wrap">
          <input
            className="wform__input"
            value={intPart.replace(/,/g, "")}
            onChange={(e) => {
              const next = Number(e.target.value.replace(/\D/g, "") || 0);
              setAmount(next);
            }}
            inputMode="numeric"
          />
          <span className="wform__cents">.{fracPart}</span>
          <span className="wform__usd"> OM</span>
        </div>
      </div>

      <div className="wform__chips">
        <div className="wform__chip">
          ДОСТУПНЫЙ БАЛАНС: {balance ?? 0} OM
        </div>
        <div className="wform__chip">1 OM = 1 USDT</div>
      </div>

      <div className="wform__fee">
        Комиссия составит <b>{fee.toFixed(2)} OM</b>
        <div className="wform__fee-sub">(фиксированная {PERCENT_FEE} USDT)</div>
        {!hasBalance && (

          <div className="wform__fee-error"><br />Недостаточно OM для вывода</div>
        )}
      </div>

      <div className="wform__addr">
        <input
          className="wform__addr-input"
          placeholder="Вставьте адрес USDT (BEP-20)"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
        />
      </div>

      <div className="wform__agree">
        Нажимая кнопку «получить»,<br />
        я подтверждаю, что ознакомился
        <br />
        с <Link to="/policy">Правилами сервиса</Link>
      </div>

      <div className="gbtn-bar rectangle-btn">
        <div className="gbtn-bar__inner rectangle-btn-inner">
          <GradientButton
            className="egd"
            onClick={onSend}
            disabled={!canSend}
          >
            ПОЛУЧИТЬ {amount.toFixed(2)} USDT
          </GradientButton>
        </div>
      </div>
    </div>
  );
}