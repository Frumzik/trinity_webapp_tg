import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import HamburgerIcon from "../../assets/icons/Hamburger.svg";
import AvatarFallback from "../../assets/icons/Ellipse 2.png";
import { useGetUserQuery } from "../../shared/api/user.api";
import "./topbar.scss";

type Props = {
  avatarUrl?: string;          // опционально можно прокинуть наружу
  onMenu: () => void;
  left?: ReactNode;
  right?: ReactNode;
};

export default function TopBar({ onMenu, left, right, avatarUrl }: Props) {
  const { data } = useGetUserQuery();
  const apiAvatar = (data as any)?.data?.avatarUrl ?? (data as any)?.avatarUrl;

  const rawSrc = avatarUrl ?? apiAvatar;

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