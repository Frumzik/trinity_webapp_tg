import LevelProgress from "./LevelProgress";

export type HeroHeaderData = {
  levelLabel?: string; // "Уровень 1"
  title: string; // "Уровень 1" или другое имя
  subtitle?: string; // "Основы дыхания и концентрации"
  practicesCount?: number; // 36
  progress?: { current: number; total: number }; // {1,36}
};

type Props = HeroHeaderData & { className?: string };

export default function HeroHeading({
  levelLabel,
  title,
  subtitle,
  practicesCount,
  progress,
  className,
}: Props) {
  return (
    <header className={["hheader", className].filter(Boolean).join(" ")}>
      {levelLabel && <div className="hheader__level">{levelLabel}</div>}
      <h1 className="hheader__title">{title}</h1>

      {typeof practicesCount === "number" && (
        <div className="hheader__count">{practicesCount} практик</div>
      )}

      {subtitle && <p className="hheader__subtitle">{subtitle}</p>}

      {progress && (
        <LevelProgress
          className="hheader__progress"
          current={progress.current}
          total={progress.total}
        />
      )}
    </header>
  );
}
