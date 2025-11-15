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

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  return (
    <FooterTabProvider>
      {loading && <Preloader />}
      <div className="app-layout" style={loading ? { pointerEvents: 'none' } : undefined}>
        {isMobile && <div className="top-rectangle"></div>}
        <Outlet />
      </div>
    </FooterTabProvider>
  );
}