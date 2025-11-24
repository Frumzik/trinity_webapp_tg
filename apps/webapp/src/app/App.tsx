import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FooterTabProvider } from './footer-tab';
import '../shared/styles/main.scss';
import { useSyncTelegramAvatar } from '../shared/lib/hooks/useSyncTelegramAvatar';
import Preloader from '../widgets/preloader';

function DesktopOnlyScreen() {
  return (
    <main className="screen desktop-only">
      <div className="desktop-only__inner">
        <h1>Откройте приложение с телефона</h1>
        <p>
          Это приложение рассчитано на использование на мобильных устройствах.
          Пожалуйста, зайдите сюда с телефона.
        </p>
      </div>
    </main>
  );
}

const LOADER_DURATION_MS = 500;

export default function App() {
  useSyncTelegramAvatar();
  const location = useLocation();

  // прелоадер включается на КАЖДЫЙ change location.key на 500 ms
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    document.body.classList.add('app-loaded');
    return () => {
      document.body.classList.remove('app-loaded');
    };
  }, []);

  useEffect(() => {
    // каждый раз при смене маршрута:
    // 1) включаем прелоадер
    // 2) через 500 ms выключаем
    setShowLoader(true);
    const timer = window.setTimeout(() => {
      setShowLoader(false);
    }, LOADER_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.key]);

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const getBackgroundImage = () => {
    if (location.pathname === '/home') {
      return "url('/bg/bgmain.jpg')";
    }
    if (
      location.pathname.startsWith('/profile') ||
      location.pathname.startsWith('/detailing') ||
      location.pathname.startsWith('/about')
    ) {
      return "url('/bg/bglk.jpg')";
    }
    if (
      location.pathname.startsWith('/pin/create') ||
      location.pathname.startsWith('/pin/login')
    ) {
      return "url('/bg/bgpin.jpg')";
    }

    return "url('/bg/bgmain.jpg')";
  };

  const shouldShowTopRect = () => {
    const normalizedPathname = location.pathname.startsWith('/')
      ? location.pathname
      : `/${location.pathname}`;

    const withoutRect = [
      /^\/level(\/|$)/,
      /^\/lesson(\/|$)/,
      /^\/player(\/|$)/,
      /^\/preview(\/|$)/,
    ];

    return !withoutRect.some((re) => re.test(normalizedPathname));
  };

  const layoutStyle = {
    backgroundImage: getBackgroundImage(),
  };

  return (
    <FooterTabProvider>
      {showLoader && (
        <div className="global-preloader">
          <Preloader />
        </div>
      )}

      <div className="app-layout" style={layoutStyle}>
        {shouldShowTopRect() && <div className="top-rectangle" />}

        {!isMobile ? (
          <div className="app-content">
            <DesktopOnlyScreen />
          </div>
        ) : (
          <div className="app-content">
            <Outlet />
          </div>
        )}
      </div>
    </FooterTabProvider>
  );
}