import { useEffect, useMemo, useState, useCallback } from "react";
import clsx from "clsx";
import GradientButton from "../../shared/ui/gradient-button";
import "./modal.scss";

export type PurchaseLevel = {
  id: string | number;
  title: string;
  price: number;      // АКТУАЛЬНАЯ цена (discounted)
  salePrice?: number;      // СТАРАЯ цена (до скидки)
  purchased?: boolean;
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
                                             rateText = "1 OM = 1 USDT",
                                             title = "Следующий уровень",
                                             discountPercentAll = 8, // не используется, но оставлен в сигнатуре
                                             onClose,
                                             onPurchase,
                                             InfoIcon,
                                           }: Props) {
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [checkAll, setCheckAll] = useState(false);

  const firstSelectableIndex = useMemo(
    () => lockedLevels.findIndex((l) => !l.purchased),
    [lockedLevels]
  );

  const selectable = useMemo(
    () => lockedLevels.filter((l) => !l.purchased),
    [lockedLevels]
  );

  const allSelected =
    selected.length === selectable.length && selectable.length > 0;

  // строим ids ступеней из диапазона [firstSelectableIndex..toIndex], только не купленные
  const buildRangeIds = useCallback(
    (toIndex: number): (string | number)[] => {
      if (firstSelectableIndex < 0) return [];
      const from = firstSelectableIndex;
      const to = Math.max(from, toIndex);

      return lockedLevels
        .slice(from, to + 1)
        .filter((l) => !l.purchased)
        .map((l) => l.id);
    },
    [lockedLevels, firstSelectableIndex]
  );

  // сбрасываем выбор при открытии модалки
  useEffect(() => {
    if (!open) return;

    setCheckAll(false);

    if (defaultSelectedId !== undefined && firstSelectableIndex >= 0) {
      const idx = lockedLevels.findIndex((l) => l.id === defaultSelectedId);
      if (idx >= firstSelectableIndex) {
        setSelected(buildRangeIds(idx));
        return;
      }
    }

    setSelected([]);
  }, [open, defaultSelectedId, lockedLevels, firstSelectableIndex, buildRangeIds]);

  // сумма по выбранным ступеням (по актуальной цене)
  const sum = useMemo(
    () =>
      selected.reduce<number>((acc, id) => {
        const lvl = lockedLevels.find((l) => l.id === id);
        return acc + (lvl?.price ?? 0);
      }, 0),
    [selected, lockedLevels]
  );

  // суммарная "старая" и "новая" цена для блока "при покупке всех"
  const fullOldSum = useMemo(
    () =>
      selectable.reduce(
        (acc, l) => acc + (l.salePrice ?? l.price), // старая или обычная
        0
      ),
    [selectable]
  );

  const fullNewSum = useMemo(
    () => selectable.reduce((acc, l) => acc + l.price, 0), // актуальная
    [selectable]
  );

  const showBulkBlock = selectable.length > 1 && fullOldSum > fullNewSum;

  // чекбокс "Активировать все"
  useEffect(() => {
    if (!open) return;
    if (checkAll && firstSelectableIndex >= 0) {
      setSelected(buildRangeIds(lockedLevels.length - 1));
    }
  }, [checkAll, open, buildRangeIds, lockedLevels.length, firstSelectableIndex]);

  // клик по ячейке: покупаем всё от первой доступной до выбранной
  const toggle = (id: string | number, disabled: boolean) => {
    if (disabled || firstSelectableIndex < 0) return;

    const idx = lockedLevels.findIndex((l) => l.id === id);
    if (idx < firstSelectableIndex) return;

    setCheckAll(false);
    setSelected(buildRangeIds(idx));
  };

  const onBuy = () => {
    onPurchase({
      levelIds: selected,
      totalOM: sum,
      // discountedOM можно не передавать — на бэке всё равно своя логика
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

            const basePrice = l.salePrice ?? l.price; // старая цена (если есть), иначе price
            const actualPrice = l.price;         // текущая / со скидкой
            const hasDiscount = !isBought && basePrice > actualPrice;

            return (
              <button
                key={l.id}
                className={clsx(
                  "lp-cell",
                  isSel && "is-selected",
                  isBought && "is-bought"
                )}
                onClick={() => toggle(l.id, isBought)}
                aria-disabled={isBought}
              >
                <div className="lp-cell-top">
                  <span className="lp-step">{i + 1} ступень</span>
                  {isSel && !isBought && <span className="lp-tick" />}
                </div>

                <div className="lp-cell-bottom">
                  {!isBought && hasDiscount && (
                    <span className="lp-old-mini">{basePrice} OM</span>
                  )}
                  {!isBought && (
                    <span className="lp-price">{actualPrice} OM</span>
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
                        strokeWidth="3"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {showBulkBlock && (
          <div className="lp-bulk">
            <span className="lp-old">{fullOldSum} OM</span>
            <span className="lp-new">{fullNewSum} OM</span>
            <span className="lp-note">
              при покупке{" "}
              <span style={{ fontWeight: 500, color: "#FFF" }}>
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

                  if (!val) {
                    // сброс: можно оставить только defaultSelectedId, если он валиден
                    if (
                      defaultSelectedId !== undefined &&
                      firstSelectableIndex >= 0
                    ) {
                      const idx = lockedLevels.findIndex(
                        (l) => l.id === defaultSelectedId
                      );
                      if (idx >= firstSelectableIndex) {
                        setSelected(buildRangeIds(idx));
                        return;
                      }
                    }
                    setSelected([]);
                  } else if (firstSelectableIndex >= 0) {
                    setSelected(buildRangeIds(lockedLevels.length - 1));
                  }
                }}
              />
              <span className="activeall">Активировать все</span>
            </label>
          </div>
        )}

        <div className="lp-cta">
          <GradientButton onClick={onBuy} disabled={selected.length === 0}>
            Открыть
          </GradientButton>
        </div>
      </div>
    </div>
  );
}