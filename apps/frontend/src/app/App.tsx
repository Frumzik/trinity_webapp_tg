import { Outlet } from 'react-router-dom';
import { FooterTabProvider } from './footer-tab';
import '../shared/styles/main.scss';
import { useSyncTelegramAvatar } from '../shared/lib/hooks/useSyncTelegramAvatar';

export default function App() {
  useSyncTelegramAvatar();
  return (
    <FooterTabProvider>
      <Outlet />
    </FooterTabProvider>
  );
}