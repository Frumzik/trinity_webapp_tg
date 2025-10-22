import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "../../../widgets/topbarTextpage";
import GradientButton from "../../../shared/ui/gradient-button";
import "../../pin/pin.scss";

export default function PinLoginPage() {
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const nav = useNavigate();

  const toDigits = (v: string) => v.replace(/\D/g, "").slice(0, 6);
  const valid = pin.length >= 4;

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
            <button
              className="pin__eye"
              type="button"
              aria-label="Показать пин"
              onClick={() => setShow(!show)}
            />
          </div>

          <GradientButton
            // disabled={!valid}
            onClick={() => {
              if (!valid) return;
              nav("/");
            }}
          >
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