import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import GradientButton from "../../shared/ui/gradient-button";

import "./modal.scss";

export type PurchaseLevel = {
  id: string | number;
  title: string;
  priceOM: number;
  purchased?: boolean;
  oldPriceOM?: number;
};

type Props = {
  open: boolean;
  lockedLevels: PurchaseLevel[];
  defaultSelectedId?: string | number;
  rateText?: string;
  title?: string;
  discountPercentAll?: number;
  onClose: () => void;
  onPurchase: (payload: {
    levelIds: (string | number)[];
    totalOM: number;
    discountedOM?: number;
  }) => void;
  InfoIcon?: React.ComponentType<{ className?: string }>;
};

export default function LevelPurchaseModal({
  open,
  lockedLevels,
  defaultSelectedId,
  rateText = "USDT = OM",
  title = "Следующий уровень",
  discountPercentAll = 8,
  onClose,
  onPurchase,
  InfoIcon,
}: Props) {
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [checkAll, setCheckAll] = useState(false);

  useEffect(() => {
    if (!open) return;
    const def = defaultSelectedId !== undefined ? [defaultSelectedId] : [];
    setSelected(
      def.filter((id) => !lockedLevels.find((l) => l.id === id)?.purchased),
    );
    setCheckAll(false);
  }, [open, defaultSelectedId, lockedLevels]);

  const selectable = useMemo(
    () => lockedLevels.filter((l) => !l.purchased),
    [lockedLevels],
  );

  const priceById = useMemo(
    () =>
      new Map<string | number, number>(
        lockedLevels.map((l) => [l.id, l.priceOM]),
      ),
    [lockedLevels],
  );

  const sum = useMemo(
    () =>
      selected.reduce<number>((acc, id) => acc + (priceById.get(id) ?? 0), 0),
    [selected, priceById],
  );

  const fullSum = useMemo(
    () => selectable.reduce((acc, l) => acc + l.priceOM, 0),
    [selectable],
  );
  const discountAllValue = Math.round(fullSum * (discountPercentAll / 100));
  const discountAllSum = Math.max(0, fullSum - discountAllValue);
  const allSelected =
    selected.length === selectable.length && selectable.length > 0;

  useEffect(() => {
    if (!open) return;
    if (checkAll) setSelected(selectable.map((l) => l.id));
  }, [checkAll, selectable, open]);

  const toggle = (id: string | number, disabled: boolean) => {
    if (disabled) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const onBuy = () => {
    const useDiscount =
      selected.length === selectable.length && selectable.length > 1;
    onPurchase({
      levelIds: selected,
      totalOM: sum,
      discountedOM: useDiscount ? discountAllSum : undefined,
    });
  };

  return (
    <div className={clsx("lp-modal", open && "is-open")}>
      <div className="lp-backdrop" onClick={onClose} />
      <div className="lp-sheet" role="dialog" aria-modal="true">
        <div className="lp-head">
          <div className="lp-title">
            {title}
            {InfoIcon && <InfoIcon className="lp-title-info" />}
          </div>
          <button className="lp-close" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="lp-rate">{rateText}</div>

        <div className="lp-grid">
          {lockedLevels.map((l, i) => {
            const isBought = !!l.purchased;
            const isSel = selected.includes(l.id);

            return (
              <button
                key={l.id}
                className={clsx(
                  "lp-cell",
                  isSel && "is-selected",
                  isBought && "is-bought",
                )}
                onClick={() => toggle(l.id, isBought)}
                aria-disabled={isBought}
              >
                <div className="lp-cell-top">
                  <span className="lp-step">{i + 1} ступень</span>
                  {isSel && !isBought && <span className="lp-tick"></span>}
                </div>

                <div className="lp-cell-bottom">
                  {!isBought && l.oldPriceOM && (
                    <span className="lp-old-mini">{l.oldPriceOM} OM</span>
                  )}
                  {!isBought && (
                    <span className="lp-price">{l.priceOM} OM</span>
                  )}
                </div>

                {isBought && (
                  <span className="lp-badge">
                    <span className="lp-badge__dot" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="10"
                      viewBox="0 0 12 10"
                      fill="none"
                    >
                      <path
                        d="M2 4.5L5 7.5L10.5 2"
                        stroke="white"
                        stroke-width="3"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectable.length > 1 && (
          <div className="lp-bulk">
            <span className="lp-old">{fullSum} OM</span>
            <span className="lp-new">{discountAllSum} OM</span>
            <span className="lp-note">
              при покупке{" "}
              <span style={{ fontWeight: "500", color: "#474747" }}>
                {selectable.length} ступеней сразу
              </span>
            </span>
          </div>
        )}

        {selectable.length > 1 && (
          <div className="lp-checkbox-box">
            <label className="lp-check">
              <input
                type="checkbox"
                checked={allSelected || checkAll}
                onChange={(e) => {
                  const val = e.target.checked;
                  setCheckAll(val);
                  setSelected(
                    val
                      ? selectable.map((l) => l.id)
                      : defaultSelectedId
                        ? [defaultSelectedId].filter((id) =>
                            selectable.find((s) => s.id === id),
                          )
                        : [],
                  );
                }}
              />
              <span className="activeall">Активировать все</span>
            </label>
          </div>
        )}

        <div className="lp-cta">
          <GradientButton onClick={onBuy}>Приобрести</GradientButton>
        </div>
      </div>
    </div>
  );
}
