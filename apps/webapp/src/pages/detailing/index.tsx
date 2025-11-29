import { useMemo, useState } from "react";
import Footer from "../../widgets/footer/footer";
import TopBar from "../../widgets/topbarTextpage";
import BurgerMenu from "../../widgets/menuBurger/burger";
import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import "./detailing.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetReferralsLevelsQuery } from "../../shared/api/referrals.api";
import { useGetUserQuery } from "../../shared/api/user.api";
import helpIcon from "../../assets/icons/helpIcon.svg";
import SubscriptionRequiredModal from "../../widgets/flexible-modal/subscription-required-modal";

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

  if (!u) return "—";
  const s = String(u).trim();
  const hasHandle = !!(r.username || r.tgUsername);
  return hasHandle ? (s.startsWith("@") ? s : `@${s}`) : s;
};

const formatOM = (v: unknown) => `${Number(v ?? 0).toLocaleString("ru-RU")} OM`;

const pickAppUserId = (u?: any) => {
  const id = u?.userId ?? (typeof u?._id === "number" ? u._id : undefined);
  return id == null ? undefined : String(id);
};

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false); // модалка подписки
  const location = useLocation();
  const nav = useNavigate();

  const levelFromState = (location.state as any)?.level as number | undefined;
  const level = levelFromState ?? 1;

  const { data: userData } = useGetUserQuery({ populate: true });
  const u = userData?.data;

  const premium = useMemo(() => {
    const type =
      typeof u?.subscription === "object" && u?.subscription
        ? u.subscription.type
        : "free";
    return type && type !== "free";
  }, [u]);

  const {
    data: levelsData,
    isLoading,
    isError,
    refetch,
  } = useGetReferralsLevelsQuery();

  const current = useMemo(() => {
    const list = levelsData ?? [];
    return (
      list.find((x) => x.level === level) || {
        level,
        totalEarn: 0,
        referrals: [] as any[],
      }
    );
  }, [levelsData, level]);

  const inviteHref = useMemo(() => {
    const appUserId = pickAppUserId(u);
    const BOT_USERNAME = "TrinityFrontTestBot";
    const WEBAPP_SHORT_NAME = "TrinityFront";

    const botDeepLink =
      `https://t.me/${BOT_USERNAME}/${WEBAPP_SHORT_NAME}` +
      (appUserId ? `?startapp=${appUserId}` : "");
    const share = new URL("https://t.me/share/url");
    share.searchParams.set("url", botDeepLink);
    return share.toString();
  }, [u]);

  const handleInviteClick = (e?: React.MouseEvent) => {
    e?.preventDefault();

    if (premium) {
      // подписка есть — сразу открываем реферальную ссылку
      window.open(inviteHref, "_blank");
    } else {
      // подписки нет — показываем модалку
      setSubModalOpen(true);
    }
  };

  return (
    <div className="app">
      <TopBar
      />
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
          <div style={{ fontSize: "27px" }}>Детализация</div>
        </Title>

        <section className="scrollBox stack" style={{ marginTop: "20px" }}>
          <div className="list__referals-det">
            <div className="list__referals-title-det">
              <div className="list__referals-title-up-det">Поколение</div>
              <div className="list__referals-title-balance-det">{level}</div>
            </div>
          </div>

          {isLoading && <div style={{ padding: 16 }}>Загрузка…</div>}
          {isError && (
            <div style={{ padding: 16 }}>
              Не удалось загрузить.{" "}
              <button onClick={() => refetch()}>Повторить</button>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="list">
              {current.referrals.length === 0 && (
                <div style={{ padding: 16, opacity: 0.7 }}>Пока пусто</div>
              )}

              {current.referrals.map((r, i) => (
                <div className="row" key={r.id ?? r.userId ?? i}>
                  <span className="row__title">{formatName(r)}</span>
                  <span className="row__count">{formatOM(r.amount)}</span>
                </div>
              ))}
            </div>
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
          nav("/subscription");
        }}
      />

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  );
};

export default Index;