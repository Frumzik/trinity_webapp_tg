import "./MainPageTile.scss";
import TileWrapper from "../TileWrapper";

type Props = {
  title?: string;
  amountOM?: number;
  showIncome?: boolean;
  empty?: boolean;
  imageUrl?: string;
  overlayImageUrl?: string;
  onWithdraw?: () => void;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  showBtn?: boolean;
  showText?: boolean;
  titleClassName?: string;
  tallyStyle?: React.CSSProperties;
  panelStyle?: React.CSSProperties;
};

function triads3(n: number) {
  const scaled = Math.max(0, Math.floor(n * 1000));

  const frac = scaled % 1000;            // 0..999 — это тысячные доли
  const int  = Math.floor(scaled / 1000); // целая часть

  const t3 = int % 1000;
  const t2 = Math.floor(int / 1000) % 1000;
  const t1 = Math.floor(int / 1_000_000) % 1000;

  const left = String(t1).padStart(3, "0");
  const mid = String(t2).padStart(3, "0");
  const right = `${String(t3).padStart(3, "0")}.${String(frac).padStart(3, "0")}`;

  return [left, mid, right] as const;
}

export default function IncomeCard({
                                     title = "Общий доход",
                                     amountOM = 0,
                                     showIncome = true,
                                     empty,
                                     imageUrl,
                                     overlayImageUrl,
                                     onWithdraw,
                                     to,
                                     href,
                                     onClick,
                                     className,
                                     ariaLabel,
                                     showBtn = true,
                                     showText = false,
                                     titleClassName,
                                     tallyStyle,
                                     panelStyle,
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
  console.log("IncomeCard amountOM:", amountOM);
  // const activeCell =
  //       m !== "000" ? 0 :
  //       k !== "000" ? 1 :
  //       u !== "000.000" ? 2 :
  //         -1;
  return (
    <TileWrapper
      to={to}
      href={href}
      onClick={onClick}
      className={cls}
      ariaLabel={ariaLabel}
    >
      {imageUrl && (
        <div
          className="incomeCard__img"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {overlayImageUrl && (
        <img
          className="incomeCard__overlay"
          src={overlayImageUrl}
          alt=""
        />
      )}

      <div className="incomeCard__panel">
        <div className={["incomeCard__title", titleClassName].filter(Boolean).join(" ")}>{title}</div>
        {showIncome && (
          <div className="incomeMini">
            <div className="incomeMini__tally" style={tallyStyle}>
              <div className="incomeMini__cell">{m}</div>
              <div className="incomeMini__cell">{k}</div>
              <div className="incomeMini__cell incomeMini__cell--active">
                {u}
                <span className="incomeMini__unit">ОМ</span>
              </div>
            </div>
            <div className="incomeMini__panel" style={panelStyle}>
              {showBtn &&
                <button
                  className="incomeMini__btn"
                >
                  Получить
                </button>
              }
              {showText &&
              <p className="incomeMini__descr">Средства временно удерживаются</p>
              }
            </div>
          </div>
        )}
      </div>
    </TileWrapper>
  );
}
