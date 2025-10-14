type Props = {
  current: number;
  total: number;
  className?: string;
};

export default function LevelProgress({ current, total, className }: Props) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, total)) * 100));
  return (
    <div className={["lprogress", className].filter(Boolean).join(" ")}>
      <div className="lprogress__bar">
        <div className="lprogress__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="lprogress__labels">
        <span>{current}</span>
        <span>{total}</span>
      </div>
    </div>
  );
}
