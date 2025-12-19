type Props = {
  current: number;
  total: number;
  className?: string;
  variant?: "default" | "secondary" | "compact" | string;
};

const BLOCK = "lprogress";

export default function LevelProgress({
                                        current,
                                        total,
                                        className,
                                        variant = "default",
                                      }: Props) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, total)) * 100));

  // helper для BEM-классов
  const bem = (element?: string) => {
    const base = element ? `${BLOCK}__${element}` : BLOCK;

    const mods: string[] = [];
    if (variant && variant !== "default") {
      mods.push(
        `${base}--${variant}` // lprogress--secondary, lprogress__bar--secondary и т.п.
      );
    }

    return [base, ...mods].join(" ");
  };

  return (
    <div
      className={[
        bem(),          // lprogress + lprogress--secondary
        className,      // доп. классы снаружи
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={bem("bar")}>
        {/* lprogress__bar (+ модификатор) */}
        <div
          className={bem("fill")} // lprogress__fill (+ модификатор)
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={bem("labels")}>
        {/* lprogress__labels (+ модификатор) */}
        <span>{current}</span>
        <span>{total}</span>
      </div>
    </div>
  );
}