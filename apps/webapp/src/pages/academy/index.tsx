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

import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";
import "./academy.scss";
import { useAppNavigate } from '../../shared/lib/hooks/useAppNavigate';

type BNode = {
  tag?: string | null;
  stage?: number | null;
  stageLevel?: number | null;
  progressStatus?: "not_started" | "in_progress" | "completed";
  childrens?: BNode[];
};

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useAppNavigate();

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();

  const spiritRoot: BNode | undefined = useMemo(() => {
    const roots = (data?.data ?? []) as BNode[];
    return roots.find((r) => r.tag === "stages_spirit");
  }, [data]);

  const { totalStages, completedStages } = useMemo(() => {
    const levels = (spiritRoot?.childrens ?? []).filter(
      (n) => n.tag === "stage_level" || typeof n.stageLevel === "number"
    );

    const stages = levels
      .flatMap((lvl) => (lvl.childrens ?? []))
      .filter((s) => s.tag === "stage" || typeof s.stage === "number");

    const total = stages.length;
    const done = stages.filter((s) => s.progressStatus === "completed").length;

    return { totalStages: total, completedStages: done };
  }, [spiritRoot]);

  const desc =
    isLoading
      ? "Загрузка…"
      : isError
        ? "Не удалось загрузить"
        : totalStages > 0
          ? `Пройдено ${completedStages}/${totalStages}`
          : "—";

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <div className="supportPage">
          <Title
            right={
              isError ? (
                <button className="icon-btn" onClick={() => refetch()} aria-label="Обновить" />
              ) : null
            }
          >
            Академия Души
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
                to="/levels"
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
                className={"left-block-color-yellow"}
              />
            </ScrollPanel>
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