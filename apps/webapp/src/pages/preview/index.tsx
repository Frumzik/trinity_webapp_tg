import { useEffect, useState, useMemo } from "react";
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
import {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useDeleteFavoriteMutation,
} from "../../shared/api/favorites.api";
import type { LearningNode } from "../../shared/api/learning.api";
import { useGetUserQuery } from "../../shared/api/user.api";

import FlexibleModal from "../../widgets/flexible-modal";
import helpIcon from "../../assets/icons/closeIcon.png";

type State = {
  trainingId: number;
  returnTo?: string;
};

type ModalKind = "success" | "no-balance" | "error";

export default function PreviewPage() {
  const navigate = useNavigate();

  const st = (useLocation().state || {}) as Partial<State>;
  const trainingId = st.trainingId;

  const [resultOpen, setResultOpen] = useState(false);
  const [resultKind, setResultKind] = useState<ModalKind>("success");
  const [resultTitle, setResultTitle] = useState("");
  const [resultItems, setResultItems] = useState<string[] | undefined>();
  const [resultDesc, setResultDesc] = useState<string | undefined>();
  const [resultCta, setResultCta] = useState<string | undefined>();
  const [resultOnCta, setResultOnCta] = useState<(() => void) | undefined>();

  useEffect(() => {
    if (!trainingId) {
      navigate(st.returnTo || "/", { replace: true });
    }
  }, [trainingId, navigate, st.returnTo]);

  if (!trainingId) return null;

  const { data, isLoading, isError } = useGetUserTrainingByIdQuery({
    id: trainingId,
  }) as {
    data?: { success: true; data: LearningNode };
    isLoading: boolean;
    isError: boolean;
  };
  const { data: favoritesData } = useGetFavoritesQuery();
  const favoriteEntries = useMemo(
    () =>
      (favoritesData ?? []).flatMap((cat) => cat.favorites),
    [favoritesData]
  );
  const isFav = useMemo(
    () =>
      favoriteEntries.some(
        (f) =>
          f.type === "Training" &&
          (f.trainingId === trainingId || f.favoriteId === trainingId)
      ),
    [favoriteEntries, trainingId]
  );
  const { data: userRes, isLoading: isUserLoading } = useGetUserQuery();
  const subscriptionType = userRes?.data.subscription?.type;
  const hasPaidSubscription =
    subscriptionType === "pro" || subscriptionType === "premium";

  const node = data?.data;
  const title = node?.title || "Практика";
  const descHtml = node?.description || "";
  const image = (node as any)?.bgUrl || node?.coverUrl || undefined;
  const price = node?.salePrice ?? node?.price ?? 0;

  const [addPurchase, { isLoading: isBuying }] = useAddPurchaseMutation();
  const [addFavorite] = useAddFavoriteMutation();
  const [deleteFavorite] = useDeleteFavoriteMutation();
  const isTraining = node?.type === "training";
  const isPractise = node?.type === "practise" || node?.tag === "practise";


  const handleToggleFav = async () => {
    try {
      if (isFav) {
        await deleteFavorite({ type: "Training", trainingId }).unwrap();
      } else {
        await addFavorite({ type: "Training", trainingId }).unwrap();
      }
    } catch (e) {
      console.error("favorite toggle error", e);
    }
  };


  const handlePurchase = async () => {
    if (!hasPaidSubscription) {
      setResultKind("error");
      setResultTitle("Недоступно");
      setResultItems(undefined);
      setResultDesc("У вас не активен доступ к приложению");
      setResultCta("Активировать");
      setResultOnCta(() => () => {
        setResultOpen(false);
        navigate("/subscription");
      });
      setResultOpen(true);
      return;
    }

    try {
      await addPurchase({
        type: "Training",
        content: [trainingId],
      }).unwrap();

      if (isTraining) {
        if (typeof window !== "undefined") {
          const key = `training_bought_${trainingId}`;
          window.localStorage.setItem(key, "1");
        }

        navigate(`/trainings/${trainingId}`, {
          replace: true,
          state: { returnTo: st.returnTo || "/workshop" },
        });
        return;
      }

      if (isPractise) {
        setResultKind("success");
        setResultTitle("Успешно");
        setResultItems(undefined);
        setResultDesc(
          "Специалист свяжется с Вами в ближайшее время для согласования времени практики"
        );
        setResultOnCta(() => () => setResultOpen(false));
        setResultOpen(true);
        return;
      }

      setResultKind("success");
      setResultTitle("Успешно");
      setResultItems(undefined);
      setResultDesc("Покупка оформлена.");
      setResultCta("Понятно");
      setResultOnCta(() => () => setResultOpen(false));
      setResultOpen(true);
    } catch (e: any) {
      const rawMsg: string | undefined = e?.data?.message?.[0] || e?.error;
      const isBalanceError =
        rawMsg && rawMsg.toLowerCase().includes("баланс");

      if (isBalanceError) {
        setResultKind("no-balance");
        setResultTitle("Недостаточно баланса\nдля совершения платежа");
        setResultItems(undefined);
        setResultDesc(rawMsg);
        setResultCta("Пополнить");
        setResultOnCta(() => () => {
          setResultOpen(false);
        });
      } else {
        setResultKind("error");
        setResultTitle("");
        setResultItems(undefined);
        setResultDesc(
          rawMsg || "Покупка не оформлена. Попробуй ещё раз."
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
          isFav={isFav}
          onBack={() => navigate(-1)}
          onToggleFav={handleToggleFav}
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
              disabled={isBuying || isUserLoading}
            >
              {isBuying ? "Покупка..." : "Пройти"}
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