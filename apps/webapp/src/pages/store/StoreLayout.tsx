import './store.scss';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TopBar from '../../widgets/topbar/topbar';
import TopBar2 from '../preview/ui/TopActions';
import Footer from '../../widgets/footer/footer';
import BurgerMenu from '../../widgets/menuBurger/burger';
import { useAvatarSrc } from '../../shared/lib/hooks/useAvatarSrc';

export default function StoreLayout({ variant }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();
  const { src: avatarSrc, onError } = useAvatarSrc();
  return (
    <div className="app" style={{ ['--gbutton-h' as any]: '60px' }}>
      {variant === 'root' ? (
        <TopBar onMenu={() => setMenuOpen(true)} />
      ) : (
        <div style={{ marginTop: 80 }}>
          <TopBar2
            showFav={false}
            onBack={() => nav(-1)}
            onMenu={() => {}}
            avatarSrc={avatarSrc}
          />
        </div>
      )}

      <main className="screen">
        <Outlet />
      </main>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  );
}