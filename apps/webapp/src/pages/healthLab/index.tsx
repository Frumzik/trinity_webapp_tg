import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Bg1 from "../../assets/icons/bg1.svg";

import "./health-lab.scss";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import Card1 from "../../assets/products/card1.png";
import Card2 from "../../assets/products/card2.png";
import Card3 from "../../assets/products/card3.png";
import Tile2 from "../../assets/homePage/tile3.png";
import Tile1 from "../../assets/homePage/tile1.png";
import Tile3 from "../../assets/homePage/tile2.png";

const TILES = [
  {
    title: (
      <>
        Основы здорового <br />образа жизни
      </>
    ),
    pageTitle: "Основы здорового образа жизни",
    trainingId: 31,
    bgImageUrl: Tile1,
    rightImageUrl: Card1,
    className: "left-block-color",
  },
  {
    title: "Природное оздоровление",
    pageTitle: "Природное оздоровление",
    trainingId: 32,
    bgImageUrl: Tile3,
    rightImageUrl: Card2,
    className: "left-block-color-blue",
  },
  {
    title: "Энциклопедия здоровья",
    pageTitle: "Энциклопедия здоровья",
    trainingId: 33,
    bgImageUrl: Tile2,
    rightImageUrl: Card3,
    className: "left-block-color-yellow",
  },
] as const;

export default function HealthLabIndex() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const openTraining = (trainingId: number, title: string) => {
    navigate("/training-levels", {
      state: {
        rootTrainingId: trainingId,
        title,
        from: location.pathname,
        bg: Bg1,
      },
    });
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <div className="supportPage">
          <Title>Лаборатория Здоровья</Title>

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
              {TILES.map((t, i) => (
                <FeatureTile
                  key={i}
                  title={t.title as any}
                  bgImageUrl={t.bgImageUrl}
                  rightImageUrl={t.rightImageUrl}
                  enabled
                  className={t.className}
                  onClick={() => openTraining(t.trainingId, t.pageTitle)}
                />
              ))}
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