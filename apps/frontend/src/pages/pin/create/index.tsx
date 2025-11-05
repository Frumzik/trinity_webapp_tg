import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from '../../../widgets/topbarTextpage';
import GradientButton from '../../../shared/ui/gradient-button';
import '../../pin/pin.scss';
import { useAppDispatch } from '../../../app/store';
import { sessionActions } from '../../../entities/session/model/session.slice';

function api(path: string) {
  const base = 'http://localhost:3000';
  return `${base}${path}`;
}

export default function PinCreatePage() {
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  const tgUser = useMemo(() => {
    const u = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
    return u
      ? {
          id: u.id as number,
          username: u.username as string | undefined,
          name: u.first_name as string | undefined,
        }
      : null;
  }, []);

  useEffect(() => {
    if (!tgUser) return;
    let aborted = false;
    (async () => {
      try {
        const r = await fetch(
          api(`/auth/check-tg?tgId=${tgUser.id}`)
        );
        if (!r.ok) return;
        const d = await r.json();
        if (aborted) return;
        const exists = typeof d === 'boolean' ? d : !!d?.exists;
        if (exists) nav('/pin/login', { replace: true });
      } catch (e) {
        /* empty */
      }
    })();
    return () => {
      aborted = true;
    };
  }, [tgUser, nav]);

  const toDigits = (v: string) => v.replace(/\D/g, '').slice(0, 6);
  const valid = pin1.length >= 1 && pin1 === pin2;

  const submit = async () => {
    if (!valid || !tgUser?.id || loading) return
    setErr(null)
    setLoading(true)
    try {
      const reg = await fetch(api('/auth/register'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: 'TG',
          tgId: tgUser.id,
          pin: pin1,
          username: tgUser.username || undefined,
          name: tgUser.first_name || tgUser.last_name || tgUser.username || undefined,
        }),
      })
      if (!reg.ok) throw new Error('Ошибка регистрации')
      nav('/pin/login', { replace: true })
      return
    } catch (e: any) {
      setErr(e?.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

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
              onClick={() => setShow1(!show1)}
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
              onClick={() => setShow2(!show2)}
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
