import { Outlet } from 'react-router-dom';
import { FooterTabProvider } from './footer-tab';
import '../shared/styles/main.scss';
import { useSyncTelegramAvatar } from '../shared/lib/hooks/useSyncTelegramAvatar';
import { useEffect } from 'react';

export default function App() {
  useSyncTelegramAvatar();

  useEffect(() => {
    (window as any).__hidePreloader?.();
  }, []);

  return (
    <FooterTabProvider>
      <Outlet />
    </FooterTabProvider>
  );
}