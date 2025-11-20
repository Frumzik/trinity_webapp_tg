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
const CONTENT_DELAY_MS = 80;

export default function App() {
  useSyncTelegramAvatar();
  const location = useLocation();

  const [showLoader, setShowLoader] = useState(true);
  const [canRenderContent, setCanRenderContent] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    document.body.classList.add('app-loaded');
    return () => {
      document.body.classList.remove('app-loaded');
    };
  }, []);

  useEffect(() => {
    let loaderTimer: number | undefined;
    let contentTimer: number | undefined;

    setShowLoader(true);
    setCanRenderContent(false);
    setIsContentVisible(false);

    contentTimer = window.setTimeout(() => {
      setCanRenderContent(true);
    }, CONTENT_DELAY_MS);

    loaderTimer = window.setTimeout(() => {
      setShowLoader(false);
      setIsContentVisible(true);
    }, MIN_LOADER_MS);

    return () => {
      if (loaderTimer) window.clearTimeout(loaderTimer);
      if (contentTimer) window.clearTimeout(contentTimer);
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

  const layoutStyle: React.CSSProperties = {
    backgroundImage: getBackgroundImage(),
  };

  const contentClassName = `app-content ${
    isContentVisible ? 'app-content--visible' : ''
  }`;

  return (
    <FooterTabProvider>
      <div className="app-layout" style={layoutStyle}>
        {shouldShowTopRect() && <div className="top-rectangle" />}

        {!isMobile ? (
          canRenderContent && (
            <div className={contentClassName}>
              <DesktopOnlyScreen />
            </div>
          )
        ) : (
          canRenderContent && (
            <div className={contentClassName}>
              <Outlet />
            </div>
          )
        )}

        {showLoader && (
          <div className="global-preloader">
            <Preloader />
          </div>
        )}
      </div>
    </FooterTabProvider>
  );
}