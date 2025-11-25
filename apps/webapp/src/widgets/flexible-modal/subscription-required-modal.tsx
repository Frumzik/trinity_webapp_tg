import FlexibleModal from "../flexible-modal";
import helpIcon from "../../assets/icons/helpIcon.svg";

type Props = {
  open: boolean;
  onClose: () => void;
  onGoToSubscription: () => void;
};

export default function SubscriptionRequiredModal({
                                                    open,
                                                    onClose,
                                                    onGoToSubscription,
                                                  }: Props) {
  return (
    <FlexibleModal
      open={open}
      title="Недоступно"
      description="Этот раздел доступен только пользователям с активной подпиской."
      ctaLabel="Оформить подписку"
      onCta={onGoToSubscription}
      closeIconUrl={helpIcon}
      onClose={onClose}
    />
  );
}