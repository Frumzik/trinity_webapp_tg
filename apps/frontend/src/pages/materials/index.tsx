import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import PromoTile from "../../widgets/promo-tile";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Bgmini from "../../assets/icons/bgmini.svg";
import CardImage from "../../assets/image/level/card5.svg";
import "./materials.scss";
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

type LearningNode = {
  _id: string;
  trainingId: number | string;
  type: "training" | "product";
  tag?: string | null;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  coverUrl?: string | null;
  iconUrl?: string | null;
};

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetTrainingTreeQuery();

  const materials: LearningNode[] = useMemo(() => {
    const all = (data?.data ?? []) as LearningNode[];
    return all.filter((n) => n.tag === "userful_materials");
  }, [data]);

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen favorites">
        <Title>Полезные материалы</Title>

        {isLoading && <div className="promo-container">Загрузка…</div>}

        {isError && (
          <div className="promo-container" style={{ color: "var(--danger)" }}>
            {(error as any)?.data?.message ?? "Не удалось загрузить данные"}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="promo-container">
            {materials.map((it) => {
              const desc = (it.shortDescription ?? it.description ?? "").trim();
              return (
                <PromoTile
                  key={it._id}
                  title={it.title}
                  description={desc}
                  subtitle={desc}
                  bgSrc={Bgmini}
                  imageUrl={it.coverUrl || it.iconUrl || CardImage}
                  to={`/trainings/${it.trainingId}`}
                />
              );
            })}
            {materials.length === 0 && (
              <div style={{ opacity: 0.7 }}>Материалы пока пусты</div>
            )}
          </div>
        )}
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