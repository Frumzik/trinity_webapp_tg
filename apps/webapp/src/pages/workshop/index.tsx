import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";

import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

import Bg1 from "../../assets/homePage/tile1.png";
import Card1 from "../../assets/image/level/genkeys.svg";
import Card2 from "../../assets/image/bg.svg";

import "./workshop.scss";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery();

  const workshopRoot: BNode | undefined = useMemo(() => {
    const roots = (data?.data ?? []) as BNode[];
    const byType =
      roots.find((r) => r.type === "workshop") ||
      roots.find((r) => r.type === "knowledge_workshop");
    if (byType) return byType;
    return roots.find((r) =>
      (r.title || "").toLowerCase().includes("мастерская")
    );
  }, [data]);

  const tiles = useMemo(() => {
    const items = (workshopRoot?.childrens ?? []) as BNode[];
    return items.map((n) => ({
      id: n.trainingId,
      title: n.title,
      description: n.description ?? "",
      coverUrl: n.coverUrl ?? undefined,
      enabled: n.accessStatus !== "locked",
    }));
  }, [workshopRoot]);

  const openCourse = (id: number) => {
    navigate(`/trainings/${id}`);
  };
  const openGenKeys = () => {
    navigate('/preview', {
      state: {
        trainingId: 100,
        title: 'Курс: Генные ключи',
        description:
          'Это глубокая трансформационная практика, направленная на освобождение от родовых программ, эмоций и ограничений, передававшихся из поколения в поколение.\n' +
          '\n' +
          'Каждый из нас связан со своим Родом через генетическую и энергетическую память. Мы несём в себе не только силу и дары предков, но и их непрожитые чувства, обиды, страхи, боли и разрушительные сценарии. \n' +
          '\n' +
          'Эти невидимые нити могут проявляться в виде:\n' +
          '\n' +
          'повторяющихся жизненных ситуаций;\n' +
          'сложностей во взаимоотношениях;\n' +
          'финансовых блоков и страха изобилия;\n' +
          'проблем со здоровьем или хронической усталости;\n' +
          'чувства вины, обиды, тревоги без видимой причины.\n' +
          '\n' +
          'Во время сессии происходит:\n' +
          '\n' +
          'очищение энергетических каналов Рода от деструктивных эмоций и программ;\n' +
          'освобождение от чужих энергий и наследованных страхов;\n' +
          'исцеление боли предков, закреплённой в клеточной памяти;\n' +
          'восстановление гармоничного потока родовой энергии;\n' +
          'активация силы, поддержки и благословения вашего Рода.\n' +
          'В результате вы ощущаете лёгкость, внутреннюю свободу, ощущение целостности и поддержки, уходят внутренние конфликты, и на место старых сценариев приходит состояние доверия, уверенности и внутреннего покоя.\n' +
          'Для кого подходит эта сессия:\n' +
          'для тех, кто ощущает эмоциональные или энергетические блоки;\n' +
          'для людей, сталкивающихся с повторяющимися трудностями в жизни, отношениях, финансах;\n' +
          'для тех, кто хочет восстановить связь со своими корнями и раскрыть потенциал своего \nРода;\n' +
          'для тех, кто чувствует призыв к глубокому внутреннему очищению и перерождению.\n' +
          '\n' +
          '\n' +
          '3 раздел - Консультация мастера.➡️ (ценность 150 ОМ). 1 - 2 часа.\n' +
          '\n' +
          'Индивидуальное сопровождение от мастера Тринити.\n' +
          'Во время консультации можно проработать любой личный запрос — от здоровья и отношений до предназначения и внутренней трансформации.\n' +
          '\n' +
          'Краткие описания для практик для всплывающего окна, которое появляется по ходу прохождения ступеней как предложение:\n' +
          '\n' +
          '🔹 Многомерная сессия очищения.\n' +
          '🕰 2–4 часа 💎 Ценность: 500 ОМ\n' +
          'Глубинная практика освобождения от энергетических блоков, негативных и деструктивных программ. Во время сессии происходит очищение на всех уровнях и планах — физическом, эмоциональном, ментальном и духовном.\n' +
          '\n' +
          '🔹 Сессия очищения и раскрытие потенциала Рода\n' +
          '🕰 1–2 часа 💎 Ценность: 300 ОМ\n' +
          'Энергетическая работа с родовой системой, направленная на очищение кармических узлов, восстановление силы и поддержки рода.\n' +
          '\n' +
          '🔹 Консультация Мастера\n' +
          '🕰 1–2 часа 💎 Ценность: 150 ОМ\n' +
          'Индивидуальное сопровождение от мастера Тринити. Во время консультации можно проработать любой личный запрос — от здоровья и отношений до предназначения и внутренней трансформации.\n',

        coverUrl: Card2,
        price: 5000,
        returnTo: '/workshop',
      },
    });
  };
  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <div className="supportPage">
          <Title>Мастерская знаний</Title>

          {isLoading && (
            <div style={{ padding: 12, opacity: 0.7 }}>Загрузка…</div>
          )}
          {/*{isError && (*/}
          {/*  <div style={{ padding: 12 }}>*/}
          {/*    Не удалось загрузить данные.{" "}*/}
          {/*    <button onClick={() => refetch()}>Повторить</button>*/}
          {/*  </div>*/}
          {/*)}*/}

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
                  title="Курс: Генные ключи"
                  description=""
                  bgImageUrl={Bg1}
                  rightImageUrl={Card1}
                  enabled
                  className={"left-block-color"}
                  onClick={openGenKeys}
                />

              {/*{tiles.map((t) => (*/}
              {/*  <FeatureTile*/}
              {/*    key={t.id}*/}
              {/*    title={t.title}*/}
              {/*    description={t.description}*/}
              {/*    bgImageUrl={Bg1}*/}
              {/*    rightImageUrl={t.coverUrl || Card1}*/}
              {/*    enabled={t.enabled}*/}
              {/*    onClick={() => t.enabled && openCourse(t.id)}*/}
              {/*  />*/}
              {/*))}*/}
            </ScrollPanel>
          </div>
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