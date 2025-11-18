// pages/preview/index.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import GradientButton from "../../shared/ui/gradient-button";
import Hero from "./ui/Hero";
import TopActions from "./ui/TopActions";
import Sheet from "./ui/Sheet";
import Price from "./ui/Price";
import "./preview.scss";

import { useAddPurchaseMutation } from "../../shared/api/purchase.api";
import { useGetUserTrainingByIdQuery } from "../../shared/api/learning.api";
import type { LearningNode } from "../../shared/api/learning.api";

import FlexibleModal from "../../widgets/flexible-modal"; // путь поправь под себя
import helpIcon from "../../assets/icons/closeIcon.png";      // сюда нужную иконку

type State = {
  trainingId: number;
  returnTo?: string;
};

type ModalKind = "success" | "no-balance" | "error";

export default function PreviewPage() {
  const navigate = useNavigate();

  const st = (useLocation().state || {}) as Partial<State>;
  const trainingId = st.trainingId;

  // ------- состояние модалки результата -------
  const [resultOpen, setResultOpen] = useState(false);
  const [resultKind, setResultKind] = useState<ModalKind>("success");
  const [resultTitle, setResultTitle] = useState("");
  const [resultItems, setResultItems] = useState<string[] | undefined>();
  const [resultDesc, setResultDesc] = useState<string | undefined>();
  const [resultCta, setResultCta] = useState<string | undefined>();
  const [resultOnCta, setResultOnCta] = useState<(() => void) | undefined>();

  // если trainingId нет – уходим назад
  useEffect(() => {
    if (!trainingId) {
      navigate(st.returnTo || "/", { replace: true });
    }
  }, [trainingId, navigate, st.returnTo]);

  if (!trainingId) return null;

  // грузим практику / тренинг
  const { data, isLoading, isError } = useGetUserTrainingByIdQuery({
    id: trainingId,
  }) as {
    data?: { success: true; data: LearningNode };
    isLoading: boolean;
    isError: boolean;
  };

  const node = data?.data;
  const title = node?.title || "Практика";
  const descHtml = node?.description || "";
  const image = (node as any)?.bgUrl || node?.coverUrl || undefined;
  const price = node?.salePrice ?? node?.price ?? 0;

  const [addPurchase, { isLoading: isBuying }] = useAddPurchaseMutation();

  const handlePurchase = async () => {
    try {
      await addPurchase({
        type: "Training",
        content: [trainingId],
      }).unwrap();

      // ------- успешная покупка -------
      setResultKind("success");
      setResultTitle("Успешно");
      setResultItems(undefined);
      setResultDesc(
        "Специалист свяжется с Вами в ближайшее время для согласования времени практики"
      );
      setResultCta("Обновить");
      // важно: оборачиваем в функцию, чтобы не вызвать сразу
      setResultOnCta(() => () => window.location.reload());
      setResultOpen(true);
    } catch (e: any) {
      const rawMsg: string | undefined = e?.data?.message?.[0] || e?.error;

      const isBalanceError =
        rawMsg && rawMsg.toLowerCase().includes("баланс");

      if (isBalanceError) {
        // ------- мало баланса -------
        setResultKind("no-balance");
        setResultTitle("Недостаточно баланса\nдля совершения платежа");
        setResultItems(undefined);
        setResultDesc(rawMsg);
        setResultCta("Пополнить");
        // сюда потом подвяжешь экран пополнения
        setResultOnCta(() => () => {
          // navigate("/balance");
          setResultOpen(false);
        });
      } else {
        // ------- общая ошибка -------
        setResultKind("error");
        setResultTitle("");
        setResultItems(undefined);
        setResultDesc(
          rawMsg ||
          "Покупка не оформлена. Попробуй ещё раз."
        );
        setResultCta("Понятно");
        setResultOnCta(() => () => setResultOpen(false));
      }

      setResultOpen(true);
    }
  };

  return (
    <div className="preview">
      <Hero imageSrc={image} title={title}>
        <TopActions
          isFav={false}
          onBack={() => navigate(-1)}
          onToggleFav={() => {}}
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
              <div
                className="preview__text"
                dangerouslySetInnerHTML={{ __html: descHtml }}
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
      <FlexibleModal
        open={resultOpen}
        title={resultTitle}
        items={resultItems}
        description={resultDesc}
        ctaLabel={resultCta}
        onCta={resultOnCta}
        closeIconUrl={helpIcon}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}