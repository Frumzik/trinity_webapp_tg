import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import Tabs from "./ui/Tabs";
import LevelCard from "./ui/LevelCard";
import TopBar from "../../widgets/topbarTextpage";
import helpIcon from "../../assets/icons/helpIcon.svg";
import Info from "../../assets/icons/popup.svg";
import "./films.scss";
import Footer from "../../widgets/footer/footer";
import LevelPurchaseModal, {
  type PurchaseLevel,
} from "../../widgets/level-purchase-modal";
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

export type LevelItem = {
  id: string;
  group: number;
  badge?: { text: string; tone?: "info" | "warn" };
  title: string;
  subtitle?: string;
  durationMin?: number;
  image: string;
  status: "available" | "done" | "locked";
  priceUSDT?: number;
};

// минимальный тип узла из дерева
type BNode = {
  _id: string;
  trainingId: number;
  type: "training" | "product";
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
};

const numFromTitle = (t?: string) => {
  const m = (t || "").match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

const minutesFromDuration = (d?: string | null) => {
  if (!d) return undefined;
  const m = d.match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

export default function Index() {
  const navigate = useNavigate();
  const [group, setGroup] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickedId, setClickedId] = useState<string | number | undefined>();

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();

  // ищем корень "Фильмы" в дереве
  const filmsRoot: BNode | undefined = useMemo(() => {
    const roots = (data?.data ?? []) as BNode[];

    // приоритет: films с tag=stages_spirit, потом просто по title
    return (
      roots.find(
        (r) => r.tag === "stages_spirit" && r.title === "Фильмы"
      ) ||
      roots.find((r) => r.tag === "stage_level" && r.title === "Фильмы") ||
      roots.find((r) => r.title === "Фильмы")
    );
  }, [data]);

  // уровни внутри «Фильмов» (если они будут, как 1 Уровень / 2 Уровень)
  const levelNodes: BNode[] = useMemo(() => {
    if (!filmsRoot) return [];
    const arr = (filmsRoot.childrens ?? []) as BNode[];
    const onlyLevels = arr.filter(
      (n) => n.tag === "stage_level" || typeof n.stageLevel === "number"
    );

    // если бэкенд пока не заводит stage_level — можно просто взять всех детей
    const base = onlyLevels.length ? onlyLevels : arr;

    return [...base].sort((a, b) => {
      const A = a.stageLevel ?? numFromTitle(a.title) ?? 0;
      const B = b.stageLevel ?? numFromTitle(b.title) ?? 0;
      return A - B;
    });
  }, [filmsRoot]);

  const groups = useMemo(() => {
    const nums = levelNodes
      .map((n) => n.stageLevel ?? numFromTitle(n.title))
      .filter((x): x is number => typeof x === "number");
    return nums.length ? nums : [1];
  }, [levelNodes]);

  useEffect(() => {
    if (!groups.includes(group) && groups.length) {
      setGroup(groups[0]);
    }
  }, [groups, group]);

  // текущий "уровень" фильмов (если их несколько)
  const currentLevel: BNode | undefined = useMemo(() => {
    // если levels нет — считаем, что всё лежит прямо под filmsRoot
    if (!levelNodes.length) return filmsRoot;
    return levelNodes.find(
      (n) => (n.stageLevel ?? numFromTitle(n.title)) === group
    );
  }, [levelNodes, group, filmsRoot]);

  // карточки для рендера
  const items: LevelItem[] = useMemo(() => {
    if (!currentLevel) return [];

    // если есть вложенные children — берём их, иначе рендерим сам currentLevel как один item
    const src: BNode[] =
      (currentLevel.childrens ?? []).length > 0
        ? (currentLevel.childrens as BNode[])
        : [currentLevel];

    return src.map((s): LevelItem => {
      const status: LevelItem["status"] =
        s.progressStatus === "completed"
          ? "done"
          : s.accessStatus === "available"
            ? "available"
            : "locked";

      return {
        id: String(s.trainingId),
        group,
        title: s.title,
        subtitle: s.shortDescription ?? undefined,
        durationMin: minutesFromDuration(s.duration),
        image: s.coverUrl || s.iconUrl || "",
        status,
        priceUSDT: (s.salePrice ?? s.price) ?? undefined,
      };
    });
  }, [currentLevel, group]);

  const purchaseLevels: PurchaseLevel[] = useMemo(
    () =>
      items.map((it, idx) => ({
        id: it.id,
        title: it.title,
        priceOM: it.priceUSDT ? Math.round(it.priceUSDT * 5) : 10 + idx * 5,
        oldPriceOM: undefined,
        purchased: it.status !== "locked",
      })),
    [items]
  );

  const handleCardClick = (l: LevelItem) => {
    if (l.status === "locked") {
      setClickedId(l.id);
      setModalOpen(true);
      return;
    }
    // если у тебя есть отдельная страница для фильмов — поменяй роут здесь
    navigate(`/level/${l.id}`, { state: { returnTo: location.pathname } });
  };

  const purchase = (_p: {
    levelIds: (string | number)[];
    totalOM: number;
    discountedOM?: number;
  }) => {
    // пока без реальной покупки, просто закрываем модалку
    setModalOpen(false);
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar
        title="Фильмы"
        rightIconUrl={helpIcon}
        onRightClick={() =>
          window.open(
            "https://docs.google.com/document/d/19hvbG7ZUQYpfMUF8oNz43oJlOQd-KdTKqMPf8QrWEME/edit?tab=t.0",
            "_blank",
            "noopener,noreferrer"
          )
        }
      />

      <main className="screen" style={{ padding: "5px 16px 0px 16px" }}>
        <div className="levels">
          <div className="levels__header">

            <div className="levels__tabs">
              <div className="levels__tabs-title">Уровни</div>
              <Tabs
                value={group}
                options={groups.map((n) => ({ label: String(n), value: n }))}
                onChange={setGroup}
              />
            </div>
          </div>

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
                railRight: "-15px",
                railTop: "10px",
                railBottom: "4px",
                railWidth: "3px",
                railColor: "#E8E8E8",
                thumbColor: "#C7C7C7",
                zIndex: 10,
              }}
            >
              <div className="levels__list">
                {items.map((l) => (
                  <LevelCard
                    key={l.id}
                    item={l}
                    onClick={() => handleCardClick(l)}
                  />
                ))}

                {items.length === 0 && (
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
            InfoIcon={(props) => <img src={Info} {...props} />}
            onClose={() => setModalOpen(false)}
            onPurchase={purchase}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}