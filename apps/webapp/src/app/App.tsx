import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FooterTabProvider } from './footer-tab';
import '../shared/styles/main.scss';
import { useSyncTelegramAvatar } from '../shared/lib/hooks/useSyncTelegramAvatar';
import Preloader from '../widgets/preloader';
import "./app.scss"

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

function isMobileUserAgent() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function getBackgroundImage(pathname: string) {
  if (pathname === '/home') return "url('/bg/bgmain.jpg')";

  if (
    pathname.startsWith('/profile') ||
    pathname.startsWith('/detailing') ||
    pathname.startsWith('/about')
  ) {
    return "url('/bg/bglk.jpg')";
  }

  if (pathname.startsWith('/pin/create') || pathname.startsWith('/pin/login')) {
    return "url('/bg/bgpin.jpg')";
  }

  return "url('/bg/bgmain.jpg')";
}

function shouldShowTopRect(pathname: string) {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (normalized.startsWith('/player') && normalized !== '/player/complete') {
    return false;
  }

  const withoutRect = [/^\/level(\/|$)/, /^\/lesson(\/|$)/, /^\/preview(\/|$)/];

  return !withoutRect.some((re) => re.test(normalized));
}

export default function App() {
  useSyncTelegramAvatar();
  const location = useLocation();

  // 1) Мобильность лучше вычислить один раз (чтоб не дергалось)
  const isMobile = useMemo(() => isMobileUserAgent(), []);

  // 2) Глобальный лоадер
  const [showLoader, setShowLoader] = useState(false);

  // 3) Заморозка фона на время лоадера, чтобы не было “мигания” из-за смены bg
  const lastBgRef = useRef<string>(getBackgroundImage(location.pathname));

  // Всегда обновляем “последний фон” когда лоадера нет
  const nextBg = getBackgroundImage(location.pathname);
  if (!showLoader) {
    lastBgRef.current = nextBg;
  }

  useEffect(() => {
    document.body.classList.add('app-loaded');
    return () => {
      document.body.classList.remove('app-loaded');
    };
  }, []);

  // КЛЮЧЕВОЕ: useLayoutEffect вместо useEffect (до отрисовки!)
  useLayoutEffect(() => {
    setShowLoader(true);

    const timer = window.setTimeout(() => {
      setShowLoader(false);
    }, LOADER_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [location.key]);

  const layoutStyle = useMemo(
    () => ({
      backgroundImage: showLoader ? lastBgRef.current : nextBg,
    }),
    [showLoader, nextBg]
  );

  const topRectVisible = useMemo(
    () => shouldShowTopRect(location.pathname),
    [location.pathname]
  );

  return (
    <FooterTabProvider>
      <div className="app-layout" style={layoutStyle}>
        {topRectVisible && <div className="top-rectangle" />}

        <div className="app-content">
          {!isMobile ? <DesktopOnlyScreen /> : <Outlet />}
        </div>
      </div>

      {showLoader && (
        <div className="global-preloader" aria-busy="true" aria-live="polite">
          <Preloader />
        </div>
      )}
    </FooterTabProvider>
  );
}