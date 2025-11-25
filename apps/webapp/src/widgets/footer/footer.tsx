import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFooterTab } from "../../app/footer-tab";

import FavoritesIcon from "../../assets/icons/music-library-2.svg";
import DevelopmentIcon from "../../assets/icons/icon.svg";
import HomeIcon from "../../assets/icons/Black.svg";
import ProfileIcon from "../../assets/icons/medal-star.svg";
import StoreIcon from "../../assets/icons/setting-3.svg";

import "./footer.scss";

import SubscriptionRequiredModal from "../flexible-modal/subscription-required-modal";
import { useGetUserQuery } from "../../shared/api/user.api";

type FooterTab = "store" | "progress" | "home" | "favorites" | "profile";

export default function Footer() {
  const nav = useNavigate();
  const location = useLocation();
  const { tab, setTab } = useFooterTab();

  // ---- подписка из API юзера ----
  const { data: userRes, isLoading: isUserLoading } = useGetUserQuery({
    populate: true,
  });
  const user = userRes?.data;

  const hasPaidSubscription = useMemo(() => {
    const type = String(user?.subscription?.type || "").toLowerCase();
    const paid = type === "pro" || type === "premium";
    console.log("[footer] subscription type =", type, "paid =", paid);
    return paid;
  }, [user]);

  const [modalOpen, setModalOpen] = useState(false);

  const goProtected = (path: string, t: FooterTab, needsSub: boolean) => {
    console.log("[goProtected] path=", path, "needsSub=", needsSub);

    if (needsSub) {
      // ждём пока юзер загрузится
      if (isUserLoading) {
        console.log("[goProtected] user loading, ignore click");
        return;
      }

      if (!hasPaidSubscription) {
        console.log("[goProtected] NO ACCESS -> open modal");
        setModalOpen(true);
        return; // ВАЖНО: не навигируемся!
      }
    }

    console.log("[goProtected] ACCESS OK -> navigate");
    setTab(t);
    nav(path);
  };

  const getTabFromPath = (pathname: string): FooterTab => {
    if (pathname.startsWith("/store")) return "store";
    if (pathname.startsWith("/progress")) return "progress";
    if (pathname.startsWith("/favorites")) return "favorites";
    if (pathname.startsWith("/profile")) return "profile";
    return "home";
  };

  // Синхронизируем состояние таба с текущим роутом
  useEffect(() => {
    const currentTab = getTabFromPath(location.pathname);
    if (currentTab !== tab) {
      setTab(currentTab);
    }
  }, [location.pathname, tab, setTab]);

  return (
    <>
      <SubscriptionRequiredModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGoToSubscription={() => {
          setModalOpen(false);
          nav("/subscription");
        }}
      />

      <nav className="footer">
        <div className="footer__bar">
          <button
            type="button"
            className={`footer__item${tab === "store" ? " is-active" : ""}`}
            onClick={() => goProtected("/store", "store", true)}
          >
            <span className="icon">
              <img src={StoreIcon} alt="" />
            </span>
            <span>Лавка изобилия</span>
          </button>

          <button
            type="button"
            className={`footer__item${tab === "progress" ? " is-active" : ""}`}
            onClick={() => goProtected("/progress", "progress", true)}
          >
            <span className="icon">
              <img src={DevelopmentIcon} alt="" />
            </span>
            <span>Развитие</span>
          </button>

          <button
            type="button"
            className={`footer__item${tab === "home" ? " is-active" : ""}`}
            onClick={() => goProtected("/home", "home", false)}
          >
            <span className="icon">
              <img src={HomeIcon} alt="" />
            </span>
            <span>Главная</span>
          </button>

          <button
            type="button"
            className={`footer__item${tab === "favorites" ? " is-active" : ""}`}
            onClick={() => goProtected("/favorites", "favorites", true)}
          >
            <span className="icon">
              <img src={FavoritesIcon} alt="" />
            </span>
            <span>Избранное</span>
          </button>

          <button
            type="button"
            className={`footer__item${tab === "profile" ? " is-active" : ""}`}
            onClick={() => goProtected("/profile", "profile", false)}
            style={{ width: 50 }}
          >
            <span className="icon">
              <img src={ProfileIcon} alt="" />
            </span>
            <span>Личный кабинет</span>
          </button>
        </div>
      </nav>
    </>
  );
}