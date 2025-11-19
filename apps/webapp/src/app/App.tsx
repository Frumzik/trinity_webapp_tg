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

const MIN_LOADER_MS = 500;

export default function App() {
  useSyncTelegramAvatar();
  const location = useLocation();

  const [showLoader, setShowLoader] = useState(true);
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    document.body.classList.add('app-loaded');
    return () => {
      document.body.classList.remove('app-loaded');
    };
  }, []);

  // Прелоадер на первый рендер + на каждый переход
  useEffect(() => {
    let timer: number | undefined;

    // первый раз тоже показываем прелоадер
    if (isFirstRender) {
      setIsFirstRender(false);
    }

    setShowLoader(true);

    timer = window.setTimeout(() => {
      setShowLoader(false);
    }, MIN_LOADER_MS);

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [location.key, isFirstRender]);

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

  const layoutStyle: React.CSSProperties = {
    backgroundImage: getBackgroundImage(),
  };

  return (
    <FooterTabProvider>
      <div className="app-layout" style={layoutStyle}>
        {shouldShowTopRect() && <div className="top-rectangle" />}

        {!isMobile ? <DesktopOnlyScreen /> : <Outlet />}

        {showLoader && (
          <div className="global-preloader">
            <Preloader />
          </div>
        )}
      </div>
    </FooterTabProvider>
  );
}