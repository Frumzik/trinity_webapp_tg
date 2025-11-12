// src/pages/levels/index.tsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
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
import FlexibleModal from "../../widgets/flexible-modal";
import { learningApi, useGetTrainingTreeQuery } from "../../shared/api/learning.api";
import { useAddPurchaseMutation } from "../../shared/api/purchase.api";

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

const numFromTitle = (t?: string) => {
  const m = (t || "").match(/\d+/);
  return m ? Number(m[0]) : undefined;
};
const minutesFromDuration = (d?: string | null) => {
  if (!d) return undefined;
  const m = d.match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

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
  stage?: number | null;
  stageLevel?: number | null;
  childrens?: BNode[];
  lessons?: any[];
};

export default function Index() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [group, setGroup] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickedId, setClickedId] = useState<string | number | undefined>();

  // модалка ответа пользователю
  const [resultOpen, setResultOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState<string>();
  const [resultItems, setResultItems] = useState<string[] | undefined>();
  const [resultDesc, setResultDesc] = useState<string | undefined>();
  const [resultCta, setResultCta] = useState<string | undefined>();
  const [resultOnCta, setResultOnCta] = useState<(() => void) | undefined>();

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();
  const [addPurchase, { isLoading: isBuying }] = useAddPurchaseMutation();

  const root: BNode | undefined = useMemo(() => {
    const roots = (data?.data ?? []) as BNode[];
    return roots.find((r) => r.tag === "stages_spirit");
  }, [data]);

  const levelNodes: BNode[] = useMemo(() => {
    const arr = (root?.childrens ?? []) as BNode[];
    const onlyLevels = arr.filter((n) => n.tag === "stage_level" || typeof n.stageLevel === "number");
    return [...onlyLevels].sort((a, b) => {
      const A = a.stageLevel ?? numFromTitle(a.title) ?? 0;
      const B = b.stageLevel ?? numFromTitle(b.title) ?? 0;
      return A - B;
    });
  }, [root]);

  const groups = useMemo(() => {
    const nums = levelNodes
      .map((n) => n.stageLevel ?? numFromTitle(n.title))
      .filter((x): x is number => typeof x === "number");
    return nums.length ? nums : [1];
  }, [levelNodes]);

  useEffect(() => {
    if (!groups.includes(group) && groups.length) setGroup(groups[0]);
  }, [groups, group]);

  const currentLevel: BNode | undefined = useMemo(
    () => levelNodes.find((n) => (n.stageLevel ?? numFromTitle(n.title)) === group),
    [levelNodes, group]
  );

  const items: LevelItem[] = useMemo(() => {
    const stages = ((currentLevel?.childrens ?? []) as BNode[]).filter(
      (s) => s.tag === "stage" || typeof s.stage === "number"
    );
    return stages.map((s): LevelItem => ({
      id: String(s.trainingId),
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
    if (l.status === "locked") {
      setClickedId(l.id);
      setModalOpen(true);
    } else {
      navigate(`/level/${l.id}`, { state: { returnTo: location.pathname } });
    }
  };

  // ---- модалки результата ----
  const openSuccessModal = (titles: string[]) => {
    setResultTitle("Покупка оформлена");
    setResultItems(titles);
    setResultDesc("Доступ к ступеням открыт. Приятной практики!");
    setResultCta("Открыть");
    const first = purchaseLevels.find((pl) => titles.includes(pl.title));
    setResultOnCta(() => (first ? () => navigate(`/level/${first.id}`) : () => setResultOpen(false)));
    setResultOpen(true);
  };

  const openInsufficientModal = (needOM?: number, balanceOM?: number) => {
    setResultTitle("Недостаточно средств");
    const lines: string[] = [];
    if (typeof needOM === "number") lines.push(`Требуется: ${needOM} OM`);
    if (typeof balanceOM === "number") lines.push(`Доступно: ${balanceOM} OM`);
    setResultItems(lines.length ? lines : undefined);
    setResultDesc("Пополните баланс и попробуйте снова.");
    setResultCta(undefined);
    setResultOnCta(undefined);
    setResultOpen(true);
  };

  const openErrorModal = (message?: string) => {
    const msg = Array.isArray(message) ? message.join("\n") : message;
    setResultTitle("Ошибка");
    setResultItems(undefined);
    setResultDesc(msg || "Не удалось выполнить покупку. Попробуйте позже.");
    setResultCta(undefined);
    setResultOnCta(undefined);
    setResultOpen(true);
  };

  // ---- покупка ----
  const purchase = async (_p: {
    levelIds: (string | number)[];
    totalOM: number;
    discountedOM?: number;
  }) => {
    setModalOpen(false);

    const ids = _p.levelIds.map((id) => Number(id)).filter(Number.isFinite) as number[];
    if (ids.length === 0) return;

    try {
      // 1) запрос на бэк
      await addPurchase({
        type: "Training",
        content: ids,
        sale: Boolean(_p.discountedOM), // скидка при покупке всех
      }).unwrap();

      // 2) оптимистично помечаем купленные тренинги доступными в кэше,
      //    чтобы UI обновился мгновенно
      dispatch(
        learningApi.util.updateQueryData("getTrainingTree", undefined, (draft: any) => {
          const nodes: any[] = draft?.data ?? [];
          for (const root of nodes) {
            const walk = (n: any) => {
              if (typeof n?.trainingId === "number" && ids.includes(n.trainingId)) {
                n.accessStatus = "available";
                if (n.progressStatus !== "completed") n.progressStatus = "not_started";
              }
              (n.childrens ?? []).forEach(walk);
            };
            walk(root);
          }
        })
      );

      // 3) модалка успеха
      const titles = purchaseLevels
        .filter((pl) => ids.includes(Number(pl.id)))
        .map((pl) => pl.title);
      openSuccessModal(titles);

      // 4) подстраховать свежими данными
      await refetch();
    } catch (e: any) {
      const code = e?.data?.code;
      if (code === "INSUFFICIENT_FUNDS") {
        openInsufficientModal(e?.data?.needOM, e?.data?.balanceOM);
      } else {
        openErrorModal(e?.data?.message ?? e?.error ?? "Ошибка покупки");
      }
    }
  };
  const anyModalOpen = modalOpen || resultOpen;
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

          {isLoading && (
            <div style={{ padding: "8px 0 0 4px", fontSize: 14, opacity: 0.7 }}>
              Загрузка…
            </div>
          )}
          {isError && (
            <div style={{ padding: "8px 0 0 4px", fontSize: 14 }}>
              Не удалось загрузить. <button onClick={() => refetch()}>Повторить</button>
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
            <div className="levels__list" aria-busy={isBuying}>
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

      {!anyModalOpen && <Footer />}

      <FlexibleModal
        open={resultOpen}
        title={resultTitle}
        items={resultItems}
        description={resultDesc}
        ctaLabel={resultCta}
        onCta={resultOnCta}
        closeIconUrl={helpIcon}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}