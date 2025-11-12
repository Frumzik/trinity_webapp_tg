// src/pages/favorites/index.tsx
import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import PromoSlider from "../../widgets/card-slider-favoritesPage";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bgmini from "../../assets/icons/bgmini.svg";
import CardFallback1 from "../../assets/icons/products/card1.svg";
import CardFallback2 from "../../assets/icons/products/card2.svg";
import CardFallback3 from "../../assets/icons/products/card3.svg";
import "./favorites.scss";
import { useGetFavoritesQuery } from "../../shared/api/favorites.api";

type SliderItem = {
  id: string | number;
  title: string;
  imageUrl?: string;
  onClick?: () => void;
};

const TITLE_BY_KIND: Record<string, string> = {
  video: "Фильмы",
  audio: "Музыка",
  text: "Медитации",
  training: "Продукты",
};
const ORDER = ["video", "audio", "text", "training"];

export function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetFavoritesQuery({ populate: true });

  const sections = useMemo(() => {
    const fallbacks = [CardFallback1, CardFallback2, CardFallback3];
    const cats = data ?? [];
    const grouped: Record<string, SliderItem[]> = {};

    cats.forEach((c, ci) => {
      (c.favorites ?? []).forEach((f, fi) => {
        const tr = f.training || f.lesson?.training || null;
        const img =
          f.training?.coverUrl ||
          f.training?.iconUrl ||
          f.lesson?.coverUrl ||
          fallbacks[(ci + fi) % 3];

        if (f.type === "Lesson" && f.lessonId && f.trainingId) {
          const lessonType = String(f.lesson?.type || "").toLowerCase();
          const key = lessonType || "text";
          const item: SliderItem = {
            id: f.lessonId,
            title: f.lesson?.title || "Урок",
            imageUrl: img,
            onClick: () => {
              if (lessonType === "audio") {
                const q = [
                  {
                    id: f.lessonId!,
                    title: f.lesson?.title || "Урок",
                    subtitle: f.lesson?.duration || undefined,
                    artworkUrl: img,
                    mediaUrl: undefined as string | undefined,
                  },
                ];
                navigate("/player", {
                  state: { queue: q, index: 0, trainingId: f.trainingId!, returnTo: "/favorites" },
                });
              } else {
                navigate(`/lesson/${f.trainingId!}/${f.lessonId!}`, { state: { returnTo: "/favorites" } });
              }
            },
          };
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        } else if (f.type === "Training" && f.trainingId) {
          const key = "training";
          const item: SliderItem = {
            id: f.trainingId,
            title: tr?.title || "Тренинг",
            imageUrl: img,
            onClick: () => navigate(`/trainings/${f.trainingId!}`, { state: { returnTo: "/favorites" } }),
          };
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        }
      });
    });

    return ORDER.filter((k) => grouped[k]?.length).map((k) => ({
      key: k,
      title: TITLE_BY_KIND[k] || "Избранное",
      items: grouped[k],
    }));
  }, [data, navigate]);

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />
      <main className="screen favorites">
        <Title>Избранное</Title>

        {isLoading && <div className="promo-container">Загрузка…</div>}
        {isError && (
          <div className="promo-container">
            Не удалось загрузить. <button onClick={() => refetch()}>Повторить</button>
          </div>
        )}

        {!isLoading && !isError && sections.length === 0 && (
          <div className="promo-container" style={{ opacity: 0.7 }}>Пока пусто</div>
        )}

        {!isLoading &&
          !isError &&
          sections.map((s) => (
            <div key={s.key}>
              <h3 className="fav__sectionTitle">{s.title}</h3>
              <PromoSlider bgSrc={Bgmini} items={s.items} />
            </div>
          ))}

        <div className="space-box" />
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