import { Outlet, useLocation } from 'react-router-dom';
import { FooterTabProvider } from './footer-tab';
import '../shared/styles/main.scss';
import { useSyncTelegramAvatar } from '../shared/lib/hooks/useSyncTelegramAvatar';
import { useEffect, useState } from 'react';
import Preloader from '../widgets/preloader';

export default function App() {
  useSyncTelegramAvatar();

  const location = useLocation();
  const [showPreloader, setShowPreloader] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // страницы, где прелоадер НЕ нужен (пин-логин / пин-создание)
  const isPinPage =
    location.pathname.startsWith('/pin/create') ||
    location.pathname.startsWith('/pin/login');

  useEffect(() => {
    // если мы на пин-странице — прелоадер не показываем вообще
    if (isPinPage) {
      setShowPreloader(false);
      setFadeOut(false);
      return;
    }

    // для остальных страниц — показываем и сразу начинаем прятать
    setShowPreloader(true);
    setFadeOut(false);

    // маленький трюк, чтобы анимация точно сработала
    const id = requestAnimationFrame(() => {
      setFadeOut(true);
    });

    const t = setTimeout(() => setShowPreloader(false), 200);

    return () => {
      cancelAnimationFrame(id);
      clearTimeout(t);
    };
  }, [isPinPage, location.pathname]);

  return (
    <FooterTabProvider>
      {!isPinPage && showPreloader && <Preloader hidden={fadeOut} />}
      <Outlet />
    </FooterTabProvider>
  );
}