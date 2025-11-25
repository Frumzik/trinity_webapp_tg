import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserQuery } from "../../api/user.api";
import { hasPaidSubscription } from "../subscription";

export function useSubscriptionGuard() {
  const navigate = useNavigate();

  const { data: userRes, isLoading: isUserLoading } = useGetUserQuery({
    populate: true,
  });
  const user = userRes?.data;

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(
    null
  );

  const hasAccess = useMemo(() => {
    const ok = hasPaidSubscription(user);
    console.log("[guard] userId =", user?.userId, "hasAccess =", ok);
    return ok;
  }, [user]);

  const requireSubscription = useCallback(
    (action?: () => void) => {
      console.log(
        "[guard] requireSubscription",
        "loading=",
        isUserLoading,
        "hasAccess=",
        hasAccess
      );

      if (isUserLoading) return;

      if (hasAccess) {
        console.log("[guard] ACCESS OK -> run action");
        action?.();
      } else {
        console.log("[guard] NO ACCESS -> open modal");
        setPendingAction(action || null);
        setModalOpen(true);
      }
    },
    [hasAccess, isUserLoading]
  );

  const handleGoToSubscription = useCallback(() => {
    setModalOpen(false);
    navigate("/subscription");
  }, [navigate]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setPendingAction(null);
  }, []);

  return {
    hasAccess,
    isUserLoading,
    requireSubscription,
    modalOpen,
    handleGoToSubscription,
    handleCloseModal,
  };
}