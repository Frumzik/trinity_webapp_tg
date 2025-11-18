import { useMemo, useState } from "react";
import { useAppNavigate } from "../../shared/lib/hooks/useAppNavigate";

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
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

type SliderItem = {
  id: string | number;
  title: string;
  imageUrl?: string;
  onClick?: () => void;
};

export function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useAppNavigate();

  // тянем «дары» с бэка (аналогично избранному)
  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery({ populate: true });

  const blocks = useMemo(() => {
    const fallbacks = [CardFallback1, CardFallback2, CardFallback3];

    const raw: any = data as any;
    const cats: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : [];

    return cats.map((cat, ci) => {
      // предполагаем, что на бэке массив называется gifts (как favorites),
      // если поле другое — просто поменяешь здесь
      const items: SliderItem[] = (cat.gifts ?? cat.favorites ?? []).map(
        (g: any, fi: number) => {
          const lessonType = String(g.lesson?.type || "").toLowerCase();
          const img =
            g.lesson?.coverUrl ||
            g.training?.coverUrl ||
            g.training?.iconUrl ||
            fallbacks[(ci + fi) % 3];

          const item: SliderItem = {
            id: g.lessonId ?? g._id ?? `${ci}-${fi}`,
            title: g.lesson?.title || g.training?.title || "Дар",
            imageUrl: img,
            onClick: () => {
              // поведение такое же, как в избранном
              if (lessonType === "audio") {
                const q = [
                  {
                    id: g.lessonId as number,
                    title: g.lesson?.title || "Урок",
                    subtitle: g.lesson?.duration || undefined,
                    artworkUrl: img,
                    mediaUrl: undefined as string | undefined,
                  },
                ];
                navigate("/player", {
                  state: {
                    queue: q,
                    index: 0,
                    trainingId: g.trainingId as number,
                    returnTo: "/gifts",
                  },
                });
              } else if (lessonType === "video") {
                const q = [
                  {
                    id: g.lessonId as number,
                    title: g.lesson?.title || "Урок",
                    subtitle: g.lesson?.duration || undefined,
                    artworkUrl: img,
                    videoUrl: undefined as string | undefined,
                  },
                ];
                navigate("/player", {
                  state: {
                    queue: q,
                    index: 0,
                    trainingId: g.trainingId as number,
                    returnTo: "/gifts",
                  },
                });
              } else if (g.trainingId && g.lessonId) {
                navigate(`/lesson/${g.trainingId}/${g.lessonId}`, {
                  state: { returnTo: "/gifts" },
                });
              }
            },
          };

          return item;
        }
      );

      return {
        key: cat.tag ?? `block-${ci}`,
        title: cat.title ?? "Дары",
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