import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";

import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Bg1 from "../../assets/icons/bg1.svg";
import Card1 from "../../assets/icons/products/card1.svg";
import Card2 from "../../assets/icons/products/card2.svg";

import "./health-lab.scss";
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
  childrens?: Node[];
};

const iconFallback = (i: number) => [Card1, Card2][i % 2];

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();

  // все корневые
  const roots = useMemo(() => {
    const all = (data?.data ?? []) as Node[];
    return all.filter((n) => n.parent == null);
  }, [data]);

  // сам раздел «Лаборатория здоровья»
  const healthLab = useMemo(() => {
    return (
      roots.find((r) => r.type === "health_lab") ||
      roots.find((r) => r.title?.trim().toLowerCase() === "лаборатория здоровья")
    );
  }, [roots]);

  const items = healthLab?.childrens ?? [];

  const openItem = (t: Node, idx: number) => {
    if (t.accessStatus === "available") {
      navigate(`/trainings/${t.trainingId}`, { state: { returnTo: location.pathname } });
    } else {
      navigate("/preview", {
        state: {
          trainingId: t.trainingId,
          title: t.title,
          description: t.shortDescription || t.description || "",
          coverUrl: t.coverUrl,
          price: t.salePrice ?? t.price ?? 0,
          bg: Bg1,
          icon: t.iconUrl || iconFallback(idx),
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
          <Title>Лаборатория здоровья</Title>

          {isLoading && <div style={{ padding: 16 }}>Загрузка…</div>}
          {isError && (
            <div style={{ padding: 16 }}>
              Не удалось загрузить. <button onClick={() => refetch()}>Повторить</button>
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
                {items.map((t, idx) => (
                  <FeatureTile
                    key={t._id}
                    title={t.title}
                    description={t.shortDescription || t.description || ""}
                    bgImageUrl={Bg1}
                    rightImageUrl={t.iconUrl || t.coverUrl || iconFallback(idx)}
                    enabled
                    onClick={() => openItem(t, idx)}
                  />
                ))}

                {items.length === 0 && (
                  <div style={{ padding: 16, opacity: 0.7 }}>
                    Раздел пуст или не найден. Добавьте в бэке корневой тренинг
                    с type="health_lab" (или названием «Лаборатория здоровья») и его дочерние элементы.
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