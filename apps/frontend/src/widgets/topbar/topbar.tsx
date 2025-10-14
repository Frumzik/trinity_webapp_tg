import type { ReactNode } from "react";
import HamburgerIcon from "../../assets/icons/Hamburger.svg";
import AvatarIcon from "../../assets/icons/Ellipse 2.png";
import "./topbar.scss";
import {NavLink} from "react-router-dom";

type Props = {
  avatarUrl?: string;
  onMenu: () => void;
  left?: ReactNode;
  right?: ReactNode;
};

export default function TopBar({ onMenu, left, right }: Props) {
  return (
    <div className="topbar">
      <div className="topbar__bar">
        <button className="topbar__btn topbar__btn--ghost" onClick={onMenu}>
          <span>
            <img src={HamburgerIcon} alt="Меню бургер" />
          </span>
        </button>
          <NavLink to="/view">
        <a className="topbar__avatar" href="#">
          {/*{avatarUrl ? <img src={AvatarIcon} alt="" width={36} height={36} /> : null}*/}
          <img src={AvatarIcon} alt="" />
          <span className="topbar__status" aria-hidden="true"></span>
        </a>
              </NavLink>
        {left}
        {right}
      </div>
    </div>
  );
}
