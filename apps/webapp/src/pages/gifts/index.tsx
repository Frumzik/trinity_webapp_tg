import { useState } from "react";

import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";

import "./gifts.scss";
import { useAppNavigate } from '../../shared/lib/hooks/useAppNavigate';

export function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useAppNavigate();

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen favorites">
        <Title>Дары</Title>

        <div className="promo-container" style={{ opacity: 0.7 }}>
          Раздел пуст
        </div>

        <div className="space-box" />
      </main>

      <div className="gbtn-bar">
        <div className="gbtn-bar__inner">
          <GradientButton onClick={() => navigate("/home")}>
            Назад
          </GradientButton>
        </div>
      </div>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  );
}

export default Index;