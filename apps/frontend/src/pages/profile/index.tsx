// src/pages/profile/index.tsx
import {useMemo, useState} from "react";
import Footer from "../../widgets/footer/footer";
import TopBar from "../../widgets/topbarlk/topbarlk";
import Title from "../../shared/ui/title/Title";
import ProfileHeader from "../../widgets/profile-header";
import IncomeTile from "../../widgets/tiles/MoneyTile/Income";
import LevelTile from "../../widgets/tiles/LevelTile/levelTile";
import GreyTile from "../../widgets/tiles/GreyTile/GreyTile";
import ReferralsTile from "../../widgets/tiles/FriendsTile/FriendsTile";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import GradientButton from "../../shared/ui/gradient-button";
import PresentationSentModal from "../../widgets/presentation-sent-modal";
import PopupIcon from "../../assets/icons/popup.svg";
import Card1 from "../../assets/image/image_1.svg";
import Card2 from "../../assets/image/image_2.svg";
import Card3 from "../../assets/image/About-ptoject.svg";
import Card4 from "../../assets/image/image_4.svg";
import EditIcon from "../../assets/icons/edit.svg";
import "./profile.scss";
import { Link, useNavigate } from 'react-router-dom';
import BurgerMenu from '../../widgets/menuBurger/burger';
import { useGetUserQuery } from "../../shared/api/user.api";
import { getTelegramUser } from "../../shared/telegram/telegram";
import { useGetReferralsStatsQuery } from "../../shared/api/referrals.api";

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

  const BOT_USERNAME = 'TrinityFrontTestBot';


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

  const pickParentId = (u?: any) =>
    u?.userId ?? u?.tgId ?? (typeof u?._id === 'string' ? u._id : undefined);

  const b64url = (s: string) =>
    btoa(unescape(encodeURIComponent(s)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

  const inviteHref = useMemo(() => {
    const parentId = pickParentId(u);
    const baseFromEnv = "https://app.3nity.space";
    const isLocal = typeof window !== 'undefined' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(window.location.origin);
    const baseOrigin = (!isLocal && typeof window !== 'undefined') ? window.location.origin : undefined;
    const base =
      (baseFromEnv && baseFromEnv.replace(/\/+$/, '')) ||
      (baseOrigin && baseOrigin.replace(/\/+$/, '')) ||
      'https://app.3nity.space';

    const siteLink = (() => {
      const p = (u?.referralPath || '').trim();
      if (!p) return base;
      return /^https?:\/\//i.test(p) ? p : `${base}${p.startsWith('/') ? '' : '/'}${p}`;
    })();

    const payload = parentId ? b64url(JSON.stringify({ parentId })) : '';
    const botDeepLink = payload
      ? `https://t.me/${BOT_USERNAME}?start=${payload}`
      : `https://t.me/${BOT_USERNAME}`;

    const share = new URL('https://t.me/share/url');
    share.searchParams.set('url', botDeepLink);
    share.searchParams.set('text', 'Присоединяйся к проекту');
    return share.toString();
  }, [u]);

  return (
    <div className="app" style={{overflow: 'hidden', height: '100svh' }}>
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

        <ProfileHeader
          avatarUrl={avatarUrl}
          name={displayName}
          username={displayUsername}
          premium={premium}
          balance={balanceText}
          onStatusClick={() => nav('/subscription')}
        />

        <section className="scrollBox stack">
          <ScrollPanel
            maxHeight="57dvh"
            vars={{ railRight: "-15px", railTop: "4px", railBottom: "4px", railWidth: "3px", railColor: "#E8E8E8", thumbColor: "#C7C7C7", zIndex: 20 }}
          >
            <div className="tiles">
              <IncomeTile title="Общий доход" amountOM={totalEarn} showIncome imageUrl={Card1} onWithdraw={undefined} to="/withdraw" />
              <LevelTile level={levelsCount} completed={0} total={levelsCount} imageUrl={Card2}/>
              <GreyTile title="О проекте" imageUrl={Card3} buttonText={"Скачать презентацию"} onClick={onDownload}/>
            </div>

            <div className="scrollBox__title-cont">
              <div className="scrollBox__title">Единомышленники</div>
              <div className="scrollBox__icon">
                <a href="#"><img src={PopupIcon} alt="help"/></a>
              </div>
            </div>

            <ReferralsTile imageUrl={Card4} referrals={[]} href="/referrals" />

            <div className="list__referals">
              <div className="list__referals-title">
                <div className="list__referals-title-up">Доход</div>
                <div className="list__referals-title-balance">{totalEarn} OM</div>
              </div>
              <div className="list__referals-subtitle">
                <div className="list__referals-title-levels">Уровни</div>
                <div className="list__referals-title-levels-count">{levelsCount}</div>
              </div>
            </div>

            <ScrollPanel
              maxHeight="200px"
              vars={{ railRight: "0px", railTop: "0px", railBottom: "6px", railWidth: "3px", railColor: "#ededed", thumbColor: "#b0b0b0", zIndex: 999 }}
            >
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
            </ScrollPanel>
          </ScrollPanel>
        </section>

        <div className="screen__spacer"/>
      </main>

      <div className="gbtn-bar">
        <div className="gbtn-bar__inner">
          <GradientButton href={inviteHref} target="_blank">Пригласить друга</GradientButton>
        </div>
      </div>

      <PresentationSentModal open={openModal} onClose={() => setOpenModal(false)} fileName="Trinity.pdf" fileSizeText="9.1 MB" durationText="00:00" />
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer/>
    </div>
  );
};

export default Index;