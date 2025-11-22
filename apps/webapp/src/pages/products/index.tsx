import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetTrainingTreeQuery,
  useGetCurrentStageQuery,
} from "../../shared/api/learning.api";

import "./products.scss";
import Tile2 from "../../assets/homePage/tile3.png";
import Card5 from "../../assets/products/card6.png";
import Tile1 from "../../assets/homePage/tile1.png";
import Tile3 from "../../assets/homePage/tile2.png";
import Card1 from "../../assets/products/card1.png";
import Card2 from "../../assets/products/card3.png";
import Card3 from "../../assets/products/card2.png";
import Card4 from "../../assets/products/card5.png";

type SpiritNode = {
  tag?: string | null;
  stage?: number | null;
  stageLevel?: number | null;
  progressStatus?: "not_started" | "in_progress" | "completed";
  accessStatus?: "available" | "locked";
  trainingId?: number;
  title?: string | null;
  childrens?: SpiritNode[];
};

const numFromTitle = (t?: string | null) => {
  const m = (t || "").match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetTrainingTreeQuery();
  const {
    data: currentStageRes,
    isLoading: isStageLoading,
  } = useGetCurrentStageQuery();

  const trainings = data?.data?.filter((item) => item.parentId === null) ?? [];

  const isAcademy = (t: any) =>
    t?.type === "stages_spirit" ||
    /Ступени духа/i.test(String(t?.title)) ||
    t?.slug === "academy-spirit";

  const handleClick = (training: any) => {
    if (isAcademy(training)) {
      navigate("/levels"); // <- сразу на страницу уровней
    } else {
      navigate(`/trainings/${training.trainingId}`);
    }
  };

  // корень "Ступени духа"
  const spiritRoot: SpiritNode | undefined = useMemo(() => {
    const roots = (data?.data ?? []) as SpiritNode[];
    return roots.find((r) => r.tag === "stages_spirit");
  }, [data]);

  // считаем по ТЕКУЩЕМУ уровню:
  //   totalStages  – всего ступеней в уровне
  //   lastBought   – номер последней купленной ступени (по stage / числу в title), с нуля
  const { totalStages, lastBought } = useMemo(() => {
    if (!spiritRoot) return { totalStages: 0, lastBought: 0 };

    const levels = (spiritRoot.childrens ?? []).filter(
      (n) => n.tag === "stage_level" || typeof n.stageLevel === "number"
    );

    if (!levels.length) return { totalStages: 0, lastBought: 0 };

    const currentStage = currentStageRes?.data as SpiritNode | undefined;
    let currentLevel: SpiritNode | undefined;

    // пробуем найти уровень по stageLevel
    if (typeof currentStage?.stageLevel === "number") {
      currentLevel = levels.find(
        (lvl) => lvl.stageLevel === currentStage.stageLevel
      );
    }

    // если не нашли — ищем уровень, внутри которого есть текущая ступень
    if (!currentLevel && typeof currentStage?.trainingId === "number") {
      currentLevel = levels.find((lvl) =>
        (lvl.childrens ?? []).some(
          (s) =>
            (s.tag === "stage" || typeof s.stage === "number") &&
            s.trainingId === currentStage.trainingId
        )
      );
    }

    // если всё равно не нашли — берём первый уровень
    if (!currentLevel) currentLevel = levels[0];

    const stages = (currentLevel.childrens ?? []).filter(
      (s) => s.tag === "stage" || typeof s.stage === "number"
    );

    if (!stages.length) return { totalStages: 0, lastBought: 0 };

    // сортируем ступени по stage / числу в заголовке, как на странице уровней
    const sortedStages = [...stages].sort((a, b) => {
      const A =
        typeof a.stage === "number"
          ? a.stage
          : numFromTitle(a.title) ?? 0;
      const B =
        typeof b.stage === "number"
          ? b.stage
          : numFromTitle(b.title) ?? 0;
      return A - B;
    });

    const total = sortedStages.length;

    // "куплена" = не locked (есть доступ / завершена)
    let lastBoughtIdx = 0;
    let hasAnyBought = false;

    for (const s of sortedStages) {
      const idx =
        typeof s.stage === "number"
          ? s.stage
          : numFromTitle(s.title) ?? 0;

      const isBought =
        s.accessStatus === "available" ||
        s.progressStatus === "completed";

      if (isBought) {
        hasAnyBought = true;
        if (idx > lastBoughtIdx) lastBoughtIdx = idx;
      }
    }

    if (!hasAnyBought) {
      // ничего не куплено — отображаем 0
      return { totalStages: total, lastBought: 0 };
    }

    return { totalStages: total, lastBought: lastBoughtIdx };
  }, [spiritRoot, currentStageRes]);

  const descStages =
    isLoading || isStageLoading
      ? "Загрузка…"
      : totalStages > 0
        ? `Пройдено ${lastBought}/${totalStages}`
        : "Пройдено 0/0";

  if (isLoading) {
    return (
      <div className="app">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <main className="screen">
          <div className="supportPage">
            <Title>Все продукты</Title>
            <p style={{ textAlign: "center", marginTop: 40 }}>Загрузка...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="app">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <main className="screen">
          <div className="supportPage">
            <Title>Все продукты</Title>
            <p style={{ textAlign: "center", color: "red", marginTop: 40 }}>
              Ошибка загрузки данных
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <div className="supportPage">
          <Title>Все продукты</Title>

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
              {/*{trainings.map((t) => (*/}
              {/*  <FeatureTile*/}
              {/*    key={t._id}*/}
              {/*    title={t.title}*/}
              {/*    description={t.shortDescription || ""}*/}
              {/*    bgImageUrl={*/}
              {/*      t.type === "stages_spirit"*/}
              {/*        ? Bg1*/}
              {/*        : t.type === "course"*/}
              {/*          ? OrangeBg*/}
              {/*          : Bgblue*/}
              {/*    }*/}
              {/*    rightImageUrl={t.iconUrl || Bg1}*/}
              {/*    enabled={t.accessStatus === "available"}*/}
              {/*    onClick={() => handleClick(t)}*/}
              {/*  />*/}
              {/*))}*/}

              <FeatureTile
                title="Ступени Духа"
                description={descStages}
                bgImageUrl={Tile1}
                rightImageUrl={Card1}
                enabled
                to="/levels?from=/products"
                className={"left-block-color"}
              />

              <FeatureTile
                title="Полезные Материалы"
                description=""
                bgImageUrl={Tile1}
                rightImageUrl={Card2}
                enabled
                to="/materials"
                className={"left-block-color"}
              />

              <FeatureTile
                title="Мастерская Знаний"
                description=""
                bgImageUrl={Tile2}
                rightImageUrl={Card3}
                enabled
                to="/workshop"
                className={"left-block-color"}
              />
              <FeatureTile
                title="Практики"
                description=""
                bgImageUrl={Tile1}
                rightImageUrl={Card4}
                enabled
                to="/practice"
                className={"left-block-color"}
              />
              <FeatureTile
                title="Лаборатория здоровья"
                description=""
                bgImageUrl={Tile3}
                enabled
                rightImageUrl={Card5}
                className="left-block-color"
                to="/health-lab"
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