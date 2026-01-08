// WithdrawForm.tsx
import { useMemo, useState } from "react";
import GradientButton from "../../../../shared/ui/gradient-button";
import { useGetUserQuery } from "../../../../shared/api/user.api";
import { getTelegramUser } from "../../../../shared/telegram/telegram";
import Arrow from '../../../../assets/image/level/arrow-down.svg'
import "./withdraw-form.scss";
import { Link } from "react-router-dom";

type ToMode = "username" | "wallet";
type Props = {
  avatarSrc?: string;
  title: React.ReactNode;
  subtitle?: string;
  balance: number;
  loading?: boolean;

  submit: (value: number, to: string, mode: ToMode) => Promise<void>;
  toMode: ToMode;
  onToggleToMode: (next: ToMode) => void;

  amountLabel?: string;

  showFeeBlock?: boolean;

  showToInput?: boolean;
  toValue: string;
  onChangeTo: (v: string) => void;

  submitButtonText?: (args: { amount: number; receive: number; fee: number }) => React.ReactNode;

  amountSuffix?: string; 
};

const FIXED_FEE_OM = 0.5;

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

                                       toMode,
                                       onToggleToMode,

                                       amountLabel = "Введите количество OM",
                                       showFeeBlock = true,

                                       showToInput = true,
                                       toValue,
                                       onChangeTo,

                                       submitButtonText = (receive) => <>ПОЛУЧИТЬ {receive.toFixed(2)} USDT</>,
                                       amountSuffix = "OM",
                                     }: Props) {
  const [amount, setAmount] = useState(0);
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
  const isUsername = toMode === "username";

  const label = isUsername ? "Никнейм Telegram" : "Адрес кошелька";
  const placeholder = isUsername ? "@username" : "Вставьте адрес USDT (BEP-20)";

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

  const fee = useMemo(() => (amount > 0 ? FIXED_FEE_OM : 0), [amount]);
  const receive = useMemo(() => Math.max(amount - fee, 0), [amount, fee]);
  const total = useMemo(() => amount, [amount]);

  const hasBalance = total <= balance;
  const hasTo = toValue.trim().length > 0;

  const canSend =
    amount > 0 &&
    (!showToInput || hasTo) &&
    !sending &&
    !loading &&
    hasBalance;

  const onSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      const to = showToInput ? toValue.trim() : "";
      await submit(amount, to, toMode);
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
        <div className="wform__label">{amountLabel}</div>
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
          <span className="wform__usd"> {amountSuffix}</span>
        </div>
      </div>

      <div className="wform__chips">
        <div className="wform__chip">ДОСТУПНЫЙ БАЛАНС: {balance ?? 0} {amountSuffix}</div>
        <div className="wform__chip">1 OM = 1 USDT</div>
      </div>

      {showFeeBlock && (
        <div className="wform__fee">
          Комиссия составит <b>{fee.toFixed(2)} {amountSuffix}</b>
          <div className="wform__fee-sub">(фиксированная {FIXED_FEE_OM} USDT)</div>
          {!hasBalance && amount > 0 && (
            <div className="wform__fee-error">
              <br />
              Недостаточно {amountSuffix} для вывода
            </div>
          )}
        </div>
      )}

      {showToInput && (
        <div className="wform__addr-tg">
          <button
            type="button"
            className="wform__label_tg"
            onClick={() => onToggleToMode(isUsername ? "wallet" : "username")}
          >
            <p className="wform__label_tg-text">{label}</p>
            <img className="arrow-tg" src={Arrow} alt="arrow"
                 style={{ transform: "rotate(270deg)" }} />
          </button>

          <input
            className="wform__input-tg"
            placeholder={placeholder}
            value={toValue}
            onChange={(e) => onChangeTo(e.target.value)}
          />
        </div>
      )}

      <div className="wform__agree">
        Нажимая кнопку «вывести», <br />
        я подтверждаю, что ознакомился
        <br />
        с <Link to="/policy">Правилами сервиса</Link>
      </div>

      <div className="gbtn-bar rectangle-btn">
        <div className="gbtn-bar__inner rectangle-btn-inner">
          <GradientButton className="egd" onClick={onSend} disabled={!canSend}>
            {submitButtonText({ amount, receive, fee })}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}