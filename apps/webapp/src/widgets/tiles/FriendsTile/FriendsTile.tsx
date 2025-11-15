import type { ReactNode } from "react";
import "./FriendsTile.scss";
import TileWrapper from "../TileWrapper";

type Referral = { id: string | number };

type Props = {
  imageUrl?: string;

  bgImageUrl?: string;

  rightImageUrl?: string;

  titleTop?: ReactNode;
  labelBottom?: ReactNode;
  referrals?: Referral[];
  count?: number;
  href?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  layout?: "overlay" | "split";
  height?: number;
  imgCol?: string;
};

export default function ReferralsCard({
                                        imageUrl,
                                        bgImageUrl,
                                        rightImageUrl,
                                        titleTop = "Структура",
                                        labelBottom = "Всего",
                                        referrals,
                                        count,
                                        href,
                                        onClick,
                                        className,
                                        ariaLabel,
                                        layout = "overlay",
                                        height,
                                        imgCol = "40%",
                                      }: Props) {
  const backgroundImage = bgImageUrl ?? imageUrl;

  const hasExplicitCount = typeof count === "number";
  const computedFromRefs =
    Array.isArray(referrals) ? referrals.length : undefined;
  const total = hasExplicitCount ? count : computedFromRefs;
  const showCount = typeof total === "number";

  const cls = [
    "refCard",
    layout === "split" ? "refCard--split" : "",
    href || onClick ? "is-clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const rootStyle = height ? { height: `${height}px` } : undefined;

  return (
    <TileWrapper
      href={href}
      onClick={onClick}
      className={cls}
      ariaLabel={ariaLabel}
      style={rootStyle}
    >
      {backgroundImage && (
        <div
          className="refCard__img"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {rightImageUrl && (
        <div className="refCard__fg">
          <img src={rightImageUrl} alt="" />
        </div>
      )}

      <div className="refCard__title">{titleTop}</div>

      <div className="refCard__bar">
        <div className="refCard__label">{labelBottom}</div>
        {showCount && <div className="refCard__count">{total}</div>}
      </div>

      {layout === "split" && (
        <style>{`.refCard--split{grid-template-columns:1fr ${imgCol};}`}</style>
      )}
    </TileWrapper>
  );
}