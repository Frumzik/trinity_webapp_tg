import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "../../../widgets/topbarTextpage";
import GradientButton from "../../../shared/ui/gradient-button";
import "../../pin/pin.scss";

export default function PinCreatePage() {
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const nav = useNavigate();

  const toDigits = (v: string) => v.replace(/\D/g, "").slice(0, 6);
  const valid = pin1.length >= 4 && pin1 === pin2;

  return (
    <div className="pin">
      <TopBar title="Пин код" />
      <main className="pin__main">
        <div className="pin__form">
          <div className="pin__field">
            <input
              className="pin__input"
              type={show1 ? "text" : "password"}
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
              type={show2 ? "text" : "password"}
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

          <GradientButton
            // disabled={!valid}
            onClick={() => {
              if (!valid) return;
              nav("/pin/login");
            }}
          >
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