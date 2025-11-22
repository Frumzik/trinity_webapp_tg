// pages/practise/index.tsx
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";

import Card1 from "../../assets/homePage/tile1.png";
import Card5 from "../../assets/homePage/tile3.png";
import Card2 from "../../assets/products/card10.png";
import Card3 from "../../assets/products/card11.png";
import Card4 from "../../assets/products/card9.png";

import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

import "./practise.scss";

type TrainingNode = {
  trainingId: number;
  type: string;
  tag?: string;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  coverUrl?: string | null;
  iconUrl?: string | null;
  childrens?: TrainingNode[];
  parentId?: number | null;
  accessStatus?: "available" | "locked"; // добавили, чтобы проверять доступ к Лабе
};

// конфиг только для картинок/классов, верстку не трогаем
const PRACTICE_TILES_CONFIG: Record<
  number,
  { bgImageUrl: string; rightImageUrl: string; className: string }
> = {
  40: {
    bgImageUrl: Card1,
    rightImageUrl: Card2,
    className: "left-block-big left-block-color",
  },
  41: {
    bgImageUrl: Card1,
    rightImageUrl: Card4,
    className: "left-block-big left-block-color",
  },
  42: {
    bgImageUrl: Card1,
    rightImageUrl: Card3,
    className: "left-block-big left-block-color",
  },
};

export default function PractisePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // тянем ВСЕ тренинги (как в большом JSON)
  const { data, isLoading, isError } = useGetTrainingTreeQuery(undefined) as {
    data?: { data: TrainingNode[] };
    isLoading: boolean;
    isError: boolean;
  };

  const allNodes = useMemo(() => data?.data ?? [], [data]);

  // ищем в списке ноду "Практики" (type: "practise")
  const practices = useMemo(() => {
    const root = allNodes.find(
      (item) => item.type === "practise" && item.tag === "practise"
    );
    return root?.childrens ?? [];
  }, [allNodes]);

  // корневая нода "Лаборатория Здоровья"
  const healthLabRoot = useMemo(() => {
    return allNodes.find(
      (item) => item.tag === "health_lab" && item.parentId == null
    );
  }, [allNodes]);

  const openPractice = (trainingId: number) => {
    navigate("/preview", {
      state: {
        trainingId,
        returnTo: location.pathname,
      },
    });
  };

  const handleHealthLabClick = () => {
    const lab = healthLabRoot;

    if (!lab) {
      navigate("/health-lab");
      return;
    }

    if (lab.accessStatus === "available") {
      navigate(`/trainings/${lab.trainingId}`, {
        state: { returnTo: location.pathname },
      });
    } else {
      navigate("/preview", {
        state: {
          trainingId: lab.trainingId,
          returnTo: `/trainings/${lab.trainingId}`,
        },
      });
    }
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <div className="supportPage">
          <Title>Практики</Title>

          <div className="supportPage__cards">
            {isLoading && (
              <p style={{ padding: 16, textAlign: "center" }}>
                Загрузка практик…
              </p>
            )}

            {isError && !isLoading && (
              <p style={{ padding: 16, textAlign: "center", color: "red" }}>
                Не удалось загрузить практики. Попробуй позже.
              </p>
            )}

            {!isLoading && !isError && (
              <>
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
                  {practices.map((p) => {
                    const cfg = PRACTICE_TILES_CONFIG[p.trainingId];

                    if (!cfg) return null;

                    return (
                      <FeatureTile
                        key={p.trainingId}
                        title={p.title}
                        bgImageUrl={cfg.bgImageUrl}
                        rightImageUrl={cfg.rightImageUrl}
                        enabled
                        onClick={() => openPractice(p.trainingId)}
                        className={cfg.className}
                      />
                    );
                  })}
                </ScrollPanel>

                <FeatureTile
                  title="Лаборатория Здоровья"
                  description=""
                  bgImageUrl={Card1}
                  rightImageUrl={Card5}
                  enabled
                  className="left-block-big left-block-color"
                  onClick={handleHealthLabClick}
                />
              </>
            )}
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