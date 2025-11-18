import { useMemo, useState } from "react";

import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import PromoSlider from "../../widgets/card-slider-favoritesPage";

import Bgmini from "../../assets/products/minitile.png";
import CardFallback1 from "../../assets/icons/products/card1.svg";
import CardFallback2 from "../../assets/icons/products/card2.svg";
import CardFallback3 from "../../assets/icons/products/card3.svg";

import "./gifts.scss";
import { useAppNavigate } from "../../shared/lib/hooks/useAppNavigate";

import { useGetUserTrainingByIdQuery } from "../../shared/api/learning.api";

type SliderItem = {
  id: string | number;
  title: string;
  imageUrl?: string;
  onClick?: () => void;
};

const GIFTS_TRAINING_ID = 35;

export function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useAppNavigate();

  const { data, isLoading, isError, refetch } =
    useGetUserTrainingByIdQuery({ id: GIFTS_TRAINING_ID, populate: true });

  const blocks = useMemo(() => {
    const fallbacks = [CardFallback1, CardFallback2, CardFallback3];

    const root = data?.data;
    if (!root) return [];

    // Категории — это children тренинга 35: Фильмы, Музыка, Медитации
    return (root.childrens ?? []).map((category, ci) => {
      // Что рендерим внутри категории:
      // 1) если есть lessons — берём их,
      // 2) иначе берём childrens (если подарки завязаны на под-тренинги).
      const rawItems: any[] =
        (category.lessons && category.lessons.length > 0
          ? category.lessons
          : category.childrens) ?? [];

      const items: SliderItem[] = rawItems.map((node, ni) => {
        const isLesson = typeof node.lessonId === "number"; // отличаем урок от training-ноды
        const lessonType = isLesson ? String((node as any).type || "").toLowerCase() : "";

        const img =
          (isLesson ? node.coverUrl : node.coverUrl || node.iconUrl) ||
          fallbacks[(ci + ni) % fallbacks.length];

        const id = isLesson ? node.lessonId ?? node._id ?? `${ci}-${ni}` : node.trainingId ?? node._id ?? `${ci}-${ni}`;
        const title = node.title || (isLesson ? "Материал" : "Дар");

        const item: SliderItem = {
          id,
          title,
          imageUrl: img,
          onClick: () => {
            // если это урок — можем сразу вести в плеер/урок,
            // если это под-тренинг — в страницу тренинга
            if (isLesson) {
              if (lessonType === "audio") {
                const q = [
                  {
                    id: node.lessonId,
                    title: node.title || "Урок",
                    subtitle: node.duration || undefined,
                    artworkUrl: img,
                    mediaUrl: undefined as string | undefined,
                  },
                ];
                navigate("/player", {
                  state: {
                    queue: q,
                    index: 0,
                    trainingId: category.trainingId,
                    returnTo: "/gifts",
                  },
                });
              } else if (lessonType === "video") {
                const q = [
                  {
                    id: node.lessonId,
                    title: node.title || "Урок",
                    subtitle: node.duration || undefined,
                    artworkUrl: img,
                    videoUrl: undefined as string | undefined,
                  },
                ];
                navigate("/player", {
                  state: {
                    queue: q,
                    index: 0,
                    trainingId: category.trainingId,
                    returnTo: "/gifts",
                  },
                });
              } else {
                // текст / другое
                navigate(`/lesson/${category.trainingId}/${node.lessonId}`, {
                  state: { returnTo: "/gifts" },
                });
              }
            } else {
              // под-тренинг внутри категории
              navigate(`/training/${node.trainingId}`, {
                state: { returnTo: "/gifts" },
              });
            }
          },
        };

        return item;
      });

      return {
        key: category._id,
        title: category.title || "Категория",
        items,
      };
    });
  }, [data, navigate]);
  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen favorites">
        <Title>Дары</Title>

        {isLoading && <div className="promo-container">Загрузка…</div>}

        {isError && (
          <div className="promo-container">
            Не удалось загрузить.{" "}
            <button onClick={() => refetch()}>Повторить</button>
          </div>
        )}

        {!isLoading && !isError && blocks.length === 0 && (
          <div className="promo-container" style={{ opacity: 0.7 }}>
            Раздел пуст
          </div>
        )}

        {!isLoading &&
          !isError &&
          blocks.map((b) => (
            <div key={b.key}>
              <h3 className="fav__sectionTitle">{b.title}</h3>
              <PromoSlider bgSrc={Bgmini} items={b.items} />
            </div>
          ))}

        <div className="space-box" />
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

export default Index;