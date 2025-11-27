import { useEffect, useMemo, useState, useCallback } from "react";
import clsx from "clsx";
import GradientButton from "../../shared/ui/gradient-button";
import "./modal.scss";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";

export type PurchaseLevel = {
  id: string | number;
  title: string;
  price: number;      // актуальная цена (со скидкой, если есть)
  salePrice?: number; // старая цена, если была скидка
  purchased?: boolean;
  stepIndex?: number;
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
  isFirstLevel?: boolean;
};

export default function LevelPurchaseModal({
                                             open,
                                             lockedLevels,
                                             defaultSelectedId,
                                             rateText = "1 OM = 1 USDT",
                                             title = "Следующий уровень",
                                             discountPercentAll = 8,
                                             onClose,
                                             onPurchase,
                                             InfoIcon,
                                             isFirstLevel = false,
                                           }: Props) {
  const [selected, setSelected] = useState<(string | number)[]>([]);
  // базовый выбор при открытии модалки (нужен для "Выбрать все" → снять)
  const [baseSelection, setBaseSelection] = useState<(string | number)[]>([]);

  // первый ещё не купленный уровень
  const firstSelectableIndex = useMemo(
    () => lockedLevels.findIndex((l) => !l.purchased),
    [lockedLevels]
  );

  // якорный индекс — минимальная ступень, которую нельзя выключить
  const anchorIndex = firstSelectableIndex;

  const selectable = useMemo(
    () => lockedLevels.filter((l) => !l.purchased),
    [lockedLevels]
  );

  const allSelected =
    selected.length === selectable.length && selectable.length > 0;

  // ids ступеней из диапазона [anchorIndex..toIndex], только не купленные
  const buildRangeIds = useCallback(
    (toIndex: number): (string | number)[] => {
      if (anchorIndex < 0) return [];
      const from = anchorIndex;
      const to = Math.max(from, toIndex);

      return lockedLevels
        .slice(from, to + 1)
        .filter((l) => !l.purchased)
        .map((l) => l.id);
    },
    [lockedLevels, anchorIndex]
  );

  // сбрасываем выбор при открытии модалки
  useEffect(() => {
    if (!open) return;

    let initial: (string | number)[] = [];

    if (defaultSelectedId !== undefined && anchorIndex >= 0) {
      const idx = lockedLevels.findIndex((l) => l.id === defaultSelectedId);
      if (idx >= anchorIndex) {
        initial = buildRangeIds(idx);
      }
    }

    setSelected(initial);
    setBaseSelection(initial);
  }, [open, defaultSelectedId, lockedLevels, anchorIndex, buildRangeIds]);

  // сумма по выбранным — если есть salePrice, берём её, иначе price
  const sum = useMemo(
    () =>
      selected.reduce<number>((acc, id) => {
        const lvl = lockedLevels.find((l) => l.id === id);
        if (!lvl) return acc;
        const effective =
          typeof lvl.salePrice === "number" ? lvl.salePrice : lvl.price;
        return acc + effective;
      }, 0),
    [selected, lockedLevels]
  );

  const fullOldSum = useMemo(
    () => selectable.reduce((acc, l) => acc + (l.salePrice ?? l.price), 0),
    [selectable]
  );

  const fullNewSum = useMemo(
    () => selectable.reduce((acc, l) => acc + l.price, 0),
    [selectable]
  );

  const bulkStepsCount = useMemo(() => {
    if (!selectable.length) return 0;

    if (isFirstLevel) {
      const discountable = selectable.filter((l) => {
        const idx = typeof l.stepIndex === "number" ? l.stepIndex : 0;
        return idx > 0;
      });
      return discountable.length;
    }

    return selectable.length;
  }, [selectable, isFirstLevel]);

  const showBulkBlock = selectable.length > 1 && fullOldSum > fullNewSum;

  // Тоггл уровня:
  // – всегда держим цепочку от anchorIndex до какого-то endIndex
  // – anchorIndex выключить нельзя
  // – клик по правее → удлиняем цепочку
  // – клик по последнему → укорачиваем (если больше anchorIndex)
  // – клик по середине → обрезаем хвост начиная с этой ступени
  const toggle = (id: string | number, disabled: boolean) => {
    if (disabled || anchorIndex < 0) return;

    const idx = lockedLevels.findIndex((l) => l.id === id);
    if (idx < anchorIndex) return;

    // если ещё ничего не выбрано — просто строим цепочку до этой ступени
    if (selected.length === 0) {
      setSelected(buildRangeIds(idx));
      return;
    }

    // текущий "хвост" — последний выбранный id
    const lastId = selected[selected.length - 1];
    const currentEndIdx = lockedLevels.findIndex((l) => l.id === lastId);

    // якорную ступень выключать нельзя
    if (idx === anchorIndex) {
      return;
    }

    // клик правее текущего хвоста → расширяем
    if (idx > currentEndIdx) {
      setSelected(buildRangeIds(idx));
      return;
    }

    // клик по текущему хвосту → укорачиваем на 1 (но не дальше якоря)
    if (idx === currentEndIdx) {
      if (currentEndIdx > anchorIndex) {
        setSelected(buildRangeIds(currentEndIdx - 1));
      }
      return;
    }

    // клик по ступени внутри цепочки (между anchor и хвостом):
    // обрезаем всё, начиная с неё → новый хвост = idx - 1 (но не левее anchor)
    const newEndIdx = Math.max(anchorIndex, idx - 1);
    setSelected(buildRangeIds(newEndIdx));
  };

  const onBuy = () => {
    onPurchase({
      levelIds: selected,
      totalOM: sum,
      discountedOM: sum,
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

        <ScrollPanel
          maxHeight="30dvh"
          vars={{
            railRight: "-10px",
            railTop: "10px",
            railBottom: "4px",
            railWidth: "3px",
            railColor: "rgba(255, 255, 255, 0.25)",
            thumbColor: "#C7C7C7",
            zIndex: 10,
          }}
        >
          <div className="lp-grid">
            {lockedLevels.map((l, i) => {
              const isBought = !!l.purchased;
              const isSel = selected.includes(l.id);

              const stepNumber =
                typeof l.stepIndex === "number" ? l.stepIndex : i;

              const hasDiscount =
                !isBought &&
                typeof l.salePrice === "number" &&
                l.salePrice > l.price;

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
                    <span className="lp-step">{stepNumber} ступень</span>
                    {isSel && !isBought && <span className="lp-tick" />}
                  </div>

                  <div className="lp-cell-bottom">
                    {!isBought && hasDiscount && (
                      <>
                        <span className="lp-old-mini">{l.salePrice} OM</span>
                        <span className="lp-price">{l.price} OM</span>
                      </>
                    )}

                    {!isBought && !hasDiscount && (
                      <span className="lp-price">{l.price} OM</span>
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
        </ScrollPanel>

        {showBulkBlock && (
          <div className="lp-bulk">
            <span className="lp-old">{fullOldSum} OM</span>
            <span className="lp-new">{fullNewSum} OM</span>
            <span className="lp-note">
              при открытии{" "}
              <span style={{ fontWeight: 500, color: "#FFF" }}>
                {bulkStepsCount} ступеней
              </span>
            </span>
          </div>
        )}

        {selectable.length > 1 && (
          <div className="lp-checkbox-box">
            <label className="lp-check">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => {
                  const val = e.target.checked;

                  if (val && anchorIndex >= 0) {
                    // включили "Выбрать все" → всё от anchor до конца
                    setSelected(buildRangeIds(lockedLevels.length - 1));
                  } else {
                    // выключили "Выбрать все" → возвращаемся к базовому выбору
                    setSelected(baseSelection);
                  }
                }}
              />
              <span className="activeall">Выбрать все</span>
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