import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../../shared/ui/title/Title";
import GradientButton from "../../shared/ui/gradient-button";
import TopBar from "../../widgets/topbar/topbar";
import Footer from "../../widgets/footer/footer";
import BurgerMenu from "../../widgets/menuBurger/burger";
import PromoTile from "../../widgets/promo-tile";

import Bgmini from "../../assets/homePage/miniTile.svg";
import CardImage1 from "../../assets/homePage/minicard1.svg";
import CardImage2 from "../../assets/homePage/minicard2.svg";
import CardImage3 from "../../assets/homePage/minicard3.svg";
import "./materials.scss";

import SubscriptionRequiredModal from "../../widgets/flexible-modal/subscription-required-modal";
import { useGetUserQuery } from "../../shared/api/user.api";

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  const { data: userRes, isLoading: isUserLoading } = useGetUserQuery({
    populate: true,
  });
  const user = userRes?.data;

  const hasPaidSubscription = useMemo(() => {
    const type = String(user?.subscription?.type || "").toLowerCase();
    return type === "pro" || type === "premium";
  }, [user]);

  const requireSub = (cb: () => void) => {
    if (isUserLoading) return;

    if (!hasPaidSubscription) {
      setModalOpen(true);
      return;
    }

    cb();
  };

  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen favorites">
        <Title>Полезные материалы</Title>

        <div className="promo-container">
          <PromoTile
            title="Фильмы"
            bgSrc={Bgmini}
            imageUrl={CardImage1}
            to={hasPaidSubscription ? "/films" : undefined}
            onClick={() =>
              requireSub(() => {
                navigate("/films");
              })
            }
          />

          <PromoTile
            title="Музыка"
            bgSrc={Bgmini}
            imageUrl={CardImage2}
            href={hasPaidSubscription ? "https://t.me/trinity_music" : undefined}
            onClick={() =>
              requireSub(() => {
                window.open("https://t.me/trinity_music", "_blank", "noopener,noreferrer");
              })
            }
          />

          <PromoTile
            title="Книги"
            bgSrc={Bgmini}
            imageUrl={CardImage3}
            href={hasPaidSubscription ? "https://t.me/trinity_books" : undefined}
            onClick={() =>
              requireSub(() => {
                window.open("https://t.me/trinity_books", "_blank", "noopener,noreferrer");
              })
            }
          />
        </div>
      </main>

      <div className="gbtn-bar">
        <div className="gbtn-bar__inner">
          <GradientButton onClick={() => navigate(-1)}>Назад</GradientButton>
        </div>
      </div>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />

      <SubscriptionRequiredModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGoToSubscription={() => {
          setModalOpen(false);
          navigate("/subscription");
        }}
      />
    </div>
  );
}