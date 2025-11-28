import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import PromoTile from "../../widgets/promo-tile";

import Bgmini from "../../assets/homePage/miniTile.svg";
import CardImage1 from "../../assets/homePage/minicard1.svg";
import CardImage2 from "../../assets/homePage/minicard2.svg";
import CardImage3 from "../../assets/homePage/minicard3.svg";
import "./materials.scss";

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const staticMaterials = [
    {
      key: "movies",
      title: "Фильмы",
      description: "Подборка фильмов для вдохновения и развития.",
    },
    {
      key: "music",
      title: "Музыка",
      description: "Музыкальные треки и плейлисты для практик и отдыха.",
    },
    {
      key: "books",
      title: "Книги",
      description: "Рекомендованные книги для осознанности и роста.",
    },
  ];

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen favorites">
        <Title>Полезные материалы</Title>

        <div className="promo-container">

            <PromoTile
              title={"Фильмы"}
              bgSrc={Bgmini}
              imageUrl={CardImage1}
              to="/films"
            />
          <PromoTile
            title={"Музыка"}
            bgSrc={Bgmini}
            imageUrl={CardImage2}
            href="https://t.me/trinity_music"
          />
          <PromoTile
            title={"Книги"}
            bgSrc={Bgmini}
            imageUrl={CardImage3}
            href="https://t.me/trinity_books"
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