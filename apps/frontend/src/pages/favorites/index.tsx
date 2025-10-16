import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import PromoSlider from "../../widgets/card-slider-favoritesPage/index";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Card1 from "../../assets/icons/products/card1.svg";
import Card2 from "../../assets/icons/products/card2.svg";
import Card3 from "../../assets/icons/products/card3.svg";
import Card4 from "../../assets/icons/products/card4.svg";
import Card5 from "../../assets/icons/products/card5.svg";
import Card6 from "../../assets/icons/himical.svg";
import Bgmini from "../../assets/icons/bgmini.svg";

import "./favorites.scss";

const films = [
  { id: 1, title: "Практики", subtitle: "Ежедневные", imageUrl: Card4 },
  { id: 2, title: "Анонсы", subtitle: "Скоро", imageUrl: Card2 },
  { id: 3, title: "Акции", imageUrl: Card3 },
  { id: 4, title: "Подборки", imageUrl: Card1 },
  { id: 5, title: "Новое", imageUrl: Card5 },
  { id: 6, title: "Хит", imageUrl: Card6 },
];

const music = [
  { id: 11, title: "Lo-Fi", imageUrl: Card1 },
  { id: 12, title: "Ambient", imageUrl: Card2 },
  { id: 13, title: "Focus", imageUrl: Card3 },
];

const meditations = [
  { id: 21, title: "Сон", subtitle: "10 мин", imageUrl: Card5 },
  { id: 22, title: "Антистресс", subtitle: "7 мин", imageUrl: Card4 },
];

const products = [
  { id: 31, title: "Журнал", imageUrl: Card2 },
  { id: 32, title: "Подписка", imageUrl: Card3 },
];

export function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />


      <main className="screen favorites">
        <Title>Избранное</Title>
        <h3 className="fav__sectionTitle">Фильмы</h3>
        <PromoSlider bgSrc={Bgmini} items={films} />
        <h3 className="fav__sectionTitle">Музыка</h3>
        <PromoSlider bgSrc={Bgmini} items={music} />
        <h3 className="fav__sectionTitle">Медитации</h3>
        <PromoSlider bgSrc={Bgmini} items={meditations} />
        <h3 className="fav__sectionTitle">Продукты</h3>
        <PromoSlider bgSrc={Bgmini} items={products} />
        <div className="space-box"></div>
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
