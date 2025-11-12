// src/pages/home/index.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

import {
  useAddBannerViewMutation,
  useGetBannersQuery,
} from '../../shared/api/banners.api';

// Бэкенд-схема (для справки):
// {
//   _id?: string
//   bannerId: number
//   miniatureUrl: string
//   imageUrl: string
//   linkUrl: string | null
//   viewedUsers: number[]
//   endDate: string | null
// }

export default function SupportPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  const { data: banners = [] } = useGetBannersQuery();
  const [addView] = useAddBannerViewMutation();

  const items: MiniCardItem[] = useMemo(() => {
    if (!Array.isArray(banners)) return [];
    return banners.map((b: any): MiniCardItem => {
      // Заголовок считаем на фронте (схема его не хранит)
      const title =
        (b.linkUrl?.startsWith('/') ? b.linkUrl.slice(1) : b.linkUrl)?.replace(/^https?:\/\/(www\.)?/,'') ||
        'Баннер';
      return {
        id: b.bannerId,
        title,
        imageUrl: b.miniatureUrl || b.imageUrl || '',
        rightText: Array.isArray(b.viewedUsers) ? b.viewedUsers.length : undefined,
      };
    });
  }, [banners]);

  const handleCardClick = (it: MiniCardItem) => {
    // отметить просмотр
    addView(it.id as any).catch(() => {});

    // найти исходный баннер, чтобы взять linkUrl
    const src: any = (banners as any[]).find(b => String(b.bannerId) === String(it.id));
    const url: string = src?.linkUrl || '/';

    if (url.startsWith('/')) {
      nav(url);                     // внутренние роуты
    } else {
      window.open(url, '_blank');   // внешние ссылки/телега
    }
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen" style={{ padding: "5px 16px 0px 16px" }}>
        <MiniCardSlider items={items} onItemClick={handleCardClick} />

        <div className="supportPage">
          <div className="supportPage__cards" style={{ gap: "10px" }}>
            <IncomeTile title="Академия духа" showIncome={false} imageUrl={Card1} to="/academy" />

            <FeatureTile
              className="featureTile--noBtn"
              title="Все продукты"
              description=""
              bgImageUrl={Bg2}
              enabled
              rightImageUrl={WhiteImg}
              to="/products"
            />

            <div className="refcardhome" style={{ display: "flex", gap: "11px" }}>
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