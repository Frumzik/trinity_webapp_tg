// src/pages/pin/create/index.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../../../shared/ui/gradient-button';
import '../../pin/pin.scss';
import { useRegisterTgMutation, useLoginTgMutation } from '../../../shared/api/auth.api';
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

function decodeB64Url(s: string) {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    return decodeURIComponent(
      Array.from(bin, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
  } catch {
    return '';
  }
}

function parsePartnerId(startParam?: string): number | undefined {
  if (!startParam) return undefined;
  const s = startParam.trim();

  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  }

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
  const [loginTg] = useLoginTgMutation();
  const dispatch = useAppDispatch();
  const nav = useNavigate();

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

  const startParam: string | undefined =
    (window as any)?.Telegram?.WebApp?.initDataUnsafe?.start_param;

  const partnerIdNum = useMemo(() => parsePartnerId(startParam), [startParam]);

  const isPinLengthOk = pin1.length === 4;
  const doPinsMatch = pin1 === pin2 && pin2.length === 4;

  const valid = isPinLengthOk && doPinsMatch && tgId > 0;

  const submit = async () => {
    if (!valid || loading) return;
    setErr(null);
    setLoading(true);

    try {
      // 1. Регистрируем
      await registerTg({
        type: 'TG',
        tgId,
        pin: pin1,
        username,
        name,
        ...(partnerIdNum !== undefined ? { partnerId: partnerIdNum } : {}),
      }).unwrap();

      const resp = await loginTg({ type: 'TG', tgId, pin: pin1 }).unwrap();
      const token = pickToken(resp);
      if (!token) throw new Error('Токен не получен');

      // 3. Сохраняем токен и отправляем на главную
      dispatch(sessionActions.setToken(token));
      localStorage.setItem('access_token', token);
      localStorage.setItem('tgId', String(tgId));

      nav('/', { replace: true });
    } catch (e: any) {
      setErr(e?.data?.message?.[0] || e?.message || 'Ошибка регистрации');
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
      {/*<TopBar title={"Добро пожаловать в ТРИНИТИ!\n Установите PIN-код, чтобы защитить ваш доступ."} hideBackButton />*/}
      <main className="pin__main">
        <div className="pin__main-title">Добро пожаловать в ТРИНИТИ! Установите PIN-код, чтобы защитить ваш доступ.</div>
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
              type={show2 ? 'text' : 'password'}
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
        </div>
      </main>
    </div>
  );
}