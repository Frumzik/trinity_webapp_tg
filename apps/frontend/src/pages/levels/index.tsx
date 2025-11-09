import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import Tabs from "./ui/Tabs";
import LevelCard from "./ui/LevelCard";
import TopBar from "../../widgets/topbarTextpage";
import helpIcon from "../../assets/icons/helpIcon.svg";
import Info from "../../assets/icons/popup.svg";
import "./levels.scss";
import Footer from "../../widgets/footer/footer";
import LevelPurchaseModal, { type PurchaseLevel } from "../../widgets/level-purchase-modal";

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

// helpers
const numFromTitle = (t?: string) => {
  const m = (t || "").match(/\d+/);
  return m ? Number(m[0]) : undefined;
};
const minutesFromDuration = (d?: string | null) => {
  if (!d) return undefined;
  const m = d.match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

// тип узла из /learning/training
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
  const navigate = useNavigate();
  const [group, setGroup] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickedId, setClickedId] = useState<string | number | undefined>();

  // ⬇️ тянем дерево
  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();

  // корень "Ступени Духа"
  const root: BNode | undefined = useMemo(() => {
    const roots = (data?.data ?? []) as BNode[];
    return roots.find((r) => r.type === "stages_spirit");
  }, [data]);

  // уровни (stage_level), отсортированы по номеру в заголовке
  const levelNodes: BNode[] = useMemo(() => {
    const arr = (root?.childrens ?? []) as BNode[];
    return [...arr].sort(
      (a, b) => (numFromTitle(a.title) ?? 0) - (numFromTitle(b.title) ?? 0)
    );
  }, [root]);

  // вкладки "Уровни"
  const groups = useMemo(() => {
    const nums = levelNodes
      .map((n) => numFromTitle(n.title))
      .filter((x): x is number => typeof x === "number");
    return nums.length ? nums : [1];
  }, [levelNodes]);

  // если выбранная вкладка отсутствует, переключаемся на первую
  useEffect(() => {
    if (!groups.includes(group) && groups.length) setGroup(groups[0]);
  }, [groups, group]);

  // выбранный уровень
  const currentLevel: BNode | undefined = useMemo(
    () => levelNodes.find((n) => numFromTitle(n.title) === group),
    [levelNodes, group]
  );

  // ступени текущего уровня → твои LevelItem
  const items: LevelItem[] = useMemo(() => {
    const stages = (currentLevel?.childrens ?? []) as BNode[];
    return stages.map((s): LevelItem => ({
      id: String(s.trainingId),                              // роут /levels/:id
      group,
      title: s.title,
      subtitle: undefined,
      durationMin: minutesFromDuration(s.duration),
      image: s.coverUrl || "",
      status:
        s.accessStatus === "available"
          ? "available"
          : s.progressStatus === "completed"
            ? "done"
            : "locked",
      priceUSDT: (s.salePrice ?? s.price) ?? undefined,
    }));
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
    if (l.status === 'locked') {
      setClickedId(l.id)
      setModalOpen(true)
    } else {
      navigate(`/trainings/${l.id}`)
    }
  }

  const purchase = (_p: {
    levelIds: (string | number)[];
    totalOM: number;
    discountedOM?: number;
  }) => {
    // тут вызываешь покупку уровня (если будет эндпоинт). Пока закрываем модалку.
    setModalOpen(false);
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar
        title="Ступени духа"
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

          {/* лёгкий стейт загрузки/ошибки — без изменения вёрстки */}
          {isLoading && (
            <div style={{ padding: "8px 0 0 4px", fontSize: 14, opacity: 0.7 }}>
              Загрузка…
            </div>
          )}
          {isError && (
            <div style={{ padding: "8px 0 0 4px", fontSize: 14 }}>
              Не удалось загрузить.{" "}
              <button onClick={() => refetch()}>Повторить</button>
            </div>
          )}

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
                <LevelCard key={l.id} item={l} onClick={() => handleCardClick(l)} />
              ))}
            </div>
          </ScrollPanel>

          <LevelPurchaseModal
            open={modalOpen}
            lockedLevels={purchaseLevels}
            defaultSelectedId={clickedId}
            rateText="USDT = OM"
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