import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import PromoTile from "../../widgets/promo-tile";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Card1 from "../../assets/icons/products/card1.svg";
import Card2 from "../../assets/icons/products/card13.svg";
import Card3 from "../../assets/icons/products/card14.svg";
import Card5 from "../../assets/icons/products/card12.svg";
import Card6 from "../../assets/icons/himical.svg";
import Bgmini from "../../assets/icons/bgmini.svg";

import "./materials.scss";

const films = [
  { id: 1, title: "Фильмы", subtitle: "Ежедневные", imageUrl: Card5 },
  { id: 2, title: "Музыка", subtitle: "Скоро", imageUrl: Card2 },
  { id: 3, title: "Книги", imageUrl: Card3 },
  { id: 4, title: "Подборки", imageUrl: Card1 },
  { id: 5, title: "Новое", imageUrl: Card5 },
  { id: 6, title: "Хит", imageUrl: Card6 },
];

export function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />
      <main className="screen favorites">
        <Title>Полезные материалы</Title>
        <div className="promo-container">
          <PromoTile
            title={films[0].title}
            bgSrc={Bgmini}
            imageUrl={films[0].imageUrl}
            to="/films"
          />
          <PromoTile
            title={films[1].title}
            bgSrc={Bgmini}
            imageUrl={films[1].imageUrl}
          />
          <PromoTile
            title={films[2].title}
            bgSrc={Bgmini}
            imageUrl={films[2].imageUrl}
          />
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

export default Index;
