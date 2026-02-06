import { useMemo, useState } from 'react';
import Footer from '../../widgets/footer/footer';
import TopBar from '../../widgets/topbarTextpage';
import BurgerMenu from '../../widgets/menuBurger/burger';
import Title from '../../shared/ui/title/Title';
import GradientButton from '../../shared/ui/gradient-button';
import './detailing.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetReferralsLevelsQuery } from '../../shared/api/referrals.api';
import { useGetUserQuery } from '../../shared/api/user.api';
import SubscriptionRequiredModal from '../../widgets/flexible-modal/subscription-required-modal';
import { Virtuoso } from 'react-virtuoso';

const formatName = (r: any) => {
  const u =
    r.username ||
    r.tgUsername ||
    r.login ||
    r.user?.username ||
    r.name ||
    r.user?.name ||
    r.displayName ||
    r.email ||
    r.id;

  if (!u) return '—';
  const s = String(u).trim();
  const hasHandle = !!(r.username || r.tgUsername);
  return hasHandle ? (s.startsWith('@') ? s : `@${s}`) : s;
};

const formatOM = (v: unknown) => `${Number(v ?? 0).toLocaleString('ru-RU')} OM`;

const pickAppUserId = (u?: any) => {
  const id = u?.userId ?? (typeof u?._id === 'number' ? u._id : undefined);
  return id == null ? undefined : String(id);
};

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const location = useLocation();
  const nav = useNavigate();

  const levelFromState = (location.state as any)?.level as number | undefined;
  const level = levelFromState ?? 1;

  const { data: userData } = useGetUserQuery({ populate: true });
  const u = userData?.data;

  const premium = useMemo(() => {
    const type =
      typeof u?.subscription === 'object' && u?.subscription
        ? u.subscription.type
        : 'free';
    return type && type !== 'free';
  }, [u]);

  const { data: levelsData, isLoading, isError, refetch } =
    useGetReferralsLevelsQuery();

  const current = useMemo(() => {
    const list = (levelsData as any) ?? [];
    return (
      list.find((x: any) => x.level === level) || {
        level,
        totalEarn: 0,
        referrals: [] as any[],
      }
    );
  }, [levelsData, level]);

  const openTgChatByHandle = (handle: string) => {
    const username = handle.replace(/^@/, '').trim();
    if (!username) return;

    const url = `https://t.me/${encodeURIComponent(username)}`;

    const tg = (window as any)?.Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const inviteHref = useMemo(() => {
    const appUserId = pickAppUserId(u);
    const BOT_USERNAME = 'TrinitySpaceBot';
    const botDeepLink = `https://t.me/${BOT_USERNAME}?start=${appUserId}`;
    const share = new URL('https://t.me/share/url');
    share.searchParams.set('url', botDeepLink);
    return share.toString();
  }, [u]);

  const handleInviteClick = (e?: React.MouseEvent) => {
    e?.preventDefault();

    if (premium) {
      window.open(inviteHref, '_blank');
    } else {
      setSubModalOpen(true);
    }
  };

  const referrals = (current?.referrals ?? []) as any[];
  const count = referrals.length;

  const MAX_VH = 50;
  const VIRT_AFTER = 80;
  const useVirtual = count > VIRT_AFTER;

  const Row = (r: any) => (
    <div className="wrapRow" key={r.id}>
      <div className="row">
        <span
          className="row__title row__title--link"
          onClick={() => openTgChatByHandle(formatName(r))}
          role="button"
          tabIndex={0}
        >
          {formatName(r)}
        </span>
        <span className="row__count">{formatOM(r.earn)}</span>
      </div>
    </div>
  );

  return (
    <div className="app">
      <TopBar />
      <main className="screen" style={{ marginTop: 36 }}>
        <Title
          right={
            <button
              className="icon-btn"
              onClick={() => refetch()}
              aria-label="Обновить"
            />
          }
        >
          <div style={{ fontSize: '27px' }}>Детализация</div>
        </Title>

        <section className="scrollBox stack" style={{ marginTop: '20px' }}>
          <div className="list__referals-det">
            <div className="list__referals-title-det">
              <div className="list__referals-title-up-det">Поколение</div>
              <div className="list__referals-title-balance-det">{level}</div>
            </div>
          </div>

          {isLoading && <div style={{ padding: 16 }}>Загрузка…</div>}

          {isError && (
            <div style={{ padding: 16 }}>
              Не удалось загрузить.{' '}
              <button onClick={() => refetch()}>Повторить</button>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {count === 0 ? (
                <div

                  style={{ color: "#FFF",   textAlign: 'center', opacity: 0.7 }}
                >
                  Пока нет пользователей
                </div>
              ) : useVirtual ? (
                <div className="list" style={{ height: `${MAX_VH}vh` }}>
                  <Virtuoso
                    style={{ height: '100%' }}
                    data={referrals}
                    itemContent={(i, r) => (
                      <div className="wrapRow">
                        <div className="row">
                          <span
                            className="row__title row__title--link"
                            onClick={() =>
                              openTgChatByHandle(formatName(r))
                            }
                            role="button"
                            tabIndex={0}
                          >
                            {formatName(r)}
                          </span>
                          <span className="row__count">{formatOM(r.earn)}</span>
                        </div>
                      </div>
                    )}
                  />
                </div>
              ) : (
                <div
                  className="list"
                  style={{ maxHeight: `${MAX_VH}vh`, overflowY: 'auto' }}
                >
                  {referrals.map((r: any) => Row(r))}
                </div>
              )}
            </>
          )}
        </section>

        <div className="screen__spacer" />
      </main>

      <div className="gbtn-bar">
        <div className="gbtn-bar__inner">
          <GradientButton onClick={handleInviteClick}>
            Пригласить
          </GradientButton>
        </div>
      </div>

      <SubscriptionRequiredModal
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        onGoToSubscription={() => {
          setSubModalOpen(false);
          nav('/subscription');
        }}
      />

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  );
};

export default Index;