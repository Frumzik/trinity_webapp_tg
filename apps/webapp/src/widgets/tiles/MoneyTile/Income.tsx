import "./MainPageTile.scss";
import TileWrapper from "../TileWrapper";

type Props = {
  title?: string;
  amountOM?: number;
  showIncome?: boolean;
  empty?: boolean;
  imageUrl?: string;
  onWithdraw?: () => void;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
};

function triads3(n: number) {
  const v = Math.max(0, Math.floor(n));
  const t3 = v % 1000;
  const t2 = Math.floor(v / 1000) % 1000;
  const t1 = Math.floor(v / 1_000_000) % 1000;
  return [t1, t2, t3].map((x) => String(x).padStart(3, "0"));
}

export default function IncomeCard({
  title = "Общий доход",
  amountOM = 0,
  showIncome = true,
  empty,
  imageUrl,
  onWithdraw,
  to,
  href,
  onClick,
  className,
  ariaLabel,
}: Props) {
  const cls = [
    "incomeCard",
    empty ? "incomeCard--empty" : "",
    to || href || onClick ? "is-clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const [m, k, u] = triads3(amountOM);

  return (
    <TileWrapper
      to={to}
      href={href}
      onClick={onClick}
      className={cls}
      ariaLabel={ariaLabel}
    >
      {imageUrl ? (
        <div
          className="incomeCard__img"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : null}
      <div className="incomeCard__panel">
        <div className="incomeCard__title">{title}</div>
        {showIncome ? (
          <div className="incomeMini">
            <div className="incomeMini__tally">
              <div className="incomeMini__cell">{m}</div>
              <div className="incomeMini__cell">{k}</div>
              <div className="incomeMini__cell incomeMini__cell--active">
                {u}
                <span className="incomeMini__unit">ОМ</span>
              </div>
            </div>
            <div className="incomeMini__panel">
              <button
                className="incomeMini__btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onWithdraw?.();
                }}
              >
                Вывести прибыль
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </TileWrapper>
  );
}
