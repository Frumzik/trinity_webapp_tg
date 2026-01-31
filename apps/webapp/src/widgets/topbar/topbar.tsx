import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import HamburgerIcon from "../../assets/icons/Hamburger.svg";
import AvatarFallback from "../../assets/icons/Ellipse 2.png";
import { useGetUserQuery } from "../../shared/api/user.api";
import { getTelegramUser } from "../../shared/telegram/telegram";
import "./topbar.scss";

type Props = {
  avatarUrl?: string;
  onMenu: () => void;
  left?: ReactNode;
  right?: ReactNode;
};

function avatarFrom(username?: string | null, name?: string | null) {
  const seed = username || name || "user";
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    seed
  )}`;
}

export default function TopBar({ onMenu, left, right, avatarUrl }: Props) {
  const { data } = useGetUserQuery();
  const u = (data as any)?.data ?? (data as any);
  const tg = getTelegramUser();

  const displayName = useMemo(() => {
    if (u?.name) return u.name;
    if (tg?.first_name || tg?.last_name) {
      return [tg?.first_name, tg?.last_name].filter(Boolean).join(" ");
    }
    return "Без имени";
  }, [u, tg]);

  const displayUsername = useMemo(() => {
    return u?.username || tg?.username || "user";
  }, [u, tg]);

  const apiAvatar = u?.avatarUrl as string | undefined;

  const dicebear = useMemo(
    () => avatarFrom(displayUsername, displayName),
    [displayUsername, displayName]
  );

  const rawSrc = avatarUrl ?? apiAvatar ?? tg?.photo_url ?? dicebear;

  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [rawSrc]);

  const src = !broken && rawSrc ? rawSrc : AvatarFallback;

  return (
    <div className="topbar">
      <div className="topbar__bar">
        <button className="topbar__btn topbar__btn--ghost" onClick={onMenu}>
          <span>
            <img src={HamburgerIcon} alt="Меню" />
          </span>
        </button>

        <NavLink to="/view" className="topbar__avatar">
          <img
            src={src}
            alt="Аватар"
            width={36}
            height={36}
            onError={() => setBroken(true)}
          />
          <span className="topbar__status" aria-hidden="true" />
        </NavLink>

        {left}
        {right}
      </div>
    </div>
  );
}