import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FooterTabProvider } from './footer-tab';
import '../shared/styles/main.scss';
import { useSyncTelegramAvatar } from '../shared/lib/hooks/useSyncTelegramAvatar';
import Preloader from '../widgets/preloader';

export default function App() {
  useSyncTelegramAvatar();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    document.body.classList.add('app-loaded');
    return () => {
      document.body.classList.remove('app-loaded');
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);

    return () => clearTimeout(t);
  }, [location.pathname]);

  // const isMobile =
  //   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  //     navigator.userAgent
  //   );

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
    ];

    return !withoutRect.some((re) => re.test(normalizedPathname));
  };
  const layoutStyle: React.CSSProperties = {
    backgroundImage: getBackgroundImage(),
    ...(loading ? { pointerEvents: 'none' } : {}),
  };

  return (
    <FooterTabProvider>
      {loading && <Preloader />}
      <div className="app-layout" style={layoutStyle}>
        {shouldShowTopRect() && <div className="top-rectangle"></div>}
        <Outlet />
      </div>
    </FooterTabProvider>
  );
}