import { useMemo, useRef } from "react";
import { HScroller } from "../../shared/ui/h-scroller";
import "./card-slider.scss";
import { useAppNavigate } from "../../shared/lib/hooks/useAppNavigate";
import giftIcon from "../../assets/home/gifts.png"

export type MiniCardItem = {
  id: string | number;
  title: string;
  imageUrl: string;
  rightText?: string | number;
};

type Props = {
  items: MiniCardItem[];
  className?: string;
  onItemClick?: (item: MiniCardItem) => void;
  onViewed?: (id: string | number) => void;
};

const SEEN_KEY = "__seen_banners";
const GIFT_ID = "gifts";
const GIFT_TITLE = "Дары";

const loadSeen = () => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveSeen = (obj: Record<string, true>) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(obj));
  } catch {}
};

export default function MiniCardSlider({
                                         items,
                                         onItemClick,
                                         onViewed,
                                       }: Props) {
  const navigate = useAppNavigate();
  const seenRef = useRef<Record<string, true>>(loadSeen());

  const staticGiftsCard: MiniCardItem = {
    id: GIFT_ID,
    title: GIFT_TITLE,
    imageUrl: giftIcon,
  };

  const isGifts = (it: MiniCardItem) => {
    if (String(it.id) === GIFT_ID) return true;
    if (it.title?.trim() === GIFT_TITLE) return true;
    return /дары/i.test(it.title || "");
  };

  const ordered = useMemo(() => {
    const seen = seenRef.current;
    const unseen: MiniCardItem[] = [];
    const viewed: MiniCardItem[] = [];

    items.forEach((i) => {
      if (isGifts(i)) {
        // пропускаем, т.к. у нас есть статичная карточка
        return;
      }
      if (seen[String(i.id)]) viewed.push(i);
      else unseen.push(i);
    });

    // Всегда первая — статичная карточка "Дары"
    return [staticGiftsCard, ...unseen, ...viewed];
  }, [items]);

  const handleClick = (it: MiniCardItem, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Для "Даров" — всегда просто переход, без отметки как прочитанное
    if (isGifts(it)) {
      navigate("/gifts");
      return;
    }

    // остальное поведение как было
    const seen = { ...seenRef.current, [String(it.id)]: true as const };
    seenRef.current = seen;
    saveSeen(seen);
    onViewed?.(it.id);
    onItemClick?.(it);
  };

  if (!ordered.length) return null;

  return (
    <HScroller className="mcs" trackClassName="mcs__track">
      {ordered.map((it) => (
        <button
          key={it.id}
          className="mcs__card"
          type="button"
          onClick={(e) => handleClick(it, e)}
        >
          <div className="mcs__imgCover">
            <img className="mcs__img" style={{width: "100%"}} src={it.imageUrl} alt={it.title} />
          </div>
          <div className="mcs__bar">
            <div className="mcs__barTitle">{it.title}</div>
          </div>
        </button>
      ))}
    </HScroller>
  );
}