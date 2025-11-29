import LevelProgress from "./LevelProgress";

export type HeroHeaderData = {
  levelLabel?: string;
  title: string;
  subtitle?: string;
  practicesCount?: number;
  progress?: { current: number; total: number };
};

type Props = HeroHeaderData & { className?: string };

function getPracticeWord(count: number) {
  const n = Math.abs(count) % 100;
  const last = n % 10;

  if (n >= 11 && n <= 14) return "практик";
  if (last === 1) return "практика";
  if (last >= 2 && last <= 4) return "практики";
  return "практик";
}

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
        <div className="hheader__count">
          {practicesCount} {getPracticeWord(practicesCount)}
        </div>
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