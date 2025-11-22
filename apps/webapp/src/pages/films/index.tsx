import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import LevelCard from "./ui/LevelCard";
import TopBar from "../../widgets/topbarTextpage";
import Info from "../../assets/icons/popup.svg";
import "./films.scss";
import Footer from "../../widgets/footer/footer";
import LevelPurchaseModal, {
  type PurchaseLevel,
} from "../../widgets/level-purchase-modal";
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";
import { useAppNavigate } from "../../shared/lib/hooks/useAppNavigate";

export type LevelItem = {
  id: string;                 // lessonId
  parentTrainingId: number;   // trainingId, нужен для роутинга
  group: number;
  badge?: { text: string; tone?: "info" | "warn" };
  title: string;
  subtitle?: string;
  durationMin?: number;
  image: string;
  status: "available" | "done" | "locked";
  priceUSDT?: number;
};

type LessonNode = {
  _id: string;
  lessonId: number;
  type: string;
  favoritesTag?: string | null;
  title: string;
  description?: string | null;
  duration?: string | null;
  shortDescription?: string | null;
  coverUrl?: string | null;
  bgUrl?: string | null;
  price?: number | null;
  salePrice?: number | null;
  accessStatus: "available" | "locked";
  progressStatus: "not_started" | "in_progress" | "completed";
};

type BNode = {
  _id: string;
  trainingId: number;
  type: "training" | "product" | string;
  favoritesTag?: string | null;
  tag?: string | null;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  duration?: string | null;
  coverUrl?: string | null;
  iconUrl?: string | null;
  accessStatus: "available" | "locked";
  progressStatus: "not_started" | "in_progress" | "completed";
  price?: number | null;
  salePrice?: number | null;
  stageLevel?: number | null;
  childrens?: BNode[];
  lessons?: LessonNode[];
};

const minutesFromDuration = (d?: string | null) => {
  if (!d) return undefined;
  const m = d.match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

// Собираем все уроки с favoritesTag = films / film по всему дереву
type FilmWithParent = {
  lesson: LessonNode;
  parentTrainingId: number;
  parentCover?: string | null;
  parentIcon?: string | null;
};

const collectFilmLessons = (nodes: BNode[]): FilmWithParent[] => {
  const result: FilmWithParent[] = [];

  const walk = (node: BNode) => {
    const lessons = (node.lessons ?? []) as LessonNode[];

    const isFilmContainer =
      node.favoritesTag === "film" ||
      node.tag === "film" ||
      node.title?.trim().toLowerCase() === "фильмы";

    for (const l of lessons) {
      const lessonIsFilm =
        l.favoritesTag === "films" || l.favoritesTag === "film";
      if (lessonIsFilm || isFilmContainer) {
        result.push({
          lesson: l,
          parentTrainingId: node.trainingId,
          parentCover: node.coverUrl,
          parentIcon: node.iconUrl,
        });
      }
    }

    (node.childrens ?? []).forEach(walk);
  };

  nodes.forEach(walk);
  return result;
};
export default function Index() {
  const navigate = useAppNavigate();
  const location = useLocation();

  const [modalOpen, setModalOpen] = useState(false);
  const [clickedId, setClickedId] = useState<string | number | undefined>();

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();

  const group = 1;

  const filmItems: LevelItem[] = useMemo(() => {
    const roots = (data?.data ?? []) as unknown as BNode[];
    if (!roots.length) return [];

    const films = collectFilmLessons(roots);

    return films.map(({ lesson, parentTrainingId, parentCover, parentIcon }) => {
      const status: LevelItem["status"] =
        lesson.progressStatus === "completed"
          ? "done"
          : lesson.accessStatus === "available"
            ? "available"
            : "locked";

      return {
        id: String(lesson.lessonId),
        parentTrainingId,
        group,
        title: lesson.title,
        subtitle: lesson.description ?? undefined,
        durationMin: minutesFromDuration(lesson.duration),
        image: lesson.coverUrl || parentCover || parentIcon || "",
        status,
        priceUSDT: (lesson.salePrice ?? lesson.price) ?? undefined,
      };
    });
  }, [data]);

  const purchaseLevels: PurchaseLevel[] = useMemo(
    () =>
      filmItems.map((it) => ({
        id: it.id,
        title: it.title,
        price: it.priceUSDT ? Math.round(it.priceUSDT * 5) : 0,
        salePrice: undefined,
        purchased: it.status !== "locked",
      })),
    [filmItems]
  );

  const handleCardClick = (l: LevelItem) => {
    if (l.status === "locked") {
      setClickedId(l.id);
      setModalOpen(true);
      return;
    }

    // у тебя есть роут /lesson/:trainingId/:lessonId
    navigate(`/lesson/${l.parentTrainingId}/${l.id}`, {
      state: { returnTo: location.pathname },
    });
  };

  const purchase = (_p: {
    levelIds: (string | number)[];
    totalOM: number;
    discountedOM?: number;
  }) => {
    setModalOpen(false);
  };

  const hasContent = filmItems.length > 0;

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar title="Фильмы" />

      <main className="screen" style={{ padding: "5px 16px 0px 16px" }}>
        <div className="levels">
          <div className="levels__header" />

          {isLoading && (
            <div
              style={{
                padding: "8px 0 0 4px",
                fontSize: 14,
                opacity: 0.7,
              }}
            >
              Загрузка…
            </div>
          )}

          {isError && (
            <div style={{ padding: "8px 0 0 4px", fontSize: 14 }}>
              Не удалось загрузить.{" "}
              <button onClick={() => refetch()}>Повторить</button>
            </div>
          )}

          {!isLoading && !isError && (
            <ScrollPanel
              maxHeight="66dvh"
              vars={{
                railRight: "-10px",
                railTop: "10px",
                railBottom: "4px",
                railWidth: "3px",
                railColor: "rgba(255, 255, 255, 0.25)",
                thumbColor: "#C7C7C7",
                zIndex: 10,
              }}
            >
              <div className="levels__list">
                {filmItems.map((l) => (
                  <LevelCard
                    key={`${l.parentTrainingId}-${l.id}`}
                    item={l}
                    onClick={() => handleCardClick(l)}
                  />
                ))}

                {!hasContent && (
                  <div style={{ padding: "8px 4px", opacity: 0.7 }}>
                    Фильмы пока недоступны
                  </div>
                )}
              </div>
            </ScrollPanel>
          )}

          <LevelPurchaseModal
            open={modalOpen}
            lockedLevels={purchaseLevels}
            defaultSelectedId={clickedId}
            rateText="1 OM = 1 USDT"
            onClose={() => setModalOpen(false)}
            onPurchase={purchase}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}