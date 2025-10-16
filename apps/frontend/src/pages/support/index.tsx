import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import GreyTile from "../../widgets/tiles/GreyTile/GreyTile.tsx";
import TopBar from "../../widgets/topbar/topbar.tsx";
import Footer from "../../widgets/footer/footer.tsx";
import BurgerMenu from "../../widgets/menuBurger/burger.tsx";
import ChannelImg from "../../assets/icons/chanelTile.svg";
import ChatImg from "../../assets/icons/chatTile.svg";
import SupportImg from "../../assets/icons/supportTile.svg";

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
          <Title>Поддержка</Title>

          <div className="supportPage__cards">
            <GreyTile
              title="О проекте"
              imageUrl={ChannelImg}
              buttonText={"Перейти"}
              href="#"
              buttonStyle={{ width: "78px" }}
            />
            <GreyTile
              title="Чат"
              imageUrl={ChatImg}
              buttonText={"Перейти"}
              href="#"
              buttonStyle={{ width: "78px" }}
            />
            <GreyTile
              title={
                <>
                  Связаться
                  <br />с поддержкой
                </>
              }
              buttonText={"Перейти"}
              imageUrl={SupportImg}
              href="#"
              style={{ height: "110px" }}
              buttonStyle={{ width: "78px" }}
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
