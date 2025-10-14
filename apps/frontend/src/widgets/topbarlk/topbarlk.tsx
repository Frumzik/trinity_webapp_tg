import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import HamburgerIcon from "../../assets/icons/Hamburger.svg";
import AvatarIcon from "../../assets/icons/Ellipse 2.png";
import WalletIcon from "../../assets/icons/wallet.svg";
import HelpIcon from "../../assets/icons/help.svg";
import "./topbarlk.scss";

type Props = {
  balance?: string;
  avatarUrl?: string;
  onMenu: () => void;
  onSupport?: () => void;
  onBalanceClick?: () => void;
  left?: ReactNode;
  right?: ReactNode;
};

export default function TopBar({
  balance = "300 OM",
  onMenu,
  onSupport,
  onBalanceClick,
  left,
  right,
}: Props) {
  return (
    <div className="topbar">
      <div className="topbar__barlk">
        <button className="topbar__btn topbar__btn--ghost" onClick={onMenu}>
          <span>
            <img src={HamburgerIcon} alt="Меню бургер" />
          </span>
        </button>
        <NavLink to="/support">
          <button
            className="topbar__btn topbar__btn--support"
            onClick={onSupport}
          >
            <img src={HelpIcon} alt="" />
            <span>Поддержка</span>
          </button>
        </NavLink>
          <NavLink to="/billing">
        <button
          className="topbar__btn topbar__btn--balance"
          onClick={onBalanceClick}
        >
          <img src={WalletIcon} alt="" />
          <span>{balance}</span>
        </button>
          </NavLink>
          <NavLink to="/view">
        <a className="topbar__avatarlk" href="#">
          {/*{avatarUrl ? <img src={AvatarIcon} alt="" width={36} height={36} /> : null}*/}
          <img src={AvatarIcon} alt="" />
        </a>
          </NavLink>
        {left}
        {right}
      </div>
    </div>
  );
}
