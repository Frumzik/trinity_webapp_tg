import { ReactNode, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import HamburgerIcon from '../../assets/icons/Hamburger.svg';
import WalletIcon from '../../assets/icons/wallet.svg';
import HelpIcon from '../../assets/icons/help.svg';
import './topbarlk.scss';
import { useGetUserQuery } from '../../shared/api/user.api';
import { getTelegramUser } from '../../shared/telegram/telegram';

type Props = {
  balance?: string;
  avatarUrl?: string;
  onMenu: () => void;
  onSupport?: () => void;
  onBalanceClick?: () => void;
  left?: ReactNode;
  right?: ReactNode;
};

function avatarFrom(username?: string | null, name?: string | null) {
  const seed = username || name || 'user';
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    seed
  )}`;
}

export default function TopBar({
  onMenu,
  onSupport,
  onBalanceClick,
  left,
  right,
}: Props) {
  const { data } = useGetUserQuery({ populate: true });
  const u = data?.data;
  const tg = getTelegramUser();

  const displayName = useMemo(() => {
    if (u?.name) return u.name;
    if (tg?.first_name || tg?.last_name)
      return [tg?.first_name, tg?.last_name].filter(Boolean).join(' ');
    return 'Без имени';
  }, [u, tg]);

  const displayUsername = useMemo(() => {
    return u?.username || tg?.username || '—';
  }, [u, tg]);

  const avatarUrl = useMemo(() => {
    return (
      u?.avatarUrl || tg?.photo_url || avatarFrom(displayUsername, displayName)
    );
  }, [u, tg, displayUsername, displayName]);

  const balanceText = useMemo(() => {
    const raw = Number(u?.balance ?? 0);
    const int = Number.isFinite(raw) ? Math.trunc(raw) : 0;
    return `${int} OM`;
  }, [u?.balance]);


  return (
    <div className="topbar">
      <div className="topbar__barlk">

        <NavLink to="/support">
          <button
            className="topbar__btn topbar__btn--support-pr "
            onClick={onSupport}
          >

            <i><span className={"dostup"}>Доступ:</span> Активен</i>
          </button>
        </NavLink>
        <NavLink to="/billing">
          <button
            className="topbar__btn topbar__btn--balance-pr"
            onClick={onBalanceClick}
          >
            <span className="img-wrap"><img src={WalletIcon} alt="" /></span>
            <span>{balanceText}</span>
          </button>
        </NavLink>
        <NavLink to="/view">
          <div className="topbar__avatarlk">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" width={36} height={36} />
            ) : null}
          </div>
        </NavLink>
        {left}
        {right}
      </div>
    </div>
  );
}
