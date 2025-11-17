import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MiniCardSlider from "../../widgets/card-slider-homePage";
import TopBar from "../../widgets/topbarlk/topbarlk";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";

import Blur from "../../../public/blurs/blur-1.png"
import Card1 from "../../assets/homePage/card1.svg";
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

import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

type BNode = {
  _id: string;
  trainingId: number;
  type: "training" | "product";
  tag?: string | null;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  duration?: string | null;
  coverUrl?: string | null;
  iconUrl?: string | null;
  accessStatus: "available" | "locked";
  progressStatus: "not_started" | "in_progress" | "completed";
  price?: number | null;
  salePrice?: number | null;
  stage?: number | null;
  stageLevel?: number | null;
  childrens?: BNode[];
  lessons?: any[];
};

const numFromTitle = (t?: string) => {
  const m = (t || "").match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

export default function SupportPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  const { data: banners = [] } = useGetBannersQuery();
  const [addView] = useAddBannerViewMutation();

  const { data: tree } = useGetTrainingTreeQuery();
  const stagesRoot: BNode | undefined = useMemo(() => {
    const roots = (tree?.data ?? []) as BNode[];
    return roots.find((r) => r.tag === "stages_spirit");
  }, [tree]);

  const currentStageLabel = useMemo(() => {
    const root = stagesRoot;
    if (!root) return undefined;

    const levelNodes = (root.childrens ?? [])
      .filter((n) => n.tag === "stage_level" || typeof n.stageLevel === "number") as BNode[];

    if (!levelNodes.length) return undefined;

    levelNodes.sort((a, b) => {
      const A = a.stageLevel ?? numFromTitle(a.title) ?? 0;
      const B = b.stageLevel ?? numFromTitle(b.title) ?? 0;
      return A - B;
    });

    for (const lvl of levelNodes) {
      const levelIndex = lvl.stageLevel ?? numFromTitle(lvl.title);
      const stages = (lvl.childrens ?? [])
        .filter((s) => s.tag === "stage" || typeof s.stage === "number") as BNode[];

      stages.sort((a, b) => {
        const A = a.stage ?? numFromTitle(a.title) ?? 0;
        const B = b.stage ?? numFromTitle(b.title) ?? 0;
        return A - B;
      });

      for (const st of stages) {
        const done = st.progressStatus === "completed";
        if (!done) {
          const stageIndex = st.stage ?? numFromTitle(st.title);
          if (levelIndex && stageIndex) {
            return `${stageIndex} ступень`;
          }
        }
      }
    }

    // если все ступени завершены – показываем последнюю
    const lastLevel = levelNodes[levelNodes.length - 1];
    const levelIndex = lastLevel.stageLevel ?? numFromTitle(lastLevel.title) ?? levelNodes.length;
    const lastStages = (lastLevel.childrens ?? [])
      .filter((s) => s.tag === "stage" || typeof s.stage === "number") as BNode[];

    if (!lastStages.length) return undefined;
    lastStages.sort((a, b) => {
      const A = a.stage ?? numFromTitle(a.title) ?? 0;
      const B = b.stage ?? numFromTitle(b.title) ?? 0;
      return A - B;
    });
    const lastStage = lastStages[lastStages.length - 1];
    const stageIndex = lastStage.stage ?? numFromTitle(lastStage.title) ?? lastStages.length;

    return `${levelIndex} ур / ${stageIndex} ступень`;
  }, [stagesRoot]);

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
              title="Академия Души"
              description=""
              bgImageUrl={Tile1}
              rightImageUrl={Card1}
              className="featureTile--altFont"
              enabled
              to="/academy"
            />
            <FeatureTile
              title="Все продукты"
              description=""
              bgImageUrl={Tile2}
              enabled
              rightImageUrl={Card2}
              className="featureTile--altFont"
              to="/products"
            />

            <div className="refcardhome" style={{ display: "flex", gap: "11px" }}>
              <ReferralsCard
                imageUrl={Card3}
                titleTop="Пройти Практику"
                labelBottom="Перейти"
                href="/practice"
                className="refCard--imgRight refCard--166x123"
                background="rgba(255, 255, 255, 0.3)"
              />
              <ReferralsCard
                imageUrl={Card4}
                titleTop="Ступени Духа"
                labelBottom={currentStageLabel || "Ступени Духа"}
                href="/levels"
                className="refCard--imgRight refCard--166x123"
                background="rgba(255, 255, 255, 0.3)"
              />
            </div>

            <FeatureTile
              title="Лаборатория здоровья"
              description=""
              bgImageUrl={Tile2}
              enabled
              rightImageUrl={Card5}
              className="featureTile--altFont"
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