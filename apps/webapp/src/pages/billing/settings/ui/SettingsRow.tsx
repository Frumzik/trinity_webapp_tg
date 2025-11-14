import "./settings-row.scss";
import arrowRight from "../../../../assets/image/level/chevron-right-black.svg";
type Props = {
  label: string;
  onClick: () => void;
};

export default function SettingsRow({ label, onClick }: Props) {
  return (
    <button className="srow" onClick={onClick}>
      <span className="srow__label">{label}</span>
      <span className="srow__chev">
        <img src={arrowRight} alt="" />
      </span>
    </button>
  );
}
