import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import FeatureTile from "../../widgets/tiles/FeatureTile";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

import Bg1 from "../../assets/icons/bg1.svg";
import OrangeBg from "../../assets/image/Differentbg/orangeBg.svg";
import Bgblue from "../../assets/icons/bgblue.svg";

import "./products.scss";

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetTrainingTreeQuery();

  const trainings =
    data?.data?.filter((item) => item.parentId === null) ?? [];

  const handleClick = (training: any) => {
    if (training.type === 'stages_spirit') {
      navigate('/levels')
    } else {
      navigate(`/trainings/${training.trainingId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="app">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <main className="screen">
          <div className="supportPage">
            <Title>Все продукты</Title>
            <p style={{ textAlign: "center", marginTop: 40 }}>Загрузка...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="app">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <main className="screen">
          <div className="supportPage">
            <Title>Все продукты</Title>
            <p style={{ textAlign: "center", color: "red", marginTop: 40 }}>
              Ошибка загрузки данных
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <div className="supportPage">
          <Title>Все продукты</Title>

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
              {trainings.map((t) => (
                <FeatureTile
                  key={t._id}
                  title={t.title}
                  description={t.shortDescription || ""}
                  bgImageUrl={
                    t.type === "stages_spirit"
                      ? Bg1
                      : t.type === "course"
                        ? OrangeBg
                        : Bgblue
                  }
                  rightImageUrl={t.iconUrl || Bg1}
                  enabled={t.accessStatus === "available"}
                  onClick={() => handleClick(t)}
                />
              ))}
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