import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import { useMemo, useState } from "react";

import Card1 from "../../assets/products/card1.png";
import Card2 from "../../assets/products/card2.png";
import Card3 from "../../assets/products/card3.png";
import Tile2 from "../../assets/homePage/tile3.png";
import Tile1 from "../../assets/homePage/tile1.png";
import Tile3 from "../../assets/homePage/tile2.png";

import {
  useGetTrainingTreeQuery,
  useGetCurrentStageQuery,
} from "../../shared/api/learning.api";
import "./academy.scss";
import { useAppNavigate } from "../../shared/lib/hooks/useAppNavigate";

type BNode = {
  tag?: string | null;
  stage?: number | null;
  stageLevel?: number | null;
  progressStatus?: "not_started" | "in_progress" | "completed";
  accessStatus?: "available" | "locked";
  title?: string | null;
  trainingId?: number;
  childrens?: BNode[];
};

const numFromTitle = (t?: string | null) => {
  const m = (t || "").match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useAppNavigate();

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();
  const {
    data: currentStageRes,
    isLoading: isStageLoading,
    isError: isStageError,
  } = useGetCurrentStageQuery();

  const spiritRoot: BNode | undefined = useMemo(() => {
    const roots = (data?.data ?? []) as BNode[];
    return roots.find((r) => r.tag === "stages_spirit");
  }, [data]);

  const { totalStages, lastBought } = useMemo(() => {
    if (!spiritRoot) return { totalStages: 0, lastBought: 0 };

    const levels = (spiritRoot.childrens ?? []).filter(
      (n) => n.tag === "stage_level" || typeof n.stageLevel === "number"
    );

    if (!levels.length) return { totalStages: 0, lastBought: 0 };

    const currentStage = currentStageRes?.data as BNode | undefined;
    let currentLevel: BNode | undefined;

    // попробовать найти уровень по stageLevel
    if (typeof currentStage?.stageLevel === "number") {
      currentLevel = levels.find(
        (lvl) => lvl.stageLevel === currentStage.stageLevel
      );
    }

    // если не нашли — ищем уровень, в котором есть текущая ступень (trainingId)
    if (!currentLevel && typeof currentStage?.trainingId === "number") {
      currentLevel = levels.find((lvl) =>
        (lvl.childrens ?? []).some(
          (s) =>
            (s.tag === "stage" || typeof s.stage === "number") &&
            s.trainingId === currentStage.trainingId
        )
      );
    }

    // вообще ничего не нашли — берем первый уровень
    if (!currentLevel) currentLevel = levels[0];

    const stages = (currentLevel.childrens ?? []).filter(
      (s) => s.tag === "stage" || typeof s.stage === "number"
    );

    if (!stages.length) return { totalStages: 0, lastBought: 0 };

    const sortedStages = [...stages].sort((a, b) => {
      const A =
        typeof a.stage === "number" ? a.stage : numFromTitle(a.title) ?? 0;
      const B =
        typeof b.stage === "number" ? b.stage : numFromTitle(b.title) ?? 0;
      return A - B;
    });

    const total = sortedStages.length;

    let lastBoughtIdx = 0;
    let hasAnyBought = false;

    for (const s of sortedStages) {
      const idx =
        typeof s.stage === "number" ? s.stage : numFromTitle(s.title) ?? 0;

      const isBought =
        s.accessStatus === "available" || s.progressStatus === "completed";

      if (isBought) {
        hasAnyBought = true;
        if (idx > lastBoughtIdx) lastBoughtIdx = idx;
      }
    }

    if (!hasAnyBought) {
      return { totalStages: total, lastBought: 0 };
    }

    return { totalStages: total, lastBought: lastBoughtIdx };
  }, [spiritRoot, currentStageRes]);

  const desc =
    isLoading || isStageLoading
      ? "Загрузка…"
      : isError || isStageError
        ? "Ступени духа"
        : totalStages > 0
          ? `Пройдено ${lastBought}/${totalStages - 1}`
          : "Пройдено 0/0";

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <div className="supportPage">
          <Title
            right={
              isError ? (
                <button
                  className="icon-btn"
                  onClick={() => refetch()}
                  aria-label="Обновить"
                />
              ) : null
            }
          >
            Академия Духа
          </Title>

          <div className="supportPage__cards">
            <ScrollPanel
              maxHeight="62dvh"
              vars={{
                railRight: "-15px",
                railTop: "4px",
                railBottom: "4px",
                railWidth: "3px",
                railColor: "#E8E8E8",
                thumbColor: "#C7C7C7",
                zIndex: 20,
              }}
            >
              <FeatureTile
                title="Ступени Духа"
                description={desc}
                bgImageUrl={Tile1}
                rightImageUrl={Card1}
                enabled
                to="/levels?from=/academy"
                className={"left-block-color"}
              />

              <FeatureTile
                title="Полезные Материалы"
                description=""
                bgImageUrl={Tile3}
                rightImageUrl={Card2}
                enabled
                to="/materials"
                className={"left-block-color-blue"}
              />

              <FeatureTile
                title="Мастерская Знаний"
                description=""
                bgImageUrl={Tile2}
                rightImageUrl={Card3}
                enabled
                to="/workshop"
                className={"left-block-color-yellow"}
              />
            </ScrollPanel>
          </div>
        </div>
      </main>

      <div className="gbtn-bar">
        <div className="gbtn-bar__inner">
          <GradientButton onClick={() => navigate("/home")}>
            Назад
          </GradientButton>
        </div>
      </div>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  );
}