import {useMemo, useState} from "react";
import Footer from "../../widgets/footer/footer";
import TopBar from "../../widgets/topbarlk/topbarlk";
import Title from "../../shared/ui/title/Title";
import ProfileHeader from "../../widgets/profile-header";
import IncomeTile from "../../widgets/tiles/MoneyTile/Income";
import GreyTile from "../../widgets/tiles/GreyTile/GreyTile";
import ReferralsTile from "../../widgets/tiles/FriendsTile/FriendsTile";
import GradientButton from "../../shared/ui/gradient-button";
import PresentationSentModal from "../../widgets/presentation-sent-modal";
import Tile1 from "../../assets/homePage/tile1.png";
import Card1 from "../../assets/products/card7.png";

import Card3 from "../../assets/products/card8.png";
import Card5 from "../../assets/products/card9.png";
import EditIcon from "../../assets/icons/edit.svg";
import "./profile.scss";
import { Link, useNavigate } from 'react-router-dom';
import BurgerMenu from '../../widgets/menuBurger/burger';
import { useGetUserQuery } from "../../shared/api/user.api";
import { getTelegramUser } from "../../shared/telegram/telegram";
import { useGetReferralsStatsQuery } from "../../shared/api/referrals.api";
import Blur from '../../../public/blurs/blur-1.png';

function avatarFrom(username?: string|null, name?: string|null) {
  const seed = username || name || 'user'
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`
}

const Index = () => {
  const [openModal, setOpenModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate()

  const { data } = useGetUserQuery({ populate: true })
  const u = data?.data
  const tg = getTelegramUser()

  const { data: stats } = useGetReferralsStatsQuery()



  const displayName = useMemo(() => {
    if (u?.name) return u.name
    if (tg?.first_name || tg?.last_name) return [tg?.first_name, tg?.last_name].filter(Boolean).join(' ')
    return 'Без имени'
  }, [u, tg])

  const displayUsername = useMemo(() => {
    return u?.username || tg?.username || '—'
  }, [u, tg])

  const avatarUrl = useMemo(() => {
    return (u as any)?.avatarUrl || (tg as any)?.photo_url || avatarFrom(displayUsername, displayName)
  }, [u, tg, displayUsername, displayName])

  const balanceText = useMemo(() => `${u?.balance ?? 0} OM`, [u])

  const premium = useMemo(() => {
    const type = typeof (u as any)?.subscription === 'object' && (u as any)?.subscription ? (u as any).subscription.type : 'free'
    return type && type !== 'free'
  }, [u])

  const totalEarn = useMemo(() => (stats ?? []).reduce((s, x) => s + (x.totalEarn || 0), 0), [stats])
  const levelsCount = useMemo(() => (stats ?? []).length || 0, [stats])

  const onDownload = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setOpenModal(true);
  }
  const totalReferrals = useMemo(
    () => (stats ?? []).reduce((sum, x) => sum + (x.count || 0), 0),
    [stats]
  );
  const pickAppUserId = (u?: any) => {
    const id = u?.userId ?? (typeof u?._id === "number" ? u._id : undefined);
    return id == null ? undefined : String(id);
  };

  const inviteHref = useMemo(() => {
    const appUserId = pickAppUserId(u);
    const BOT_USERNAME = "TrinityFrontTestBot";
    const WEBAPP_SHORT_NAME = "TrinityFront";

    const botDeepLink =
      `https://t.me/${BOT_USERNAME}/${WEBAPP_SHORT_NAME}` +
      (appUserId ? `?startapp=${appUserId}` : "");
    const share = new URL("https://t.me/share/url");
    share.searchParams.set("url", botDeepLink);
    share.searchParams.set("text", "Присоединяйся к проекту ✨");
    return share.toString();
  }, [u]);
  function LogoutButton() {
    const handleLogout = () => {
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("__tg_user");
        window.location.reload();
      } catch (e) {
        window.location.reload();
      }
    };
    return (
      <button
        onClick={handleLogout}
        style={{
          position: "fixed",
          top: 8,
          right: 8,
          zIndex: 9999,
          fontSize: 11,
          padding: "6px 8px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer",
          opacity: 0.85,
        }}
      >
        Разлогин
      </button>
    );
  }
  return (
    <div className="app lk-bg">
      <img src={Blur} className={"blur"} alt="" />
      <TopBar onMenu={() => setMenuOpen(true)} />
      <main className="screen" style={{ paddingTop: "20px" }}>
        <Title
          right={
            <Link to="/account" className="icon-btn">
              <img src={EditIcon} alt=""/>
            </Link>
          }
        >
          Личный кабинет
        </Title>
        {/*<LogoutButton />*/}
        <ProfileHeader
          avatarUrl={avatarUrl}
          name={displayName}
          username={displayUsername}
          premium={premium}
          balance={balanceText}
          onStatusClick={() => nav('/subscription')}
        />
        <section className="scrollBox stack">
            <div className="tiles">
              <IncomeTile
                title="Общие вознаграждения"
                amountOM={totalEarn}
                showIncome
                imageUrl={Tile1}
                overlayImageUrl={Card1}
                to="/withdraw"
              />
              <GreyTile title="О проекте" imageUrl={Card3} buttonText={"Скачать презентацию"} onClick={onDownload}/>
            </div>
        <div className="profile-wrapper">
            <div className="scrollBox__title-cont">
              <div className="scrollBox__title">Единомышленники</div>
            </div>
            <ReferralsTile  clickable={false} rightImageUrl={Card5} count={totalReferrals} href="/referrals" />
            <div className="list__referals">
              <div className="list__referals-subtitle">
                <div className="list__referals-title-levels">Поколения</div>
                <div className="list__referals-title-levels-count">{levelsCount}</div>
              </div>
            </div>
              <div className="list">
                {(stats ?? []).map((row) => (
                  <div
                    key={row.level}
                    className="row is-clickable"
                    role="button"
                    tabIndex={0}
                    onClick={() => nav('/detailing', { state: { level: row.level } })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        nav('/detailing', { state: { level: row.level } });
                      }
                    }}
                  >
                    <span className="row__num">{row.level}</span>
                    <span className="row__count">{row.totalEarn} OM</span>
                  </div>
                ))}
              </div>
        </div>
        </section>
        <div className="screen__spacer"/>
      </main>
      <div className="gbtn-bar">
        <div className="gbtn-bar__inner">
          <GradientButton href={inviteHref} target="_blank">Пригласить</GradientButton>
        </div>
      </div>
      <PresentationSentModal open={openModal} onClose={() => setOpenModal(false)} fileName="Trinity.pdf" fileSizeText="9.1 MB" durationText="00:00" />
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer/>
    </div>
  );
};

export default Index;