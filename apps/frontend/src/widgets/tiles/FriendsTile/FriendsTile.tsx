import type { ReactNode } from "react";
import "./FriendsTile.scss";
import TileWrapper from "../TileWrapper";

type Referral = { id: string | number };
type Props = {
  imageUrl: string;
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
  titleTop = "Структура",
  labelBottom = "Всего друзей",
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
  const total = typeof count === "number" ? count : (referrals?.length ?? 0);
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
      <div
        className="refCard__img"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="refCard__title">{titleTop}</div>
      <div className="refCard__bar">
        <div className="refCard__label">{labelBottom}</div>
        <div className="refCard__count">{total}</div>
      </div>
      <style>
        {layout === "split"
          ? `
          .refCard--split{grid-template-columns:1fr ${imgCol};}
        `
          : ""}
      </style>
    </TileWrapper>
  );
}
