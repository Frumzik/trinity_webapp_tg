import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FooterTabProvider } from './footer-tab';
import '../shared/styles/main.scss';
import { useSyncTelegramAvatar } from '../shared/lib/hooks/useSyncTelegramAvatar';

export default function App() {
  useSyncTelegramAvatar();

  useEffect(() => {
    document.body.classList.add('app-loaded');
    return () => {
      document.body.classList.remove('app-loaded');
    };
  }, []);

  return (
    <FooterTabProvider>
      <Outlet />
    </FooterTabProvider>
  );
}