import type { Plan } from "../../../entities/wallet/model/types.ts";
import GradientButton from "../../../shared/ui/gradient-button";
import "./plan-card.scss";

type Props = { plan: Plan; onUpgrade?: (id: string) => void };

export default function PlanCard({ plan, onUpgrade }: Props) {
  return (
    <div className="plan">
      <div className="plan__title">Подписка</div>
      <div className="plan__name">{plan.title}</div>
      {!plan.active && (
        <GradientButton onClick={() => onUpgrade?.(plan.id)}>
          Обновить
        </GradientButton>
      )}
      {plan.active && <button className="plan__muted">Активна</button>}
    </div>
  );
}
