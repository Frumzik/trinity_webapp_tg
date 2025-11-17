import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Bg1 from "../../assets/icons/bg1.svg";
import OrangeBg from "../../assets/image/Differentbg/orangeBg.svg";
import Card1 from "../../assets/homePage/tile1.svg";
import Card5 from "../../assets/homePage/tile6.svg";
import Card2 from "../../assets/homePage/card10.svg";
import Card3 from "../../assets/homePage/card11.svg";
import Card4 from "../../assets/homePage/card12.svg";
import "./practise.scss";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

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
  price?: number | null;
  salePrice?: number | null;
};

const pickBg = (tag?: string | null) => (tag === "course" ? OrangeBg : Bg1);
const pickIconFallback = (idx: number) => [Card1, Card2, Card3][idx % 3];
const PRACTICE_TAGS = new Set(["practice", "course"]);

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();

  const roots = useMemo(() => {
    const all = (data?.data ?? []) as Node[];
    return all.filter((n) => n.parentId == null);
  }, [data]);

  const practices = useMemo(() => {
    const only = roots.filter((r) => PRACTICE_TAGS.has(r.tag ?? ""));
    const map = new Map<number, Node>();
    for (const n of only) if (!map.has(n.trainingId)) map.set(n.trainingId, n);
    return [...map.values()].sort((a, b) => a.title.localeCompare(b.title, "ru"));
  }, [roots]);

  const onOpenPractice = (t: Node, idx: number) => {
    if (t.accessStatus === "available") {
      navigate(`/trainings/${t.trainingId}`, { state: { returnTo: location.pathname } });
    } else {
      navigate("/preview", {
        state: {
          trainingId: t.trainingId,
          title: t.title,
          description: t.shortDescription || t.description || "",
          coverUrl: t.coverUrl,
          price: t.salePrice ?? t.price ?? 0,
          bg: pickBg(t.tag),
          icon: t.iconUrl || pickIconFallback(idx),
          returnTo: location.pathname,
        },
      });
    }
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />
      <main className="screen">
        <div className="supportPage">
          <Title>Практики</Title>

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
                  <FeatureTile
                    title={"Многомерная \n"+
                      "Сессия\n" +
                      "Очищения"}
                    bgImageUrl={Card1}
                    rightImageUrl={Card2}
                    enabled
                    onClick={() => navigate("/preview")}
                    className='left-block-big left-block-color'
                  />
                <FeatureTile
                  title={"Сессия Очищения\n"+"и Раскрытия\n"+"Потенциала Рода"}
                  bgImageUrl={Card1}
                  rightImageUrl={Card4}
                  enabled
                  onClick={() => navigate("/practice")}
                  className='left-block-big left-block-color'
                />
                <FeatureTile
                  title={"Консультация\n" + "Мастера"}
                  bgImageUrl={Card5}
                  rightImageUrl={Card3}
                  enabled
                  onClick={() => navigate("/practice")}
                  className={"left-block-color-yellow"}
                />

                {practices.length === 0 && (
                  <div style={{ padding: 16, opacity: 0.7 }}>Пока нет практик</div>
                )}
              </ScrollPanel>
            </div>
          )}
        </div>
      </main>

      <div className="gbtn-bar">
        <div className="gbtn-bar__inner">
          <GradientButton onClick={() => navigate(-1)}>Назад</GradientButton>
        </div>
      </div>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  );
}