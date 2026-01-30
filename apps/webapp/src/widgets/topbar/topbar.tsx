import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import HamburgerIcon from "../../assets/icons/Hamburger.svg";
import { useAvatarSrc } from "../../shared/lib/hooks/useAvatarSrc";
import "./topbar.scss";

type Props = {
  avatarUrl?: string;
  onMenu: () => void;
  left?: ReactNode;
  right?: ReactNode;
};

export default function TopBar({ onMenu, left, right, avatarUrl }: Props) {
  const { src, onError } = useAvatarSrc({ avatarUrl });

  return (
    <div className="topbar">
      <div className="topbar__bar">
        <button className="topbar__btn topbar__btn--ghost" onClick={onMenu}>
          <span>
            <img src={HamburgerIcon} alt="Меню" />
          </span>
        </button>

        <NavLink to="/view" className="topbar__avatar">
          <img src={src} alt="Аватар" width={36} height={36} onError={onError} />
          <span className="topbar__status" aria-hidden="true" />
        </NavLink>

        {left}
        {right}
      </div>
    </div>
  );
}