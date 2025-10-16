import { useState } from "react";

import MiniCardSlider, { type MiniCardItem } from "../../widgets/card-slider-homePage";
import TopBar from "../../widgets/topbarlk/topbarlk";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import IncomeTile from "../../widgets/tiles/MoneyTile/Income";
import FeatureTile from "../../widgets/tiles/FeatureTile";

import Bg2 from "../../assets/icons/bgblue.svg";
import HimicalImg from "../../assets/icons/himical.svg";
import WhiteImg from "../../assets/icons/WhiteImg.svg";
import Card1 from "../../assets/image/image_3.png";
import Card2 from "../../assets/image/image_4.svg";
import Card3 from "../../assets/icons/products/cardHeadphone.svg";

import "./home.scss";
import ReferralsCard from "../../widgets/tiles/FriendsTile/FriendsTile";
import {useNavigate} from "react-router-dom";

export default function SupportPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate()
    const handleCardClick = (it: MiniCardItem) => {
        const routes: Record<string | number, string> = {
            1: '/gifts',
            2: '/news',
            3: '/announcements',
        }
        const path = routes[it.id] ?? '/'
        nav(path)
    }
  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen" style={{ padding: "5px 16px 0px 16px" }}>
        <MiniCardSlider onItemClick={handleCardClick} />
        <div className="supportPage">
          <div className="supportPage__cards" style={{ gap: "10px" }}>
            <IncomeTile
              title="Академия духа"
              showIncome={false}
              imageUrl={Card1}
              to="/academy"
            />
            <FeatureTile
              className="featureTile--noBtn"
              title="Все продукты"
              description=""
              bgImageUrl={Bg2}
              enabled
              rightImageUrl={WhiteImg}
              onOpen={undefined}
              to="/products"
            />

            <div
              className="refcardhome"
              style={{ display: "flex", gap: "11px" }}
            >
              <ReferralsCard
                imageUrl={Card2}
                titleTop="Пройти практику"
                labelBottom=""
                count={4}
                href="/practice"
                className="refCard--imgRight refCard--166x123"
              />
              <ReferralsCard
                imageUrl={Card3}
                titleTop="Ступени духа"
                labelBottom="2 ступень"
                href="/levels"
                className="refCard--imgRight refCard--166x123"
              />
            </div>
            <FeatureTile
              title="Лаборатория здоровья"
              description=""
              bgImageUrl={Bg2}
              enabled
              rightImageUrl={HimicalImg}
              onOpen={undefined}
              to="/health-lab"
            />
          </div>
        </div>
      </main>
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  );
}
