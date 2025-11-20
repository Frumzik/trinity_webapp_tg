// pages/workshop/index.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";

import {
  useGetTrainingTreeQuery,
  type LearningNode,
} from "../../shared/api/learning.api";

import Bg1 from "../../assets/homePage/tile1.png";
import Card1 from "../../assets/image/level/genkeys.svg";
import Card2 from "../../assets/image/bg.svg";

import "./workshop.scss";

type BNode = LearningNode & {
  bgUrl?: string | null;
};

type Tile = {
  id: number;
  title: string;
  description: string;
  bgImageUrl: string;
  rightImageUrl: string;
  enabled: boolean;
};

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();

  const roots = (data?.data ?? []) as BNode[];

  const workshopRoot: BNode | undefined = useMemo(
    () => roots.find((r) => r.tag === "knowledge_workshop"),
    [roots]
  );

  const practiseRoot: BNode | undefined = useMemo(
    () => roots.find((r) => r.tag === "practise" || r.type === "practise"),
    [roots]
  );
  const isEnabled = (t: any) => {
    if (t.accessRules?.some((r: any) => r.type === "free")) return true;

    return t.accessStatus === "available";
  };
  const tiles: Tile[] = useMemo(() => {
    if (!workshopRoot) return [];

    return [
      {
        id: workshopRoot.trainingId,
        title: "Генные ключи",
        description:
          workshopRoot.shortDescription || workshopRoot.description || "",
        bgImageUrl: workshopRoot.bgUrl || workshopRoot.coverUrl || Bg1,
        rightImageUrl: workshopRoot.iconUrl || workshopRoot.coverUrl || Card1,
        enabled: true,
      },
    ];
  }, [workshopRoot]);

  const openPreview = (id: number) => {
    navigate("/preview", {
      state: {
        trainingId: id,
        returnTo: "/workshop",
      },
    });
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <div className="supportPage">
          <Title>Мастерская знаний</Title>

          {isLoading && (
            <div style={{ padding: 12, opacity: 0.7 }}>Загрузка…</div>
          )}

          {isError && !isLoading && (
            <div style={{ padding: 12 }}>
              Не удалось загрузить данные.{" "}
              <button onClick={() => refetch()}>Повторить</button>
            </div>
          )}

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
              {!isLoading &&
                !isError &&
                tiles.map((t) => (
                  <FeatureTile
                    key={t.id}
                    title={t.title}
                    bgImageUrl={t.bgImageUrl}
                    rightImageUrl={t.rightImageUrl}
                    enabled={t.enabled}
                    className="left-block-color"
                    onClick={() => t.enabled && openPreview(t.id)}
                  />
                ))}

              {!isLoading && !isError && tiles.length === 0 && (
                <div style={{ padding: 12, opacity: 0.7 }}>
                  Пока нет доступных материалов.
                </div>
              )}
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