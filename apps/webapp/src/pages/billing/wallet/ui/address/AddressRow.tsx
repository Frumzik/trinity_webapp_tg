import "./address-row.scss";

type Props = {
  value: string;
  onCopy?: () => void;
};

export default function AddressRow({ value, onCopy }: Props) {
  const doCopy = async () => {
    await navigator.clipboard.writeText(value);
    onCopy?.();
  };
  return (
    <button className="addr" onClick={doCopy}>
      <span className="addr__text">{value}</span>
    </button>
  );
}
