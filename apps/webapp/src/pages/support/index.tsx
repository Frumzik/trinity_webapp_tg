import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import GreyTile from "../../widgets/tiles/GreyTile/GreyTile";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import ChannelImg from "../../assets/homePage/tile4.png";
import ChatImg from "../../assets/homePage/tile6.png";
import SupportImg from "../../assets/homePage/tile5.png";

import "./support.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SupportPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />
      <main className="screen">
        <div className="supportPage">
          <Title>Наши Официальные Ресурсы</Title>

          <div className="supportPage__cards">
            <GreyTile
              title="Информационный Канал"
              imageUrl={ChannelImg}
              buttonText={"Перейти"}
              href="https://t.me/trinity_channel"
              style={{ height: "115px" }}
              buttonStyle={{ width: "78px" }}
            />
            <GreyTile
              title="Чат Сообщества"
              imageUrl={ChatImg}
              buttonText={"Перейти"}
              href="https://t.me/trinity_space"
              style={{ height: "115px" }}
              buttonStyle={{ width: "78px" }}
            />
            <GreyTile
              title={
                <>
                  Помощь и Поддержка
                </>
              }
              buttonText={"Перейти"}
              imageUrl={SupportImg}
              href="https://t.me/trinity_light"
              style={{ height: "115px" }}
              buttonStyle={{ width: "78px", position: "absolute", bottom:"8px", left: "16px" }}
            />
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
