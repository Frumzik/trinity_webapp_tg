import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Bg1 from "../../assets/icons/bg1.svg";
import OrangeBg from "../../assets/image/Differentbg/orangeBg.svg";
import Card1 from "../../assets/icons/products/card9.svg";
import Card2 from "../../assets/icons/products/card10.svg";
import Card3 from "../../assets/icons/products/card11.svg";

import "./academy.scss";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <div className="supportPage">
          <Title>Академия души</Title>

          <div className="supportPage__cards">
            <ScrollPanel
              maxHeight="62dvh"
              vars={{
                railRight: "-15px",
                railTop: "4px",
                railBottom: "4px",
                railWidth: "3px",
                railColor: "#E8E8E8",
                thumbColor: "#C7C7C7",
                zIndex: 20,
              }}
            >
              <FeatureTile
                title="Ступени духа"
                description="Пройдено 1/40"
                bgImageUrl={Bg1}
                rightImageUrl={Card1}
                enabled
                to="/levels"
              />
              <FeatureTile
                title="Полезные материалы"
                description=""
                bgImageUrl={Bg1}
                rightImageUrl={Card2}
                enabled
                to="/materials"
              />
              <FeatureTile
                title="Мастерская знаний"
                description=""
                bgImageUrl={OrangeBg}
                rightImageUrl={Card3}
                enabled
                to="/workshop"
              />
            </ScrollPanel>
          </div>
        </div>
      </main>
      <div className="gbtn-bar">
        <div className="gbtn-bar__inner">
          <GradientButton onClick={() => navigate(-1)}>Назад</GradientButton>
        </div>
      </div>
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  );
}
