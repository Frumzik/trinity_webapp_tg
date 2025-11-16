
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
import LevelPurchaseModal, { type PurchaseLevel } from "../../widgets/level-purchase-modal";
import Info from "../../assets/icons/popup.svg";
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";
import Tile1 from '../../assets/homePage/tile1.svg';
import Card1 from '../../assets/homePage/card9.svg';

type Node = {
  _id: string;
  trainingId: number;
  type: "training" | "product";
  tag?: string | null;
  parentId?: number | null;
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

const pickBg = (tag?: string | null) => {
  if (tag === "stages_spirit") return Bg1;
  if (tag === "course") return OrangeBg;
  return BgBlue;
};

const toPriceText = (price?: number | null, sale?: number | null) => {
  if (sale != null) return `~${price ?? ""} → ${sale} USDT`;
  if (price != null) return `${price} USDT`;
  return "Доступ по оплате";
};

const hasPaywall = (n: Node) => {
  const rules = n.accessRules ?? [];
  const oneTime = rules.some((r) => r?.type === "one_time_payment");
  const priced = (n.price ?? null) !== null || (n.salePrice ?? null) !== null;
  return oneTime || (n.accessStatus === "locked" && priced);
};

function flattenPaywalled(roots: Node[]): Node[] {
  const acc: Node[] = [];
  const visit = (n: Node) => {
    if (hasPaywall(n)) acc.push(n);
    (n.childrens ?? []).forEach(visit);
  };
  roots.forEach(visit);
  const byId = new Map<number, Node>();
  acc.forEach((n) => {
    if (!byId.has(n.trainingId)) byId.set(n.trainingId, n);
  });
  return Array.from(byId.values());
}

export default function Index() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();
  const all = (data?.data ?? []) as Node[];

  const roots = useMemo(() => all.filter((n) => n.parentId == null), [all]);

  const items = useMemo(() => {
    const flat = flattenPaywalled(roots);
    return flat
      .filter((n) => n.accessStatus === "locked")
      .sort((a, b) => {
        const as = a.salePrice != null ? 0 : a.price != null ? 1 : 2;
        const bs = b.salePrice != null ? 0 : b.price != null ? 1 : 2;
        if (as !== bs) return as - bs;
        return String(a.title).localeCompare(String(b.title), "ru");
      });
  }, [roots]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Node | null>(null);

  const openPurchase = (n: Node) => {
    setSelected(n);
    setModalOpen(true);
  };

  const lockedLevels: PurchaseLevel[] = useMemo(() => {
    if (!selected) return [];
    const p = selected.salePrice ?? selected.price ?? 0;
    return [
      {
        id: selected.trainingId,
        title: selected.title,
        priceOM: Math.max(1, Math.round(p * 5)),
        oldPriceOM:
          selected.salePrice != null && selected.price != null
            ? Math.round((selected.price || 0) * 5)
            : undefined,
        purchased: selected.accessStatus !== "locked",
      },
    ];
  }, [selected]);

  const handleTileClick = (n: Node) => {
    if (hasPaywall(n) && n.accessStatus === "locked") {
      openPurchase(n);
      return;
    }
    navigate(`/trainings/${n.trainingId}`, { state: { returnTo: "/store" } });
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />
      <main className="screen">
        <div className="supportPage">
          <Title>Лавка Изобилия</Title>

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

                <FeatureTile
                  title="Академия духа"
                  description=""
                  bgImageUrl={Tile1}
                  rightImageUrl={Card1}
                  enabled
                  to="/academy"
                />
                <FeatureTile
                  title="Товары"
                  description="..."
                  bgImageUrl={Tile1}
                  rightImageUrl={Card1}
                  enabled={false}
                  to="/academy"
                />
                <FeatureTile
                  title="Услуги"
                  description="..."
                  bgImageUrl={Tile1}
                  rightImageUrl={Card1}
                  enabled={false}
                  to="/academy"
                />
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