
import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import PromoSlider from "../../widgets/card-slider-favoritesPage";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bgmini from "../../assets/products/minitile.png";
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

export function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetFavoritesQuery({ populate: true });

  const blocks = useMemo(() => {
    const fallbacks = [CardFallback1, CardFallback2, CardFallback3];

    const raw: any = data as any;
    const cats: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

    return cats.map((cat, ci) => {
      const items: SliderItem[] = (cat.favorites ?? []).map((f: any, fi: number) => {
        const lessonType = String(f.lesson?.type || "").toLowerCase();
        const img =
          f.lesson?.coverUrl ||
          f.training?.coverUrl ||
          f.training?.iconUrl ||
          fallbacks[(ci + fi) % 3];

        const fullTitle =
          f.lesson?.title || f.training?.title || "Практика";

        const shortTitle = fullTitle
          .split(/\s+/)
          .slice(0, 3)
          .join(" ");

        const item: SliderItem = {
          id: f.lessonId ?? f._id ?? `${ci}-${fi}`,
          title: shortTitle,
          imageUrl: img,
          onClick: () => {
            if (f.type === "Training") {
              navigate("/preview", {
                state: {
                  trainingId: f.trainingId,
                  returnTo: "/favorites",
                },
              });
              return;
            }

            const lessonType = String(f.lesson?.type || "").toLowerCase();

            if (lessonType === "audio") {
              const q = [
                {
                  id: f.lessonId as number,
                  title: fullTitle,
                  subtitle: f.lesson?.duration || undefined,
                  artworkUrl: img,
                  mediaUrl: undefined,
                },
              ];
              navigate("/player", {
                state: {
                  queue: q,
                  index: 0,
                  trainingId: f.trainingId,
                  returnTo: "/favorites",
                },
              });
              return;
            }

            if (lessonType === "video") {
              const q = [
                {
                  id: f.lessonId as number,
                  title: fullTitle,
                  subtitle: f.lesson?.duration || undefined,
                  artworkUrl: img,
                  videoUrl: undefined,
                },
              ];
              navigate("/player", {
                state: {
                  queue: q,
                  index: 0,
                  trainingId: f.trainingId,
                  returnTo: "/favorites",
                },
              });
              return;
            }

            navigate(`/lesson/${f.trainingId}/${f.lessonId}`, {
              state: { returnTo: "/favorites" },
            });
          },
        };

        return item;
      });

      return {
        key: cat.tag ?? `block-${ci}`,
        title: cat.title ?? "Избранное",
        items,
      };
    });
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

        {!isLoading && !isError && blocks.length === 0 && (
          <div className="promo-container" style={{ opacity: 0.7 }}>Пока пусто</div>
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
          <GradientButton onClick={() => navigate('/home')}>Назад</GradientButton>
        </div>
      </div>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  );
}

export default Index;