import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import TopBar from "../../../widgets/topbarTextpage";
import GradientButton from "../../../shared/ui/gradient-button";
import "../../pin/pin.scss";
import { useAppDispatch } from "../../../app/store";
import { sessionActions } from "../../../entities/session/model/session.slice";

function api(path: string) {
  const base = 'http://localhost:3000';
  return `${base}${path}`;
}

export default function PinLoginPage() {
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  const tgUser = useMemo(() => {
    const u = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
    return u ? { id: u.id as number } : null;
  }, []);

  useEffect(() => {
    const u = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user
    if (!u?.id) return
      ;(async () => {
      try {
        const r = await fetch(`http://localhost:3000/auth/check-tg?tgId=${u.id}`)
        if (!r.ok) return
        const d = await r.json()
        const exists = typeof d === 'boolean' ? d : !!d?.exists
        if (!exists) nav('/pin/create', { replace: true })
      } catch { /* empty */ }
    })()
  }, [nav])

  const toDigits = (v: string) => v.replace(/\D/g, "").slice(0, 6);
  const valid = pin.length >= 1;

  const submit = async () => {
    if (!valid || !tgUser || loading) return;
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch(api("http://localhost:3000/auth/login"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "TG", tgId: tgUser.id, pin }),
      });
      if (!r.ok) throw new Error("Неверный PIN");
      const { access_token } = await r.json();
      if (!access_token) throw new Error("Токен не получен");
      localStorage.setItem("access_token", access_token);
      dispatch(sessionActions.setToken(access_token));
      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
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
              type={show ? "text" : "password"}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Введите пин код"
              value={pin}
              onChange={(e) => setPin(toDigits(e.target.value))}
            />
            <button className="pin__eye" type="button" aria-label="Показать пин" onClick={() => setShow(!show)} />
          </div>

          {err && <div className="pin__error">{err}</div>}

          <GradientButton disabled={!valid || loading} onClick={submit}>
            Войти
          </GradientButton>

          <div className="pin__under">
            Забыли пин? <Link to="/pin/reset">Сбросить</Link>
          </div>
        </div>
      </main>
    </div>
  );
}