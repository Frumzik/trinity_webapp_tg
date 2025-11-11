import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";

import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Bg1 from "../../assets/icons/bg1.svg";
import OrangeBg from "../../assets/image/Differentbg/orangeBg.svg";
import Card1 from "../../assets/icons/products/card9.svg";
import Card2 from "../../assets/icons/products/card10.svg";
import Card3 from "../../assets/icons/products/card11.svg";

import "./practise.scss";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";

// API
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

type Node = {
  _id: string;
  trainingId: number;
  type: string;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  coverUrl?: string | null;
  iconUrl?: string | null;
  accessStatus: "available" | "locked";
  price?: number | null;
  salePrice?: number | null;
  parent?: string | null;
};

const pickBg = (t?: string) => (t === "course" ? OrangeBg : Bg1);
const pickIconFallback = (idx: number) => [Card1, Card2, Card3][idx % 3];

// какие типы считаем «практиками»
const PRACTICE_TYPES = new Set(["practice", "course",]);

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();

  // корневые узлы
  const roots = useMemo(() => {
    const all = (data?.data ?? []) as Node[];
    return all.filter((n) => n.parent == null);
  }, [data]);

  // практики: фильтр по типам, дедуп по trainingId, сортировка по заголовку
  const practices = useMemo(() => {
    const only = roots.filter((r) => PRACTICE_TYPES.has(r.type));
    const map = new Map<number, Node>();
    for (const n of only) if (!map.has(n.trainingId)) map.set(n.trainingId, n);
    return [...map.values()].sort((a, b) =>
      a.title.localeCompare(b.title, "ru")
    );
  }, [roots]);

  const onOpenPractice = (t: Node, idx: number) => {
    if (t.accessStatus === "available") {
      navigate(`/trainings/${t.trainingId}`, {
        state: { returnTo: location.pathname },
      });
    } else {
      navigate("/preview", {
        state: {
          trainingId: t.trainingId,
          title: t.title,
          description: t.shortDescription || t.description || "",
          coverUrl: t.coverUrl,
          price: t.salePrice ?? t.price ?? 0,
          bg: pickBg(t.type),
          icon: t.iconUrl || pickIconFallback(idx),
          returnTo: location.pathname,
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

          {isLoading && <div style={{ padding: 16 }}>Загрузка…</div>}
          {isError && (
            <div style={{ padding: 16 }}>
              Не удалось загрузить.{" "}
              <button onClick={() => refetch()}>Повторить</button>
            </div>
          )}

          {!isLoading && !isError && (
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
                {practices.map((t, idx) => (
                  <FeatureTile
                    key={t._id}
                    title={t.title}
                    description={t.shortDescription || t.description || ""}
                    bgImageUrl={pickBg(t.type)}
                    rightImageUrl={t.iconUrl || t.coverUrl || pickIconFallback(idx)}
                    enabled={true} // карточка кликабельна всегда — доступ решаем внутри onOpenPractice
                    onClick={() => onOpenPractice(t, idx)}
                  />
                ))}

                {practices.length === 0 && (
                  <div style={{ padding: 16, opacity: 0.7 }}>
                    Пока нет практик
                  </div>
                )}
              </ScrollPanel>
            </div>
          )}
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