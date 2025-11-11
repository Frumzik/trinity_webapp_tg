// pages/store/index.tsx
import "./store.scss";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Title from "../../shared/ui/title/Title";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";

import Bg1 from "../../assets/icons/bg1.svg";
import OrangeBg from "../../assets/image/Differentbg/orangeBg.svg";
import BgBlue from "../../assets/icons/bgblue.svg";
import CardPlaceholder from "../../assets/icons/products/card5.svg";

import LevelPurchaseModal, { type PurchaseLevel } from "../../widgets/level-purchase-modal";
import Info from "../../assets/icons/popup.svg";

// API
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

// -------- helpers ----------
type Node = {
  _id: string;
  trainingId: number;
  type: string;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  coverUrl?: string | null;
  iconUrl?: string | null;
  accessStatus: "available" | "locked";
  accessRules?: Array<{ type: string; value?: any }>;
  price?: number | null;
  salePrice?: number | null;
  childrens?: Node[];
  lessons?: any[];
};

const hasPaywall = (n: Node) => {
  const rules = n.accessRules ?? [];
  const hasOneTime = rules.some((r) => r?.type === "one_time_payment");
  const priced = (n.price ?? null) !== null || (n.salePrice ?? null) !== null;
  // Показываем всё, что либо явно продаётся, либо закрыто и имеет цену
  return hasOneTime || (n.accessStatus === "locked" && priced);
};

const pickBg = (t?: string) => {
  if (t === "stages_spirit") return Bg1;
  if (t === "course") return OrangeBg;
  return BgBlue;
};

const toPriceText = (price?: number | null, sale?: number | null) => {
  if (sale != null) return `~${price ?? ""} → ${sale} USDT`;
  if (price != null) return `${price} USDT`;
  return "Доступ по оплате";
};

// Свести дерево к списку "товаров" (тренингов/ступеней)
function flattenPaywalled(rootList: Node[]): Node[] {
  const acc: Node[] = [];
  const visit = (n: Node) => {
    if (hasPaywall(n)) acc.push(n);
    (n.childrens ?? []).forEach(visit);
  };
  rootList.forEach(visit);
  // Защитимся от дублей по trainingId
  const byId = new Map<number, Node>();
  acc.forEach((n) => {
    if (!byId.has(n.trainingId)) byId.set(n.trainingId, n);
  });
  return Array.from(byId.values());
}

// ---------- Page ----------
export default function Index() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();
  const allRoots = (data?.data ?? []) as Node[];

  // Список «товаров» для магазина
  const items = useMemo(() => {
    const flat = flattenPaywalled(allRoots);
    // немного приятной сортировки: сначала доступные к покупке со скидкой, потом с ценой, потом просто locked
    return flat.sort((a, b) => {
      const as = a.salePrice != null ? 0 : a.price != null ? 1 : 2;
      const bs = b.salePrice != null ? 0 : b.price != null ? 1 : 2;
      if (as !== bs) return as - bs;
      return String(a.title).localeCompare(String(b.title));
    });
  }, [allRoots]);

  // Покупка
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Node | null>(null);

  const openPurchase = (n: Node) => {
    setSelected(n);
    setModalOpen(true);
  };

  const lockedLevels: PurchaseLevel[] = useMemo(() => {
    if (!selected) return [];
    // Модалка ожидает «уровни», поэтому прокинем один «товар» как уровень.
    const p = selected.salePrice ?? selected.price ?? 0;
    return [
      {
        id: selected.trainingId,
        title: selected.title,
        // у тебя уже встречалась конвертация USDT → OM *5 в других местах
        priceOM: Math.max(1, Math.round(p * 5)),
        oldPriceOM:
          selected.salePrice != null && selected.price != null
            ? Math.round(selected.price * 5)
            : undefined,
        purchased: selected.accessStatus !== "locked",
      },
    ];
  }, [selected]);

  const handleTileClick = (n: Node) => {
    // если закрыто и продаётся — открываем оплату
    if (hasPaywall(n) && n.accessStatus === "locked") {
      openPurchase(n);
      return;
    }
    // иначе — ведём в сам тренинг
    navigate(`/trainings/${n.trainingId}`, {
      state: { returnTo: "/store" },
    });
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <div className="supportPage">
          <Title>Магазин</Title>

          {isLoading && <div style={{ padding: 16 }}>Загрузка…</div>}
          {isError && (
            <div style={{ padding: 16 }}>
              Не удалось загрузить. <button onClick={() => refetch()}>Повторить</button>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="supportPage__cards">
              <ScrollPanel
                maxHeight="62dvh"
                vars={{
                  railRight: "-15px",
                  railTop: "4px",
                  railBottom: "4px",
                  railWidth: "3px",
                  railColor: "#E8E8E8",
                  thumbColor: "#C7C7C7",
                  zIndex: 20,
                }}
              >
                {items.length === 0 && (
                  <div style={{ padding: 16, opacity: 0.7 }}>
                    Пока нет товаров/практик для покупки.
                  </div>
                )}

                {items.map((n) => (
                  <FeatureTile
                    key={n._id}
                    title={n.title}
                    description={
                      n.shortDescription ||
                      n.description ||
                      toPriceText(n.price ?? null, n.salePrice ?? null)
                    }
                    bgImageUrl={pickBg(n.type)}
                    rightImageUrl={n.iconUrl || n.coverUrl || CardPlaceholder}
                    enabled={true}
                    onClick={() => handleTileClick(n)}
                  />
                ))}
              </ScrollPanel>
            </div>
          )}
        </div>
      </main>

      <LevelPurchaseModal
        open={modalOpen}
        lockedLevels={lockedLevels}
        defaultSelectedId={selected?.trainingId}
        rateText="USDT = OM"
        InfoIcon={(props) => <img src={Info} {...props} />}
        onClose={() => setModalOpen(false)}
        onPurchase={(_p) => {
          setModalOpen(false);
          if (selected) {
            navigate(`/trainings/${selected.trainingId}`, { state: { returnTo: "/store" } });
          }
        }}
      />

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  );
}