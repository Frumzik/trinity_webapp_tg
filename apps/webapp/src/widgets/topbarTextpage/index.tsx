import BackIcon from "../../assets/icons/back.svg";
import { useNavigate } from "react-router-dom";
import "./topbarTextPage.scss";

type Props = {
  title?: string;
  rightIconUrl?: string;
  onRightClick?: () => void;
  hideBackButton?: boolean;
  backTo?: string;
};

export default function TopBar(props: Props) {
  const {
    title,
    rightIconUrl,
    onRightClick,
    hideBackButton,
    backTo,
  } = props;

  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="topbar-text">
      <div className="topbar__bar-text">
        {!hideBackButton && (
          <button
            className="topbar__btn-text topbar__btn--ghost-text"
            onClick={handleBack}
          >
            <img src={BackIcon} alt="Назад" />
          </button>
        )}

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