// pages/preview/index.tsx
import { useEffect, useMemo, useState } from "react";
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
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

const toSections = (text: string) => [
  { title: "", paragraphs: text.trim() ? [text] : [] },
];

type State = {
  trainingId: number;
  returnTo?: string;
};

type TrainingResponse = {
  data: {
    trainingId: number;
    title: string;
    description?: string | null;
    shortDescription?: string | null;
    coverUrl?: string | null;
    iconUrl?: string | null;
    price?: number | null;
    salePrice?: number | null;
  };
};

const stripHtml = (html?: string | null) =>
  (html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .trim();

export default function PreviewPage() {
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);

  const st = (useLocation().state || {}) as Partial<State>;
  const trainingId = st.trainingId;

  // если trainingId нет – уходим назад
  useEffect(() => {
    if (!trainingId) {
      navigate(st.returnTo || "/", { replace: true });
    }
  }, [trainingId, navigate, st.returnTo]);

  if (!trainingId) return null;

  // тянем конкретный тренинг/практику по id
  const { data, isLoading, isError } = useGetTrainingTreeQuery(
    trainingId
  ) as {
    data?: TrainingResponse;
    isLoading: boolean;
    isError: boolean;
  };

  const node = data?.data;

  const title = node?.title || "Практика";
  const desc =
    stripHtml(node?.shortDescription) || stripHtml(node?.description) || "";
  const image = node?.coverUrl || undefined;
  const price = node?.salePrice ?? node?.price ?? 0;

  const [addPurchase, { isLoading: isBuying }] = useAddPurchaseMutation();

  const handlePurchase = async () => {
    try {
      await addPurchase({ trainingId }).unwrap();
      navigate(`/trainings/${trainingId}`, { replace: true });
    } catch (e: any) {
      const msg =
        e?.data?.message?.[0] ||
        e?.error ||
        "Покупка не оформлена. Попробуй ещё раз.";
      alert(msg);
    }
  };

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
        {isLoading && (
          <div style={{ padding: 16 }}>Загрузка описания…</div>
        )}

        {isError && !isLoading && (
          <div style={{ padding: 16 }}>
            Не удалось загрузить описание. Попробуй ещё раз позже.
          </div>
        )}

        {!isLoading && !isError && (
          <>
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
              <TextPage
                sections={toSections(desc)}
                className="preview__text"
              />
            </ScrollPanel>

            <Price value={price} />

            <GradientButton
              className="preview__cta"
              onClick={handlePurchase}
              disabled={isBuying}
            >
              {isBuying ? "Покупка..." : "Приобрести"}
            </GradientButton>
          </>
        )}
      </Sheet>
    </div>
  );
}