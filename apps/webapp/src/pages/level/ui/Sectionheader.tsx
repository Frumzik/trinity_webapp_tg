type Props = {
  title: string;
  count?: number;
  className?: string;
};

function getPracticeWord(count: number) {
  const n = Math.abs(count) % 100;
  const last = n % 10;

  if (n >= 11 && n <= 14) return "практик";
  if (last === 1) return "практика";
  if (last >= 2 && last <= 4) return "практики";
  return "практик";
}

export default function SectionHeader({ title, count, className }: Props) {
  return (
    <div className={["sectionHead", className].filter(Boolean).join(" ")}>
      <h3 className="sectionHead__title">{title}</h3>
      {typeof count === "number" && (
        <span className="sectionHead__count">
          {count} {getPracticeWord(count)}
        </span>
      )}
    </div>
  );
}