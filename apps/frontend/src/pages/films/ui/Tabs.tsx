type Opt<T extends string | number> = { label: string; value: T };
type Props<T extends string | number> = {
  value: T;
  options: Opt<T>[];
  onChange: (v: T) => void;
};
export default function Tabs<T extends string | number>({
  value,
  options,
  onChange,
}: Props<T>) {
  return (
    <div className="tabs">
      {options.map((o) => (
        <button
          key={String(o.value)}
          className={`tabs__btn ${o.value === value ? "is-active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
