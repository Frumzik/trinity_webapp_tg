import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import Tabs from "./ui/Tabs";
import LevelCard from "./ui/LevelCard";
import TopBar from "../../widgets/topbarTextpage";
import helpIcon from "../../assets/icons/helpIcon.svg";
import { levelsData } from "./levels.content";
import Info from "../../assets/icons/popup.svg";
import "./films.scss";
import Footer from "../../widgets/footer/footer";
import LevelPurchaseModal, {
  type PurchaseLevel,
} from "../../widgets/level-purchase-modal";

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

export default function Index() {
  const navigate = useNavigate();
  const [group, setGroup] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickedId, setClickedId] = useState<string | number | undefined>(
    undefined,
  );

  const groups = useMemo(() => {
    const g = new Set<number>();
    levelsData.forEach((l) => g.add(l.group));
    return Array.from(g).sort((a, b) => a - b);
  }, []);

  const items: LevelItem[] = useMemo(
    () => levelsData.filter((l) => l.group === group),
    [group],
  );

  const purchaseLevels: PurchaseLevel[] = useMemo(
    () =>
      items.map((it, idx) => ({
        id: it.id,
        title: it.title,
        priceOM: it.priceUSDT ? Math.round(it.priceUSDT * 5) : 10 + idx * 5,
        oldPriceOM: undefined,
        purchased: it.status !== "locked",
      })),
    [items],
  );

  const handleCardClick = (l: LevelItem) => {
    if (l.status === "locked") {
      setClickedId(l.id);
      setModalOpen(true);
      return;
    }
    navigate(`/levels/${l.id}`);
  };

  const purchase = (_p: {
    levelIds: (string | number)[];
    totalOM: number;
    discountedOM?: number;
  }) => {
    setModalOpen(false);
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar
        title="Фильмы"
        rightIconUrl={helpIcon}
        onRightClick={() =>
            window.open(
                'https://docs.google.com/document/d/19hvbG7ZUQYpfMUF8oNz43oJlOQd-KdTKqMPf8QrWEME/edit?tab=t.0',
                '_blank',
                'noopener,noreferrer'
            )
        }
      />

      <main className="screen" style={{ padding: "5px 16px 0px 16px" }}>
        <div className="levels">
          <div className="levels__header">
            <div className="levels__title">Прогресс</div>

            <div className="levels__tabs">
              <div className="levels__tabs-title">Уровни</div>
              <Tabs
                value={group}
                options={groups.map((n) => ({ label: String(n), value: n }))}
                onChange={setGroup}
              />
            </div>
          </div>

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
            </div>
          </ScrollPanel>

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
