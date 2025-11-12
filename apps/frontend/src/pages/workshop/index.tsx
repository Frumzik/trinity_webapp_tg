import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";

import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

import Bg1 from "../../assets/icons/bg1.svg";
import Card1 from "../../assets/image/level/genkeys.svg";

import "./workshop.scss";

type BNode = {
  _id: string;
  trainingId: number;
  type: string;
  title: string;
  description?: string | null;
  duration?: string | null;
  coverUrl?: string | null;
  accessStatus: "available" | "locked";
  progressStatus: "not_started" | "in_progress" | "completed";
  price?: number | null;
  salePrice?: number | null;
  childrens?: BNode[];
  lessons?: any[];
};

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();

  const workshopRoot: BNode | undefined = useMemo(() => {
    const roots = (data?.data ?? []) as BNode[];
    const byType =
      roots.find((r) => r.type === "workshop") ||
      roots.find((r) => r.type === "knowledge_workshop");
    if (byType) return byType;
    return roots.find((r) =>
      (r.title || "").toLowerCase().includes("мастерская")
    );
  }, [data]);

  const tiles = useMemo(() => {
    const items = (workshopRoot?.childrens ?? []) as BNode[];
    return items.map((n) => ({
      id: n.trainingId,
      title: n.title,
      description: n.description ?? "",
      coverUrl: n.coverUrl ?? undefined,
      enabled: n.accessStatus !== "locked",
    }));
  }, [workshopRoot]);

  const openCourse = (id: number) => {
    navigate(`/trainings/${id}`);
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
          {isError && (
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
              {tiles.length === 0 && !isLoading && !isError && (
                <FeatureTile
                  title="Курс: Генные ключи"
                  description=""
                  bgImageUrl={Bg1}
                  rightImageUrl={Card1}
                  enabled
                />
              )}

              {tiles.map((t) => (
                <FeatureTile
                  key={t.id}
                  title={t.title}
                  description={t.description}
                  bgImageUrl={Bg1}
                  rightImageUrl={t.coverUrl || Card1}
                  enabled={t.enabled}
                  onClick={() => t.enabled && openCourse(t.id)}
                />
              ))}
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