import "./profile-header.scss";

import WalletIcon from "../../assets/icons/wallet.svg";

type Props = {
    avatarUrl: string;
    name: string;
    username: string;
    premium: boolean;
    balance: string;
    onBalanceClick?: () => void;
    onStatusClick?: () => void;
};

export default function ProfileHeader({
                                          avatarUrl,
                                          name,
                                          username,
                                          premium,
                                          balance,
                                          onBalanceClick,
                                          onStatusClick,
                                      }: Props) {
    return (
        <div className="profileHeader">
            <img className="profileHeader__avatar" src={avatarUrl} alt=""/>
            <div className="profileHeader__info">
                <div className="profileHeader__name">{name}</div>
                <div className="profileHeader__username">@{username}</div>
            </div>
            <div className="profileHeader__side">
                <div className="profileHeader__status">
                    Доступ:{" "}
                    <span
                        className="profileHeader__statusValue"
                        onClick={onStatusClick}
                        role="button"
                        tabIndex={0}
                    >
    {premium ? 'Премиум' : 'Базовый'}
  </span>
                </div>
                <button className="profileHeader__balance" onClick={onBalanceClick}>
          <span className="profileHeader__balanceIcon">
            <div className="img-wrap"><img src={WalletIcon} alt="кошелек"/></div>
          </span>
                    <span className="profileHeader__balanceText">{balance}</span>
                </button>
            </div>
        </div>
    );
}
