import { useEffect, useMemo, useState } from "react";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import Tabs from "../levels/ui/Tabs";
import LevelCard from "../levels/ui/LevelCard";
import TopBar from "../../widgets/topbarTextpage";
import helpIcon from "../../assets/icons/helpIcon.svg";
import Footer from "../../widgets/footer/footer";
import LevelPurchaseModal, { type PurchaseLevel } from "../../widgets/level-purchase-modal";
import FlexibleModal from "../../widgets/flexible-modal";
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";
import { useAddPurchaseMutation } from "../../shared/api/purchase.api";
import { useAppNavigate } from "../../shared/lib/hooks/useAppNavigate";
import { useGetUserQuery, useLazyGetUserQuery } from "../../shared/api/user.api";
import { useLocation } from "react-router-dom";

export type LevelItem = {
  id: string;
  group: number;
  badge?: { text: string; tone?: "info" | "warn" };
  title: string;
  subtitle?: string;
  durationMin?: number;
  image: string;
  description: string;
  status: "available" | "done" | "locked";
  priceUSDT?: number;
};

const numFromTitle = (t?: string) => {
  const m = (t || "").match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

type LocalProgress = {
  seconds: number;
  duration: number;
  status: "in_progress" | "completed";
};

const LP_KEY = "lessonProgress";

const lpLoad = (): Record<string, LocalProgress> => {
  try {
    return JSON.parse(localStorage.getItem(LP_KEY) || "{}");
  } catch {
    return {};
  }
};

const readLegacyLesson = (lessonId: number | string) => {
  try {
    const raw = localStorage.getItem(`lessonProgress:${lessonId}`);
    if (!raw) return null;
    const j = JSON.parse(raw);
    const current = Math.max(0, Math.round(j?.current || 0));
    const duration = Math.max(0, Math.round(j?.duration || 0));
    const completed = Boolean(j?.completed) || (duration > 0 && current >= duration);
    return {
      seconds: current,
      duration,
      status: completed ? ("completed" as const) : ("in_progress" as const),
    };
  } catch {
    return null;
  }
};

const isLessonCompletedLocal = (lessonId: number | string, store?: Record<string, LocalProgress>) => {
  const lp = store ?? lpLoad();
  const rec = lp[String(lessonId)] ?? readLegacyLesson(lessonId);
  if (!rec) return false;
  return rec.status === "completed" || (rec.duration > 0 && rec.seconds >= rec.duration);
};

type BNode = {
  _id?: string;
  trainingId: number;
  type: string;
  favoritesTag?: string | null;
  tag?: string | null;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  duration?: string | null;
  coverUrl?: string | null;
  iconUrl?: string | null;
  bgUrl?: string | null;
  accessStatus: "available" | "locked";
  progressStatus: "not_started" | "in_progress" | "completed";
  price?: number | null;
  salePrice?: number | null;
  stage?: number | null;
  stageLevel?: number | null;
  childrens?: BNode[];
  lessons?: any[];
};

const isTrainingCompletedLocal = (node: BNode) => {
  const lp = lpLoad();
  const lessons = node.lessons ?? [];
  if (!lessons.length) return false;
  return lessons.every((l: any) => l.progressStatus === "completed" || isLessonCompletedLocal(l.lessonId, lp));
};

const minutesFromDuration = (d?: string | null) => {
  if (!d) return undefined;
  const m = d.match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

const norm = (v?: string | null) => (v || "").trim().toLowerCase();

const isLevel = (n: BNode) => n.tag === "stage_level" || typeof n.stageLevel === "number";

const isStage = (n: BNode) => n.tag === "stage" || typeof n.stage === "number";

const isStandardish = (n: BNode) => {
  const t = norm(n.tag);
  const f = norm(n.favoritesTag);
  return t === "standart" || f === "standart";
};

const sortByIndex = (a: BNode, b: BNode) => {
  const A = (a.stageLevel ?? a.stage ?? numFromTitle(a.title) ?? 0) as number;
  const B = (b.stageLevel ?? b.stage ?? numFromTitle(b.title) ?? 0) as number;
  return A - B;
};

export default function TrainingLevelsIndex() {
  const navigate = useAppNavigate();
  const location = useLocation();

  const rootTrainingId: number | undefined = (location.state as any)?.rootTrainingId;
  const pageTitle: string = (location.state as any)?.title || "Тренинг";
  const fromState: string | undefined = (location.state as any)?.from;

  const [group, setGroup] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickedId, setClickedId] = useState<string | number | undefined>();

  const [resultOpen, setResultOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState<string>();
  const [resultItems, setResultItems] = useState<string[] | undefined>();
  const [resultDesc, setResultDesc] = useState<string | undefined>();
  const [resultCta, setResultCta] = useState<string | undefined>();
  const [resultOnCta, setResultOnCta] = useState<(() => void) | undefined>();

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();
  const [addPurchase, { isLoading: isBuying }] = useAddPurchaseMutation();
  const { data: userRes, isLoading: isUserLoading } = useGetUserQuery({ populate: true });
  const [fetchUser] = useLazyGetUserQuery();

  const findNodeByTrainingId = (nodes: BNode[], id: number): BNode | undefined => {
    const stack = [...nodes];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.trainingId === id) return n;
      const ch = n.childrens ?? [];
      for (let i = 0; i < ch.length; i++) stack.push(ch[i]);
    }
    return undefined;
  };

  const root: BNode | undefined = useMemo(() => {
    const all = (data?.data ?? []) as BNode[];
    if (typeof rootTrainingId !== "number") return undefined;
    return findNodeByTrainingId(all, rootTrainingId);
  }, [data, rootTrainingId]);

  const rootChildren: BNode[] = useMemo(() => ((root?.childrens ?? []) as BNode[]).slice(), [root]);

  const levelNodes: BNode[] = useMemo(() => {
    const explicit = rootChildren.filter(isLevel);
    if (explicit.length) return [...explicit].sort(sortByIndex);

    const hasAnyStageLevel = rootChildren.some((n) => typeof n.stageLevel === "number");
    if (hasAnyStageLevel) return [...rootChildren].filter((n) => typeof n.stageLevel === "number").sort(sortByIndex);

    return [];
  }, [rootChildren]);

  const groups = useMemo(() => {
    if (!levelNodes.length) return [1];
    const nums = levelNodes
      .map((n, idx) => n.stageLevel ?? numFromTitle(n.title) ?? idx + 1)
      .filter((x): x is number => typeof x === "number");
    return nums.length ? nums : [1];
  }, [levelNodes]);

  useEffect(() => {
    if (!groups.includes(group) && groups.length) setGroup(groups[0]);
  }, [groups, group]);

  const currentLevel: BNode | undefined = useMemo(() => {
    if (!levelNodes.length) return undefined;
    return levelNodes.find((n, idx) => (n.stageLevel ?? numFromTitle(n.title) ?? idx + 1) === group);
  }, [levelNodes, group]);

  const stages: BNode[] = useMemo(() => {
    if (!root) return [];

    if (!levelNodes.length) {
      const explicit = rootChildren.filter(isStage);
      if (explicit.length) return [...explicit].sort(sortByIndex);

      return [...rootChildren]
        .filter((n) => (n.childrens?.length ?? 0) > 0 || (n.lessons?.length ?? 0) > 0 || isStandardish(n))
        .sort(sortByIndex)
        .map((n, idx) => ({ ...n, stage: n.stage ?? numFromTitle(n.title) ?? idx + 1 }));
    }

    const children = ((currentLevel?.childrens ?? []) as BNode[]).slice();

    const explicit = children.filter(isStage);
    if (explicit.length) return [...explicit].sort(sortByIndex);

    return [...children]
      .filter((n) => (n.childrens?.length ?? 0) > 0 || (n.lessons?.length ?? 0) > 0 || isStandardish(n))
      .sort(sortByIndex)
      .map((n, idx) => ({ ...n, stage: n.stage ?? numFromTitle(n.title) ?? idx + 1 }));
  }, [root, rootChildren, levelNodes.length, currentLevel]);

  const nodeById = useMemo(() => {
    const m = new Map<string, BNode>();
    stages.forEach((s) => m.set(String(s.trainingId), s));
    return m;
  }, [stages]);

  const items: LevelItem[] = useMemo(() => {
    return stages.map((s, idx): LevelItem => {
      const doneLocal = isTrainingCompletedLocal(s);

      const status: LevelItem["status"] =
        group === 1 && idx === 0
          ? "available"
          : s.progressStatus === "completed" || doneLocal
            ? "done"
            : s.accessStatus === "available"
              ? "available"
              : "locked";

      return {
        id: String(s.trainingId),
        group,
        title: s.title,
        subtitle: undefined,
        durationMin: minutesFromDuration(s.duration),
        image: s.coverUrl || s.bgUrl || "",
        status,
        priceUSDT: s.salePrice ?? s.price ?? undefined,
        description: s.shortDescription || s.description || "",
      };
    });
  }, [stages, group]);

  const purchaseLevels: PurchaseLevel[] = useMemo(() => {
    return stages.map((s, idx) => {
      const status: LevelItem["status"] =
        group === 1 && idx === 0
          ? "available"
          : s.progressStatus === "completed" || isTrainingCompletedLocal(s)
            ? "done"
            : s.accessStatus === "available"
              ? "available"
              : "locked";

      const stepIndex =
        typeof s.stage === "number"
          ? s.stage
          : numFromTitle(s.title) ?? idx + 1;

      return {
        id: String(s.trainingId),
        title: s.title,
        price: s.salePrice ?? s.price ?? 0,
        salePrice: s.salePrice != null ? s.price ?? undefined : undefined,
        purchased: status !== "locked",
        stepIndex,
      };
    });
  }, [stages, group]);

  const openNode = (node: BNode) => {
    const hasChildren = (node.childrens?.length ?? 0) > 0;
    const hasLessons = (node.lessons?.length ?? 0) > 0;

    if (hasChildren && !hasLessons) {
      navigate("/training-levels", {
        state: {
          rootTrainingId: node.trainingId,
          title: node.title,
          from: "/training-levels",
        },
      });
      return;
    }

    navigate(`/level/${node.trainingId}`, { state: { returnTo: "/training-levels" } });
  };

  const handleCardClick = (l: LevelItem) => {
    if (l.status === "locked") {
      setClickedId(l.id);
      setModalOpen(true);
      return;
    }

    navigate(`/level/${l.id}`, {
      state: {
        returnTo: "/training-levels",
        from: backTo,
        rootTrainingId,
        title: pageTitle,
      },
    });
  };

  const buildStepTitle = (stepNumber: number, count: number) => {
    if (count === 1) return `${stepNumber} Ступень открыта`;
    const lastTwo = count % 100;
    const last = count % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return `${count} Ступеней открыто`;
    if (last === 1) return `${count} Ступень открыта`;
    if (last >= 2 && last <= 4) return `${count} Ступени открыты`;
    return `${count} Ступеней открыто`;
  };

  const openSuccessModal = (openedIds: number[]) => {
    if (!openedIds.length) return;

    const opened = purchaseLevels.filter((pl) => openedIds.includes(Number(pl.id)));
    const first = opened[0];

    const mainStepNumber =
      first && typeof first.stepIndex === "number"
        ? first.stepIndex
        : numFromTitle(first?.title) ?? 1;

    setResultTitle(buildStepTitle(mainStepNumber, opened.length));
    setResultItems(undefined);
    setResultDesc(undefined);
    setResultCta("Перейти");
    setResultOnCta(() => () => {
      if (!first) return setResultOpen(false);
      const node = nodeById.get(String(first.id));
      if (!node) return setResultOpen(false);
      setResultOpen(false);
      openNode(node);
    });
    setResultOpen(true);
  };

  const openErrorModal = (message?: string | string[], isInsufficient?: boolean) => {
    const msg = Array.isArray(message) ? message.join("\n") : message;
    setResultTitle(msg || (isInsufficient ? "Недостаточно OM на балансе" : "Произошла ошибка"));
    setResultItems(undefined);
    setResultCta(isInsufficient ? "Добавить OM" : "Продолжить");
    setResultOnCta(() => () => {
      if (isInsufficient) navigate("/wallet");
      setResultOpen(false);
    });
    setResultOpen(true);
  };

  const purchase = async (_p: { levelIds: (string | number)[]; totalOM: number; discountedOM?: number }) => {
    setModalOpen(false);

    let hasPaidSubscription = false;

    try {
      const freshUser = await fetchUser().unwrap();
      const subscriptionType = freshUser?.data?.subscription?.type;
      hasPaidSubscription = subscriptionType === "pro" || subscriptionType === "premium";
    } catch {
      const fallbackType = userRes?.data.subscription?.type;
      hasPaidSubscription = fallbackType === "pro" || fallbackType === "premium";
    }

    if (!hasPaidSubscription) {
      setResultTitle("Недоступно");
      setResultItems(undefined);
      setResultDesc("У вас неактивен доступ к приложению");
      setResultCta("Активировать");
      setResultOnCta(() => () => {
        setResultOpen(false);
        navigate("/subscription");
      });
      setResultOpen(true);
      return;
    }

    const ids = _p.levelIds.map((id) => Number(id)).filter((n) => Number.isFinite(n)) as number[];
    if (!ids.length) return;

    try {
      await addPurchase({ type: "Training", content: ids, sale: Boolean(_p.discountedOM) }).unwrap();
      await refetch();
      openSuccessModal(ids);
    } catch (e: any) {
      const raw = e?.data?.message ?? e?.error ?? "Ошибка покупки";
      const msg = Array.isArray(raw) ? raw[0] : raw;
      const isInsufficient = msg === "Недостаточно ОМ на балансе";
      openErrorModal(msg, isInsufficient);
    }
  };

  const anyModalOpen = modalOpen || resultOpen;
  const backTo = fromState || "/health-lab";

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar title={pageTitle} rightIconUrl={helpIcon} backTo={backTo} />

      <main className="screen" style={{ padding: "5px 16px 0px 16px" }}>
        <div className="levels">
          {!!levelNodes.length && groups.length > 1 && (
            <div className="levels__header">
              <div className="levels__tabs">
                <div className="levels__tabs-title">Уровни</div>
                <Tabs value={group} options={groups.map((n) => ({ label: String(n), value: n }))} onChange={setGroup} />
              </div>
            </div>
          )}

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
              railRight: "-10px",
              railTop: "10px",
              railBottom: "4px",
              railWidth: "3px",
              railColor: "rgba(255, 255, 255, 0.25)",
              thumbColor: "#C7C7C7",
              zIndex: 10,
            }}
          >
            <div className="levels__list" aria-busy={isBuying || isUserLoading}>
              {items.map((l) => (
                <LevelCard key={l.id} item={l} onClick={() => handleCardClick(l)} />
              ))}
            </div>
          </ScrollPanel>

          <LevelPurchaseModal
            open={modalOpen}
            lockedLevels={purchaseLevels}
            defaultSelectedId={clickedId}
            rateText="1 USDT = 1 OM"
            title={levelNodes.length ? `${group} уровень` : "Ступени"}
            onClose={() => setModalOpen(false)}
            onPurchase={purchase}
            isFirstLevel={group === 1}
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