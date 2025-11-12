import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from '../../../widgets/topbarTextpage';
import GradientButton from '../../../shared/ui/gradient-button';
import '../../pin/pin.scss';
import { useRegisterTgMutation } from '../../../shared/api/auth.api';

const toDigits = (v: string) => v.replace(/\D/g, '').slice(0, 6);

export default function PinCreatePage() {
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registerTg] = useRegisterTgMutation();
  const nav = useNavigate();

  const tg = useMemo(() => (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user ?? null, []);
  const tgId = Number(tg?.id) || 0;
  const username = tg?.username || undefined;
  const name =
    tg?.first_name?.trim?.() ||
    tg?.last_name?.trim?.() ||
    tg?.username ||
    undefined;
  const decodeB64Url = (s: string) =>
    decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))

  const startParam: string | undefined =
    (window as any)?.Telegram?.WebApp?.initDataUnsafe?.start_param

  const refPartnerId = useMemo(() => {
    if (!startParam) return undefined
    try {
      const data = JSON.parse(decodeB64Url(startParam))
      return data?.partnerId as number | string | undefined
    } catch {
      return undefined
    }
  }, [startParam])
  const valid = pin1.length >= 3 && pin1 === pin2 && tgId > 0;

  const submit = async () => {
    if (!valid || loading) return;
    setErr(null);
    setLoading(true);
    try {
      await registerTg({ type: 'TG', tgId, pin: pin1, username, name, partnerId: refPartnerId, }).unwrap();
      nav('/pin/login', { replace: true });
    } catch (e: any) {
      setErr(e?.data?.message?.[0] || e?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pin">
      <TopBar title="Пин код" />
      <main className="pin__main">
        <div className="pin__form">
          <div className="pin__field">
            <input
              className="pin__input"
              type={show1 ? 'text' : 'password'}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Введите пин код"
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
              type={show2 ? 'text' : 'password'}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Повторите пин код"
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

          {err && <div className="pin__error">{err}</div>}

          <GradientButton disabled={!valid || loading} onClick={submit}>
            Создать аккаунт
          </GradientButton>

          <div className="pin__under">
            Уже есть пин? <Link to="/pin/login">Войти</Link>
          </div>
        </div>
      </main>
    </div>
  );
}