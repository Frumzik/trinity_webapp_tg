import { useMemo, useState } from 'react';

import MiniCardSlider from "../../widgets/card-slider-homePage";
import TopBar from "../../widgets/topbarlk/topbarlk";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";

import Blur from "../../../public/blurs/blur-1.png"
import Card1 from "../../assets/home/card1.png";
import Card2 from "../../assets/home/card2.png";
import Card3 from "../../assets/home/card3.png";
import Card4 from "../../assets/home/card4.png";
import Card5 from "../../assets/home/card5.png";
import Tile1 from "../../assets/homePage/tile1.png";
import Tile2 from "../../assets/homePage/tile2.png";

import "./home.scss";
import ReferralsCard from "../../widgets/tiles/FriendsTile/FriendsTile";

import {
  useAddBannerViewMutation,
  useGetBannersQuery,
} from '../../shared/api/banners.api';

import {
  useGetTrainingTreeQuery,
  useGetCurrentStageQuery
} from "../../shared/api/learning.api";
import { useAppNavigate } from '../../shared/lib/hooks/useAppNavigate';

type BNode = {
  _id: string;
  trainingId: number;
  type: "training" | "product" | "practise";
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
  parentId?: number | null;
  childrens?: BNode[];
  lessons?: any[];
};

const numFromTitle = (t?: string) => {
  const m = (t || "").match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

export default function SupportPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useAppNavigate();

  const { data: banners = [] } = useGetBannersQuery();
  const [addView] = useAddBannerViewMutation();

  const { data: tree } = useGetTrainingTreeQuery();
  const { data: currentStageRes } = useGetCurrentStageQuery();

  const allNodes = useMemo(() => {
    return (tree?.data ?? []) as BNode[];
  }, [tree]);

  const stagesRoot = useMemo(() => {
    return allNodes.find(
      (r) => r.tag === "stages_spirit" && r.parentId == null
    );
  }, [allNodes]);

  // 🔹 Корневой узел Лаборатории Здоровья (trainingId 30)
  const healthLabRoot = useMemo(() => {
    return allNodes.find(
      (r) => r.tag === "health_lab" && r.parentId == null
    );
  }, [allNodes]);

  const fallbackStageLabel = useMemo(() => {
    const root = stagesRoot;
    if (!root) return undefined;

    const levelNodes = allNodes
      .filter(
        (n) =>
          (n.tag === "stage_level" || typeof n.stageLevel === "number") &&
          n.parentId === root.trainingId
      );

    if (!levelNodes.length) return undefined;

    levelNodes.sort((a, b) => {
      const A = a.stageLevel ?? numFromTitle(a.title) ?? 0;
      const B = b.stageLevel ?? numFromTitle(b.title) ?? 0;
      return A - B;
    });

    for (const lvl of levelNodes) {
      const levelIndex = lvl.stageLevel ?? numFromTitle(lvl.title);

      const stages = allNodes.filter(
        (s) =>
          (s.tag === "stage" || typeof s.stage === "number") &&
          s.parentId === lvl.trainingId
      );

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

    const lastLevel = levelNodes[levelNodes.length - 1];

    const lastStages = allNodes.filter(
      (s) =>
        (s.tag === "stage" || typeof s.stage === "number") &&
        s.parentId === lastLevel.trainingId
    );

    if (!lastStages.length) return undefined;

    lastStages.sort((a, b) => {
      const A = a.stage ?? numFromTitle(a.title) ?? 0;
      const B = b.stage ?? numFromTitle(b.title) ?? 0;
      return A - B;
    });

    const lastStage = lastStages[lastStages.length - 1];
    const stageIndex =
      lastStage.stage ?? numFromTitle(lastStage.title) ?? lastStages.length;

    return `${stageIndex} ступень`;
  }, [stagesRoot, allNodes]);

  const currentStageLabel = useMemo(() => {
    const node = currentStageRes?.data;
    if (node) {
      if (typeof node.stage === "number") return `${node.stage} ступень`;
      const n = numFromTitle(node.title);
      if (n) return `${n} ступень`;
    }
    return fallbackStageLabel;
  }, [currentStageRes, fallbackStageLabel]);

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

  const handleHealthLabClick = () => {
    const lab = healthLabRoot;
    if (!lab) {
      nav("/health-lab");
      return;
    }

    if (lab.accessStatus === "available") {
      nav("/health-lab");
    } else {
      nav("/preview", {
        state: {
          trainingId: lab.trainingId,
          returnTo: "/health-lab",
        },
      });
    }
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <img src={Blur} className={"blur"} alt="" />
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen" style={{ padding: "5px 16px 0px 16px" }}>
        <MiniCardSlider items={banners} onItemClick={handleCardClick} />

        <div className="supportPage" style={{ marginTop: 10 }}>
          <div className="supportPage__cards" style={{ gap: "10px" }}>
            <FeatureTile
              title="Академия Духа"
              description=""
              bgImageUrl={Tile1}
              rightImageUrl={Card1}
              className="featureTile--altFont"
              enabled
              to="/academy"
            />
            <FeatureTile
              title="Все Продукты"
              description=""
              bgImageUrl={Tile2}
              enabled
              rightImageUrl={Card2}
              className="featureTile--altFont"
              to="/products"
            />

            <div className="refcardhome" style={{ display: "flex", gap: "11px" }}>
              <ReferralsCard
                imageUrl={Card4}
                titleTop="Пройти Практику"
                labelBottom="Перейти"
                href="/practice"
                className="refCard--imgRight refCard--166x123 "
                background="none"
              />
              <ReferralsCard
                imageUrl={Card3}
                titleTop="Ступени Духа"
                labelBottom={currentStageLabel || "Ступени Духа"}
                href="/levels?from=/home"
                className="refCard--imgRight refCard--166x123 "
                background="none"
              />
            </div>

            <FeatureTile
              title="Лаборатория Здоровья"
              description=""
              bgImageUrl={Tile2}
              enabled={false}
              rightImageUrl={Card5}
              className="featureTile--altFont"
              onClick={handleHealthLabClick}
            />
          </div>
        </div>
      </main>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  );
}