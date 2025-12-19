import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFooterTab } from "../../app/footer-tab";

import FavoritesIcon from "../../assets/icons/music-library-2.svg";
import DevelopmentIcon from "../../assets/icons/icon.svg";
import HomeIcon from "../../assets/icons/Black.svg";
import ProfileIcon from "../../assets/icons/medal-star.svg";
import StoreIcon from "../../assets/icons/setting-3.svg";

import "./footer.scss";

type FooterTab = "store" | "progress" | "home" | "favorites" | "profile";

export default function Footer() {
  const nav = useNavigate();
  const location = useLocation();
  const { tab, setTab } = useFooterTab();

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

  const goTo = (path: string, t: FooterTab) => {
    setTab(t);
    nav(path);
  };

  return (
    <nav className="footer">
      <div className="footer__bar">
        <button
          type="button"
          className={`footer__item${tab === "store" ? " is-active" : ""}`}
          onClick={() => goTo("/store", "store")}
        >
          <span className="icon">
            <img src={StoreIcon} alt="" />
          </span>
          <span>Лавка изобилия</span>
        </button>

        <button
          type="button"
          className={`footer__item${tab === "progress" ? " is-active" : ""}`}
          onClick={() => goTo("/progress", "progress")}
        >
          <span className="icon">
            <img src={DevelopmentIcon} alt="" />
          </span>
          <span>Развитие</span>
        </button>

        <button
          type="button"
          className={`footer__item${tab === "home" ? " is-active" : ""}`}
          onClick={() => goTo("/home", "home")}
        >
          <span className="icon">
            <img src={HomeIcon} alt="" />
          </span>
          <span>Главная</span>
        </button>

        <button
          type="button"
          className={`footer__item${tab === "favorites" ? " is-active" : ""}`}
          onClick={() => goTo("/favorites", "favorites")}
        >
          <span className="icon">
            <img src={FavoritesIcon} alt="" />
          </span>
          <span>Избранное</span>
        </button>

        <button
          type="button"
          className={`footer__item${tab === "profile" ? " is-active" : ""}`}
          onClick={() => goTo("/profile", "profile")}
          style={{ width: 50 }}
        >
          <span className="icon">
            <img src={ProfileIcon} alt="" />
          </span>
          <span>Личный кабинет</span>
        </button>
      </div>
    </nav>
  );
}