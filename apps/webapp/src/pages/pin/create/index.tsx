
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../../widgets/topbarTextpage';
import GradientButton from '../../../shared/ui/gradient-button';
import '../../pin/pin.scss';
import { useRegisterTgMutation } from '../../../shared/api/auth.api';

const toDigits = (v: string) => v.replace(/\D/g, '').slice(0, 4);
// декодер b64url -> строка
function decodeB64Url(s: string) {
  try {
    // b64url -> b64
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    // atob -> utf8
    const bin = atob(b64);
    // бинарь -> строка
    return decodeURIComponent(
      Array.from(bin, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
  } catch {
    return '';
  }
}

// парсим start_param из Telegram WebApp в number | undefined
function parsePartnerId(startParam?: string): number | undefined {
  if (!startParam) return undefined;
  const s = startParam.trim();

  // вариант 1: просто цифры `?startapp=12345`
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  }

  // вариант 2: старый b64url JSON {"partnerId": 12345}
  try {
    const json = decodeB64Url(s);
    const data = JSON.parse(json);
    const n = Number((data as any)?.partnerId);
    return Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
}

export default function PinCreatePage() {
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registerTg] = useRegisterTgMutation();
  const nav = useNavigate();

  // Telegram user
  const tg = useMemo(
    () => (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user ?? null,
    []
  );
  const tgId = Number(tg?.id) || 0;
  const username = tg?.username || undefined;
  const name =
    tg?.first_name?.trim?.() ||
    tg?.last_name?.trim?.() ||
    tg?.username ||
    undefined;

  // start_param из Telegram
  const startParam: string | undefined = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.start_param;

  // приводим к числу один раз
  const partnerIdNum = useMemo(() => parsePartnerId(startParam), [startParam]);

  const isPinLengthOk = pin1.length === 4;
  const doPinsMatch = pin1 === pin2 && pin2.length === 4;

  const valid = isPinLengthOk && doPinsMatch && tgId > 0;

  const submit = async () => {
    if (!valid || loading) return;
    setErr(null);
    setLoading(true);
    try {
      // на всякий случай можно подсмотреть тип в консоли во время отладки
      // console.log('[register] partnerId:', partnerIdNum, typeof partnerIdNum);

      await registerTg({
        type: 'TG',
        tgId,
        pin: pin1,
        username,
        name,
        ...(partnerIdNum !== undefined ? { partnerId: partnerIdNum } : {}), // ТОЛЬКО number
      }).unwrap();

      nav('/pin/login', { replace: true });
    } catch (e: any) {
      setErr(e?.data?.message?.[0] || e?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pin">
      <TopBar title="Пин код" hideBackButton/>
      <main className="pin__main">
        <div className="pin__form">
          <div className="pin__field">
            <input
              className="pin__input"
              type={show1 ? 'text' : 'password'}
              inputMode="numeric"
              pattern="\d*"
              maxLength={4}
              autoComplete="one-time-code"
              placeholder="Введите PIN-код"
              value={pin1}
              onChange={(e) => setPin1(toDigits(e.target.value))}
            />
            <button
              className="pin__eye"
              type="button"
              aria-label="Показать пин"
              onClick={() => setShow1((s) => !s)}
            />
          </div>

          <div className="pin__field">
            <input
              className="pin__input"
              type={show1 ? 'text' : 'password'}
              inputMode="numeric"
              pattern="\d*"
              maxLength={4}
              autoComplete="one-time-code"
              placeholder="Повторите PIN-код"
              value={pin2}
              onChange={(e) => setPin2(toDigits(e.target.value))}
            />
            <button
              className="pin__eye"
              type="button"
              aria-label="Показать пин"
              onClick={() => setShow2((s) => !s)}
            />
          </div>

          {pin1.length > 0 && pin1.length < 4 && (
            <div className="pin__error">PIN-код должен быть из 4 цифр</div>
          )}

          {pin2.length > 0 && pin2.length === 4 && pin1 !== pin2 && (
            <div className="pin__error">PIN-коды не совпадают</div>
          )}

          {err && <div className="pin__error">{err}</div>}

          <GradientButton
            variant="alt"
            disabled={!valid || loading}
            onClick={submit}
          >
            Создать аккаунт
          </GradientButton>

          {/*<div className="pin__under">*/}
          {/*  Уже есть пин? <Link to="/pin/login">Войти</Link>*/}
          {/*</div>*/}
        </div>
      </main>
    </div>
  );
}