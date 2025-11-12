import { useEffect, useMemo, useState } from 'react';
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

// + иконки для статического списка баннеров
import MiniCard1 from "../../assets/icons/miniCard1.svg";
import MiniCard2 from "../../assets/icons/miniCard2.svg";

import "./home.scss";
import ReferralsCard from "../../widgets/tiles/FriendsTile/FriendsTile";

import {
  useAddBannerViewMutation,
  useGetBannersQuery,
} from '../../shared/api/banners.api';

export default function SupportPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  // --- API ---
  const { data: banners = [] } = useGetBannersQuery();
  const [addView] = useAddBannerViewMutation();

  const STATIC_BANNERS: MiniCardItem[] = useMemo(() => ([
    { id: 1, title: "Дары",                    imageUrl: MiniCard1, rightText: "36" },
    { id: 2, title: "Открылся новый раздел!",  imageUrl: MiniCard2, rightText: "5"  },
    { id: 3, title: "Магазин",                  imageUrl: MiniCard1 },
    { id: 4, title: "Магазин",                  imageUrl: MiniCard2 },
    { id: 5, title: "Магазин",                  imageUrl: MiniCard1 },
    { id: 6, title: "Магазин",                  imageUrl: MiniCard2 },
  ]), []);

  // нормализуем данные с бэка под MiniCardItem
  const apiItems: MiniCardItem[] = useMemo(() => {
    if (!Array.isArray(banners)) return [];
    return banners.map((b: any, i: number): MiniCardItem => ({
      id: b.bannerId ?? b.id ?? i + 1000,
      title: b.title ?? "Баннер",
      imageUrl: b.miniatureUrl || b.imageUrl || MiniCard1,
      rightText: b.rightText ?? undefined,
    }));
  }, [banners]);

  // источник правды для слайдера
  const [sliderItems, setSliderItems] = useState<MiniCardItem[]>(
    apiItems.length ? apiItems : STATIC_BANNERS
  );

  // как только бэк «проснулся» — подменяем статику на реальные данные
  useEffect(() => {
    if (apiItems.length) setSliderItems(apiItems);
  }, [apiItems]);

  // клик по баннеру: отправить просмотр, сдвинуть баннер в конец, перейти по маршруту
  const handleCardClick = (it: MiniCardItem) => {
    // 1) отметить как просмотренный на бэке (если бэк недоступен — просто игнор)
    addView(it.id as any).catch(() => {});

    // 2) локально отправить в конец
    setSliderItems((prev) => {
      const idx = prev.findIndex((x) => String(x.id) === String(it.id));
      if (idx < 0) return prev;
      const next = prev.slice();
      const [picked] = next.splice(idx, 1);
      next.push(picked);
      return next;
    });

    // 3) навигация (демо-роуты)
    const routes: Record<string | number, string> = {
      1: '/gifts',
      2: '/practice',
      3: '/store',
      4: '/store',
      5: '/store',
      6: '/store',
    };
    const path = routes[it.id] ?? '/';
    nav(path);
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen" style={{ padding: "5px 16px 0px 16px" }}>
        <MiniCardSlider items={sliderItems} onItemClick={handleCardClick} />

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