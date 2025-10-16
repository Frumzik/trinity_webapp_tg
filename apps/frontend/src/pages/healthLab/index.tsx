import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Bg1 from "../../assets/icons/bg1.svg";
import Card1 from "../../assets/icons/products/card1.svg";
import Card2 from "../../assets/icons/products/card2.svg";

import "./health-lab.scss";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <div className="supportPage">
          <Title>Лаборатория здоровья</Title>

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
                title="Онлайн курсы"
                description="Пройдено 1/40"
                bgImageUrl={Bg1}
                rightImageUrl={Card1}
                enabled
              />
              <FeatureTile
                title="Живые встречи"
                description="Посещение 1/40"
                bgImageUrl={Bg1}
                rightImageUrl={Card2}
                enabled
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
