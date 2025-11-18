import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../../widgets/topbarTextpage';
import GradientButton from '../../../shared/ui/gradient-button';
import '../../pin/pin.scss';
import { useLoginTgMutation } from '../../../shared/api/auth.api';
import { useAppDispatch } from '../../../app/store';
import { sessionActions } from '../../../entities/session/model/session.slice';

const toDigits = (v: string) => v.replace(/\D/g, '').slice(0, 4);

const pickToken = (x: any): string | null =>
  x?.access_token ||
  x?.accessToken ||
  x?.token ||
  x?.data?.access_token ||
  x?.data?.accessToken ||
  x?.data?.token ||
  null;

export default function PinLoginPage() {
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [loginTg] = useLoginTgMutation();
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const tg = useMemo(() => (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user ?? null, []);
  const tgId = Number(tg?.id) || 0;

  const valid = pin.length === 4 && tgId > 0;

  const submit = async () => {
    if (!valid || loading) return;
    setErr(null);
    setLoading(true);
    try {
      const resp = await loginTg({ type: 'TG', tgId, pin }).unwrap();
      const token = pickToken(resp);
      if (!token) throw new Error('Токен не получен');

      dispatch(sessionActions.setToken(token));
      localStorage.setItem('access_token', token);
      localStorage.setItem('tgId', String(tgId));
      setTimeout(() => nav('/home', { replace: true }), 0);
    } catch (e: any) {
      setErr(e?.data?.message?.[0] || e?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add('body--pin');
    return () => {
      document.body.classList.remove('body--pin');
    };
  }, []);

  return (
    <div className="pin">
      <TopBar title="Пин код" hideBackButton />
      <main className="pin__main">
        <div className="pin__form">
          <div className="pin__field">
            <input
              className="pin__input"
              type={show ? 'text' : 'password'}
              inputMode="numeric"
              pattern="\d*"
              maxLength={4}
              autoComplete="one-time-code"
              placeholder="Введите PIN-код"
              value={pin}
              onChange={(e) => setPin(toDigits(e.target.value))}
            />
            <button
              className="pin__eye"
              type="button"
              aria-label="Показать пин"
              onClick={() => setShow((s) => !s)}
            />
          </div>

          {pin.length > 0 && pin.length < 4 && (
            <div className="pin__error">PIN-код должен быть из 4 цифр</div>
          )}
          {err && <div className="pin__error">{err}</div>}

          {!tgId && <div className="pin__error">Не найден Telegram ID</div>}

          <GradientButton
            variant="alt"
            disabled={!valid || loading}
            onClick={submit}
          >
            Войти
          </GradientButton>

          <div className="pin__under">
            {/*Забыли пин? <Link to="/pin/reset">Сбросить</Link>*/}
          </div>
        </div>
      </main>
    </div>
  );
}
