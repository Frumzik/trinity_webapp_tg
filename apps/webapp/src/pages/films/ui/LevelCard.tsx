import type { LevelItem } from "../index";
import TimeIcon from "../../../assets/icons/time.svg";

type Props = {
  item: LevelItem;
  onClick: () => void;
  hideStatus?: boolean; // можно оставить, вдруг пригодится, но больше не используем
};

export default function LevelCard({ item, onClick }: Props) {
  return (
    <button className="lvl" onClick={onClick}>
      <img className="lvl__bg" src={item.image} alt="" />
      <div className="lvl__fade" />

      {item.badge && (
        <span
          className={`lvl__badge ${
            item.badge.tone === "warn" ? "tone-warn" : "tone-info"
          }`}
        >
          {item.badge.text}
        </span>
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
        </div>
      </div>
    </button>
  );
}