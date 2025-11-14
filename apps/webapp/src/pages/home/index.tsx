import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MiniCardSlider from "../../widgets/card-slider-homePage";
import TopBar from "../../widgets/topbarlk/topbarlk";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";

import Blur from "../../../public/blurs/blur-1.png"
import Card1 from "../../assets/homePage/";
import Card2 from "../../assets/homePage/card2.svg";
import Card3 from "../../assets/homePage/card3.svg";
import Card4 from "../../assets/homePage/card4.svg";
import Card5 from "../../assets/homePage/card5.svg";
import Tile1 from "../../assets/homePage/tile1.svg";
import Tile2 from "../../assets/homePage/tile2.svg";

import "./home.scss";
import ReferralsCard from "../../widgets/tiles/FriendsTile/FriendsTile";

import {
  useAddBannerViewMutation,
  useGetBannersQuery,
} from '../../shared/api/banners.api';

export default function SupportPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  const { data: banners = [] } = useGetBannersQuery();
  const [addView] = useAddBannerViewMutation();

  const handleCardClick = (it: { id: string | number }) => {
    const src = banners.find(b => String(b.id) === String(it.id));
    if (!src) return;

    const idNum = Number(src.id);
    if (Number.isFinite(idNum)) addView(idNum as any).catch(() => {});

    const url = (src.linkUrl || '').trim();
    if (!url) return;

    if (/^(https?:)?\/\//i.test(url)) {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg?.openLink) tg.openLink(url);
      else window.open(url, '_blank');
      return;
    }

    const path = url.startsWith('/') ? url : `/${url}`;
    nav(path);
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <img src={Blur} className={"blur"} alt="" />
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen" style={{ padding: "5px 16px 0px 16px" }}>
        <MiniCardSlider items={banners} onItemClick={handleCardClick} />

        <div className="supportPage" style={{marginTop:10}}>
          <div className="supportPage__cards" style={{ gap: "10px" }}>
            <FeatureTile
              title="Академия духа"
              description=""
              bgImageUrl={Tile1}
              rightImageUrl={Card5}
              enabled
              to="/academy"
            />
            <FeatureTile
              // className="featureTile--noBtn"
              title="Все продукты"
              description=""
              bgImageUrl={Tile2}
              enabled
              rightImageUrl={Card4}
              to="/products"
            />

            <div className="refcardhome" style={{ display: "flex", gap: "11px" }}>
              <ReferralsCard
                imageUrl={Card1}
                titleTop="Пройти практику"
                labelBottom="Перейти"
                href="/practice"
                className="refCard--imgRight refCard--166x123"
              />
              <ReferralsCard
                imageUrl={Card2}
                titleTop="Ступени духа"
                labelBottom="2 ступень"
                href="/levels"
                className="refCard--imgRight refCard--166x123"
              />
            </div>

            <FeatureTile
              title="Лаборатория здоровья"
              description=""
              bgImageUrl={Tile2}
              enabled
              rightImageUrl={Card3}
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