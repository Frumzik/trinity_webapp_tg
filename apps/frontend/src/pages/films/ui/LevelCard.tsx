import type { LevelItem } from "../index";
import LockIcon from "../../../assets/icons/lock.svg";
import TimeIcon from "../../../assets/icons/time.svg";

type Props = {
  item: LevelItem;
  onClick: () => void;
};

export default function LevelCard({ item, onClick }: Props) {
  const locked = item.status === "locked";
  const done = item.status === "done";

  return (
    <button className={`lvl ${locked ? "is-locked" : ""}`} onClick={onClick}>
      <img className="lvl__bg" src={item.image} alt="" />
      <div className="lvl__fade" />

      {item.badge && (
        <span
          className={`lvl__badge ${item.badge.tone === "warn" ? "tone-warn" : "tone-info"}`}
        >
          {item.badge.text}
        </span>
      )}

      {locked && <div className="lvl__blur" aria-hidden />}

      {locked && item.priceUSDT && (
        <div className="lvl__unlock">
          Разблокируйте за {item.priceUSDT} OM
        </div>
      )}

      <div className="lvl__body">
        <div className="lvl__title">{item.title}</div>
        {item.subtitle && <div className="lvl__subtitle">{item.subtitle}</div>}

        <div className="lvl__meta">
          {typeof item.durationMin === "number" && (
            <span className="lvl__time">
              <img src={TimeIcon} alt="" />
              {item.durationMin} min
            </span>
          )}

          {done && (
            <span className="lvl__status lvl__status--done">Выполнено</span>
          )}

          {!locked && !done && (
            <span className="lvl__status lvl__status--progress">Доступно</span>
          )}

          {locked && (
            <span className="lvl__status lvl__status--lock">
              <img src={LockIcon} alt="" />
              {item.priceUSDT ? "" : "Недоступно"}
            </span>
          )}
        </div>
      </div>

      {locked && (
        <div className="lvl__hud">
          <div className="lvl__hud-left">
            <div className="lvl__hud-title">{item.title}</div>
            {typeof item.durationMin === "number" && (
              <span className="lvl__time">
                <img src={TimeIcon} alt="" />
                {item.durationMin} min
              </span>
            )}
          </div>

          <span className="lvl__hud-lock">
            <img src={LockIcon} alt="" />
          </span>
        </div>
      )}
    </button>
  );
}
