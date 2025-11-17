import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import GradientButton from "../../shared/ui/gradient-button";
import Hero from "./ui/Hero";
import TopActions from "./ui/TopActions";
import Sheet from "./ui/Sheet";
import Price from "./ui/Price";
import TextPage from "../../shared/ui/TextPage";
import "./preview.scss";

import { useAddPurchaseMutation } from "../../shared/api/purchase.api";

const toSections = (text: string) => [
  { title: "", paragraphs: text.trim() ? [text] : [] },
];

type State = {
  trainingId: number;
  title: string;
  description: string;
  coverUrl?: string | null;
  bg?: string;
  icon?: string;
  price: number;
  returnTo?: string;
};

export default function Index() {
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);
  const st = (useLocation().state || {}) as Partial<State>;

  const title = st.title || "Тренинг";
  const desc = st.description || "";
  const image = st.bg || st.coverUrl || undefined;

  const [addPurchase, { isLoading }] = useAddPurchaseMutation();

  const handlePurchase = async () => {
    if (!st.trainingId) {
      alert("Не указан trainingId для покупки")
      navigate(st.returnTo || "/", { replace: true })
      return
    }
    try {
      await addPurchase({ trainingId: st.trainingId }).unwrap()
      navigate(`/trainings/${st.trainingId}`, { replace: true })
    } catch (e: any) {
      const msg =
        e?.data?.message?.[0] ||
        e?.error ||
        "Покупка не оформлена. Попробуй ещё раз."
      alert(msg)
    }
  }

  return (
    <div className="preview">
      <Hero imageSrc={image} title={title}>
        <TopActions
          isFav={fav}
          onBack={() => navigate(-1)}
          onToggleFav={() => setFav((v) => !v)}
          onMenu={() => {}}
        />
      </Hero>

      <Sheet head="Описание">
        <ScrollPanel
          maxHeight="33dvh"
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
          <TextPage sections={toSections(desc)} className="preview__text" />
        </ScrollPanel>

        <Price value={st.price ?? 0} />
        <GradientButton
          className="preview__cta"
          onClick={handlePurchase}
          disabled={isLoading}
        >
          {isLoading ? "Покупка..." : "Приобрести"}
        </GradientButton>
      </Sheet>
    </div>
  );
}