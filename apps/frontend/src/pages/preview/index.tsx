import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import GradientButton from "../../shared/ui/gradient-button";
import Hero from "./ui/Hero";
import TopActions from "./ui/TopActions";
import Sheet from "./ui/Sheet";
import Price from "./ui/Price";
import TextPage from "../../shared/ui/TextPage";
import { previewBlocks, previewPrice } from "./content";
import Card1 from "../../assets/image/bg.svg";
import "./preview.scss";

function toSections(blocks: { title: string; text: string }[]) {
  return blocks.map((b) => ({
    title: b.title,
    paragraphs: b.text.trim().split(/\n{2,}/g),
  }));
}

export default function Index() {
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);

  return (
    <div className="preview">
      <Hero imageSrc={Card1} title="Гипнотерапевт">
        <TopActions
          isFav={fav}
          onBack={() => navigate(-1)}
          onToggleFav={() => setFav((v) => !v)}
          onMenu={() => {}}
        />
      </Hero>

      <Sheet head="Описание">
        <ScrollPanel
          maxHeight="38dvh"
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
          <TextPage
            sections={toSections(previewBlocks)}
            className="preview__text"
          />
        </ScrollPanel>
        <Price value={previewPrice} />
        <GradientButton className="preview__cta">Приобрести</GradientButton>
      </Sheet>
    </div>
  );
}
