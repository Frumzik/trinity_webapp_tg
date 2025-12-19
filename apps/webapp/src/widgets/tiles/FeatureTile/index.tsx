import type { ComponentType, SVGProps } from "react";
import "./feature-tile.scss";
import TileWrapper from "../TileWrapper";
import LockIcon from "../../../assets/icons/lock.svg?url";

type SvgComp = ComponentType<SVGProps<SVGSVGElement>>;

type Props = {
  title: string;
  description?: string;
  enabled: boolean;
  bgImageUrl?: string;
  bgImageSvg?: SvgComp;
  rightImageUrl?: string;
  rightImageSvg?: SvgComp;
  buttonTextEnabled?: string;
  buttonTextDisabled?: string;
  onOpen?: () => void;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  showImageWhenDisabled?: boolean;
};

export default function FeatureTile({
                                      title,
                                      description,
                                      enabled,
                                      bgImageUrl,
                                      bgImageSvg: BgSvg,
                                      rightImageUrl,
                                      rightImageSvg: RightSvg,
                                      buttonTextEnabled = "Перейти",
                                      buttonTextDisabled = "В разработке",
                                      onOpen,
                                      href,
                                      to,
                                      onClick,
                                      className,
                                      ariaLabel,
                                      showImageWhenDisabled = false,
                                    }: Props) {
  const rootCls = [
    "featureTile",
    enabled ? "is-enabled" : "is-disabled",
    !enabled && showImageWhenDisabled ? "is-disabled-with-image" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const isClickable = enabled;

  const showRightImage = enabled || showImageWhenDisabled;

  return (
    <TileWrapper
      to={isClickable ? to : undefined}
      href={isClickable ? href : undefined}
      onClick={isClickable ? (onClick ?? onOpen) : undefined}
      className={rootCls}
      ariaLabel={ariaLabel}
    >
      {bgImageUrl ? (
        <div
          className="featureTile__bg"
          style={{ backgroundImage: `url("${bgImageUrl}")` }}
        />
      ) : BgSvg ? (
        <BgSvg className="featureTile__bgSvg" />
      ) : null}

      <div className="featureTile__left">
        <div className="featureTile__title">{title}</div>
        {description ? (
          <div className="featureTile__desc">{description}</div>
        ) : null}
        <button
          type="button"
          className={`featureTile__btn${enabled ? "" : " is-disabled"}`}
          disabled={!enabled}
        >
          {enabled ? buttonTextEnabled : buttonTextDisabled}
        </button>
      </div>

      <div className="featureTile__right">
        {showRightImage ? (
          rightImageUrl ? (
            <img className="featureTile__image" src={rightImageUrl} alt="" />
          ) : RightSvg ? (
            <RightSvg className="featureTile__imageSvg" />
          ) : null
        ) : (
          <div className="featureTile__placeholder" />
        )}

        {!enabled && (
          <div className="featureTile__lock">
            <img src={LockIcon} alt="" />
          </div>
        )}
      </div>

    </TileWrapper>
  );
}