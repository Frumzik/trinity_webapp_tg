import { useEffect, useMemo, useState } from "react";
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

const lpSave = (obj: Record<string, LocalProgress>) => {
  try {
    localStorage.setItem(LP_KEY, JSON.stringify(obj));
  } catch {}
};

const readLegacyLesson = (lessonId: number | string) => {
  try {
    const raw = localStorage.getItem(`lessonProgress:${lessonId}`);
    if (!raw) return null;
    const j = JSON.parse(raw);
    const current = Math.max(0, Math.round(j?.current || 0));
    const duration = Math.max(0, Math.round(j?.duration || 0));
    const completed =
      Boolean(j?.completed) || (duration > 0 && current >= duration);
    return {
      seconds: current,
      duration,
      status: completed ? ("completed" as const) : ("in_progress" as const),
    };
  } catch {
    return null;
  }
};

const lpMigrateFromLegacy = () => {
  const lp = lpLoad();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (!key.startsWith("lessonProgress:")) continue;
      const id = key.split(":")[1];
      if (!id) continue;
      const legacy = readLegacyLesson(id);
      if (legacy) {
        const prev = lp[id];
        lp[id] = prev
          ? {
            seconds: Math.max(prev.seconds || 0, legacy.seconds || 0),
            duration: Math.max(prev.duration || 0, legacy.duration || 0),
            status:
              prev.status === "completed" || legacy.status === "completed"
                ? "completed"
                : "in_progress",
          }
          : legacy;
      }
    }
    lpSave(lp);
  } catch {}
};

const isLessonCompletedLocal = (
  lessonId: number | string,
  store?: Record<string, LocalProgress>
) => {
  const lp = store ?? lpLoad();
  const rec = lp[String(lessonId)] ?? readLegacyLesson(lessonId);
  if (!rec) return false;
  return (
    rec.status === "completed" || (rec.duration > 0 && rec.seconds >= rec.duration)
  );
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

const isTrainingCompletedLocal = (node: BNode) => {
  const lp = lpLoad();
  const lessons = node.lessons ?? [];
  if (!lessons.length) return false;
  return lessons.every(
    (l: any) =>
      l.progressStatus === "completed" ||
      isLessonCompletedLocal(l.lessonId, lp)
  );
};

const minutesFromDuration = (d?: string | null) => {
  if (!d) return undefined;
  const m = d.match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

export default function Index() {
  const navigate = useAppNavigate();
  const location = useLocation();

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
  const { data: userRes, isLoading: isUserLoading } = useGetUserQuery();
  const [fetchUser] = useLazyGetUserQuery();

  const root: BNode | undefined = useMemo(() => {
    const roots = (data?.data ?? []) as BNode[];
    return roots.find((r) => r.tag === "stages_spirit");
  }, [data]);

  const levelNodes: BNode[] = useMemo(() => {
    const arr = (root?.childrens ?? []) as BNode[];
    const onlyLevels = arr.filter(
      (n) => n.tag === "stage_level" || typeof n.stageLevel === "number"
    );
    return [...onlyLevels].sort((a, b) => {
      const A = a.stageLevel ?? numFromTitle(a.title) ?? 0;
      const B = b.stageLevel ?? numFromTitle(b.title) ?? 0;
      return A - B;
    });
  }, [root]);

  const [backTo, setBackTo] = useState<string>("/home");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromQuery = searchParams.get("from");
    const fromState = (location.state as any)?.from;
    const stored = sessionStorage.getItem("levelsBackTo");
    const next = fromQuery || fromState || stored || "/home";

    setBackTo(next);

    if (fromQuery || fromState) {
      try {
        sessionStorage.setItem("levelsBackTo", next);
      } catch {}
    }
  }, [location]);

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
    () =>
      levelNodes.find(
        (n) => (n.stageLevel ?? numFromTitle(n.title)) === group
      ),
    [levelNodes, group]
  );

  const stages: BNode[] = useMemo(() => {
    return ((currentLevel?.childrens ?? []) as BNode[]).filter(
      (s) => s.tag === "stage" || typeof s.stage === "number"
    );
  }, [currentLevel]);

  const items: LevelItem[] = useMemo(() => {
    return stages.map((s): LevelItem => {
      const doneLocal = isTrainingCompletedLocal(s);

      const status: LevelItem["status"] =
        s.progressStatus === "completed" || doneLocal
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
        image: s.coverUrl || "",
        status,
        priceUSDT: s.salePrice ?? s.price ?? undefined,
        description: s.shortDescription || s.description || "",
      };
    });
  }, [stages, group]);

  const purchaseLevels: PurchaseLevel[] = useMemo(
    () =>
      stages.map((s, idx) => {
        const status: LevelItem["status"] =
          s.progressStatus === "completed" || isTrainingCompletedLocal(s)
            ? "done"
            : s.accessStatus === "available"
              ? "available"
              : "locked";

        const stepIndex =
          typeof s.stage === "number"
            ? s.stage
            : numFromTitle(s.title) ?? idx;

        return {
          id: String(s.trainingId),
          title: s.title,
          price: s.salePrice ?? s.price ?? 0,
          salePrice: s.salePrice != null ? s.price ?? undefined : undefined,
          purchased: status !== "locked",
          stepIndex,
        };
      }),
    [stages]
  );

  const handleCardClick = (l: LevelItem) => {
    if (l.status === "locked") {
      setClickedId(l.id);
      setModalOpen(true);
    } else {
      navigate(`/level/${l.id}`, { state: { returnTo: location.pathname } });
    }
  };

  const buildStepTitle = (count: number) => {
    const lastTwo = count % 100;
    const last = count % 10;

    if (lastTwo >= 11 && lastTwo <= 14) {
      return `${count} ступеней Духа открыто`;
    }

    if (last === 1) {
      return `${count} ступень Духа открыта`;
    }

    if (last >= 2 && last <= 4) {
      return `${count} ступени Духа открыты`;
    }

    return `${count} ступеней Духа открыто`;
  };

  const openSuccessModal = (openedIds: number[]) => {
    if (!openedIds.length) return;

    const openedLevels = purchaseLevels.filter((pl) =>
      openedIds.includes(Number(pl.id))
    );

    const titleText = buildStepTitle(openedIds.length);

    setResultTitle(titleText);
    setResultItems(undefined);
    setResultDesc(undefined);
    setResultCta("Перейти");

    const first = openedLevels[0];

    setResultOnCta(
      () =>
        first
          ? () =>
            navigate(`/level/${first.id}`, {
              state: { returnTo: "/levels" },
            })
          : () => setResultOpen(false)
    );

    setResultOpen(true);
  };

  const openErrorModal = (message?: string | string[], isInsufficient?: boolean) => {
    const msg = Array.isArray(message) ? message.join("\n") : message;

    setResultTitle(
      msg || (isInsufficient ? "Недостаточно OM на балансе" : "Произошла ошибка")
    );
    setResultItems(undefined);

    setResultCta(isInsufficient ? "Добавить OM" : "Продолжить");

    setResultOnCta(
      () => () => {
        if (isInsufficient) {
          navigate("/wallet");
          setResultOpen(false);
        } else {
          setResultOpen(false);
        }
      }
    );

    setResultOpen(true);
  };

  const purchase = async (_p: {
    levelIds: (string | number)[];
    totalOM: number;
    discountedOM?: number;
  }) => {
    setModalOpen(false);

    let hasPaidSubscription = false;

    try {
      const freshUser = await fetchUser().unwrap();
      const subscriptionType = freshUser?.data?.subscription?.type;
      hasPaidSubscription =
        subscriptionType === "pro" || subscriptionType === "premium";
    } catch (err) {
      console.error("Не удалось обновить данные пользователя перед покупкой", err);
      const fallbackType = userRes?.data.subscription?.type;
      hasPaidSubscription =
        fallbackType === "pro" || fallbackType === "premium";
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

    const ids = _p.levelIds
      .map((id) => Number(id))
      .filter((n) => Number.isFinite(n)) as number[];
    if (ids.length === 0) return;

    try {
      await addPurchase({
        type: "Training",
        content: ids,
        sale: Boolean(_p.discountedOM),
      }).unwrap();

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
        backTo={backTo}
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
            title={`${group} уровень`}
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