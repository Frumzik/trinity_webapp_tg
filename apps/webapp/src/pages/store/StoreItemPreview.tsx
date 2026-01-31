import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import GradientButton from "../../shared/ui/gradient-button";
import Hero from "../preview/ui/Hero";
import Sheet from "../preview/ui/Sheet";
import Price from "../preview/ui/Price";
import FlexibleModal from "../../widgets/flexible-modal";
import helpIcon from "../../assets/icons/closeIcon.png";

import { useAddPurchaseMutation } from "../../shared/api/purchase.api";
import { useGetUserTrainingByIdQuery } from "../../shared/api/learning.api";
import { useGetUserQuery } from "../../shared/api/user.api";
import PreviewTopActions from '../../shared/ui/top-actions/TopActions';

const PENDING_KEY = "pendingContactOrderId";

export default function StoreItemPreview({ trainingId, returnTo, onAfterPurchase }) {
  const navigate = useNavigate();
  const params = useParams();
  const [sp] = useSearchParams();

  const urlTrainingId = useMemo(() => Number(params.trainingId), [params.trainingId]);
  const safeTrainingId = trainingId ?? (Number.isFinite(urlTrainingId) ? urlTrainingId : 0);

  const safeReturnTo = useMemo(() => {
    if (returnTo) return returnTo;
    const rt = sp.get("returnTo");
    return rt ? decodeURIComponent(rt) : "/store";
  }, [returnTo, sp]);

  const [resultOpen, setResultOpen] = useState(false);
  const [resultKind, setResultKind] = useState("success");
  const [resultTitle, setResultTitle] = useState("");
  const [resultItems, setResultItems] = useState(undefined);
  const [resultDesc, setResultDesc] = useState(undefined);
  const [resultCta, setResultCta] = useState(undefined);
  const [resultOnCta, setResultOnCta] = useState(undefined);

  useEffect(() => {
    if (!safeTrainingId) navigate(safeReturnTo || "/store", { replace: true });
  }, [safeTrainingId, navigate, safeReturnTo]);

  const { data, isLoading, isError } = useGetUserTrainingByIdQuery(
    { id: safeTrainingId },
    { skip: !safeTrainingId }
  );

  const node = data?.data;
  const title = node?.title || "Загрузка...";
  const descHtml = node?.description || "";
  const image = node?.bgUrl || node?.coverUrl || undefined;
  const price = node?.salePrice ?? node?.price ?? 0;

  const isTraining = node?.type === "training";
  const isPractise = node?.type === "practise" || node?.tag === "practise";

  const { data: userRes, isLoading: isUserLoading } = useGetUserQuery({ populate: true });
  const subscriptionType = userRes?.data?.subscription?.type;
  const hasPaidSubscription = subscriptionType === "pro" || subscriptionType === "premium";

  const [addPurchase, { isLoading: isBuying }] = useAddPurchaseMutation();

  const handlePurchase = async () => {
    if (!hasPaidSubscription) {
      setResultKind("error");
      setResultTitle("Недоступно");
      setResultItems(undefined);
      setResultDesc("У вас неактивен доступ к приложению");
      setResultCta("Активировать");
      setResultOnCta(() => () => {
        setResultOpen(false);
        navigate("/subscription");
      });
      setResultOpen(true);
      return;
    }

    const purchaseType = isPractise ? "Practise" : "Training";

    try {
      await addPurchase({ type: purchaseType, content: [safeTrainingId] }).unwrap();

      if (isTraining) {
        try {
          window.localStorage.setItem(`training_bought_${safeTrainingId}`, "1");
        } catch {}

        navigate(`/trainings/${safeTrainingId}`, {
          replace: true,
          state: { returnTo: safeReturnTo || "/store" },
        });
        return;
      }

      if (isPractise) {
        const orderId = String(Date.now());
        try {
          localStorage.setItem(PENDING_KEY, orderId);
        } catch {}

        if (onAfterPurchase) {
          onAfterPurchase({ orderId, trainingId: safeTrainingId });
          return;
        }

        navigate(`${safeReturnTo}/contact?orderId=${orderId}`, { replace: true });
        return;
      }

      setResultKind("success");
      setResultTitle("Успешно");
      setResultItems(undefined);
      setResultDesc("Покупка оформлена.");
      setResultCta("Понятно");
      setResultOnCta(() => () => setResultOpen(false));
      setResultOpen(true);
    } catch (e) {
      const status = e?.status;
      const raw = Array.isArray(e?.data?.message) ? e.data.message[0] : e?.data?.message ?? e?.error;
      const msg = typeof raw === "string" && raw.trim() ? raw : "Покупка не оформлена. Попробуй ещё раз.";

      if (status === 409) {
        setResultKind("no-balance");
        setResultTitle("Недостаточно ОМ на балансе");
        setResultItems(undefined);
        setResultDesc("");
        setResultCta("Добавить ОМ");
        setResultOnCta(() => () => {
          setResultOpen(false);
          navigate("/wallet");
        });
      } else {
        setResultKind("error");
        setResultTitle(msg);
        setResultItems(undefined);
        setResultDesc("");
        setResultCta("Понятно");
        setResultOnCta(() => () => setResultOpen(false));
      }

      setResultOpen(true);
    }
  };

  return (
    <div className="preview">
      <Hero imageSrc={image} title={title}>
        <PreviewTopActions
          trainingId={safeTrainingId}
          onBack={() => navigate(-1)}
          onMenu={() => {}}
        />
      </Hero>

      <Sheet head="Описание">
        {isLoading && <div style={{ padding: 16 }}>Загрузка описания…</div>}

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
              <div className="preview__text" dangerouslySetInnerHTML={{ __html: descHtml }} />
            </ScrollPanel>

            <Price value={price} />

            <GradientButton className="preview__cta" onClick={handlePurchase} disabled={isBuying || isUserLoading}>
              {isBuying ? "Покупка..." : "Купить"}
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