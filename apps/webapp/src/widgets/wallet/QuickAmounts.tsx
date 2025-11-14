import "./quick-amounts.scss";

type Props = { options: number[]; onPick: (v: number) => void };

export default function QuickAmounts({ options, onPick }: Props) {
  return (
    <div className="qamounts">
      {options.map((v) => (
        <button key={v} className="qamounts__btn" onClick={() => onPick(v)}>
          {v.toLocaleString("en-US")}
        </button>
      ))}
    </div>
  );
}
