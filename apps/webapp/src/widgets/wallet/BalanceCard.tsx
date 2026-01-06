import "./balance-card.scss";
import {NavLink} from "react-router-dom";

type Props = {
  amount: number;
  currency: string;
  onDeposit?: () => void;
  onWithdraw?: () => void;
};

export default function BalanceCard({ amount, onDeposit, onWithdraw }: Props) {
  const str = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [intPart, fracPart] = str.split(".");
  return (
    <div className="balance">
      <div className="balance__sum">
        {intPart}.
        <span className="balance__cents" style={{color: '#6A501752'}}>{fracPart}</span>
        <span className="balance__cur" style={{marginLeft: 5}}> OM</span>
      </div>
      <div className="balance__note">Основной баланс</div>

      <div className="balance__actions">
        <NavLink to="/withdraw">
          <button className="balance__btn" onClick={onWithdraw}>
            Вывести ОМ
          </button>
        </NavLink>
          <NavLink to="/wallet">
        <button className="balance__btn" onClick={onDeposit}>
          Добавить ОМ
        </button>
      </NavLink>
        <NavLink to="/transfers">
        <button className="balance__btn" onClick={onDeposit}>
          Внутренний перевод
        </button>
      </NavLink>
        <NavLink to="/wallet">
        <button className="balance__btn" onClick={onDeposit}>
          Добавить ОМ за ₽
        </button>
      </NavLink>

      </div>
    </div>
  );
}
