import BackIcon from "../../assets/icons/back.svg";
import { useNavigate } from "react-router-dom";
import "./topbarTextPage.scss";

type Props = {
  title?: string;
  rightIconUrl?: string;
  onRightClick?: () => void;
};

export default function TopBar({ title, rightIconUrl, onRightClick }: Props) {
  const navigate = useNavigate();
  return (
    <div className="topbar-text">
      <div className="topbar__bar-text">
        <button
          className="topbar__btn-text topbar__btn--ghost-text"
          onClick={() => navigate("/", { replace: true })}
        >
          <img src={BackIcon} alt="Назад" />
        </button>

        <div className="topbar__title-text">{title}</div>

        {rightIconUrl ? (
          <button className="topbar__btn-right" onClick={onRightClick}>
            <img className="topbar__right-img" src={rightIconUrl} alt="" />
          </button>
        ) : (
          <span
            className="topbar__btn-right"
            style={{ visibility: "hidden" }}
          />
        )}
      </div>
    </div>
  );
}
