// widgets/card-slider-homePage/index.tsx
import { useMemo, useRef } from "react";
import { HScroller } from "../../shared/ui/h-scroller";
import "./card-slider.scss";

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
  onViewed?: (id: string | number) => void; // сообщим наверх, чтобы вызвать add-view
};

const SEEN_KEY = '__seen_banners';

function loadSeen(): Record<string, true> {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch { return {}; }
}
function saveSeen(obj: Record<string, true>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(obj)); } catch {}
}

export default function MiniCardSlider({ items, onItemClick, onViewed }: Props) {
  const seenRef = useRef(loadSeen());

  // порядок: непросмотренные слева → просмотренные справа
  const ordered = useMemo(() => {
    const seen = seenRef.current;
    const unseen: MiniCardItem[] = [];
    const viewed: MiniCardItem[] = [];
    items.forEach((i) => (seen[String(i.id)] ? viewed : unseen).push(i));
    return [...unseen, ...viewed];
  }, [items]);

  const handleClick = (it: MiniCardItem) => {
    // пометить как просмотренный
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
          onClick={() => handleClick(it)}
        >
          <div className="mcs__imgCover">
            <img className="mcs__img" src={it.imageUrl} alt="" />
          </div>
          <div className="mcs__bar">
            <div className="mcs__barTitle">{it.title}</div>
            {it.rightText ? <div className="mcs__barMeta">{it.rightText}</div> : null}
          </div>
        </button>
      ))}
    </HScroller>
  );
}