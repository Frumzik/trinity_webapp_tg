import { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  onViewed?: (id: string | number) => void;
  pinnedIdOrTitle?: string | number; // "Дары" или 123
};

const SEEN_KEY = "__seen_banners";
const loadSeen = () => {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}"); } catch { return {}; }
};
const saveSeen = (obj: Record<string, true>) => {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(obj)); } catch {}
};

export default function MiniCardSlider({
                                         items,
                                         onItemClick,
                                         onViewed,
                                         pinnedIdOrTitle = "Дары",
                                       }: Props) {
  const navigate = useNavigate();
  const seenRef = useRef<Record<string, true>>(loadSeen());

  const isPinned = (it: MiniCardItem) => {
    if (String(it.id) === String(pinnedIdOrTitle)) return true;
    if (typeof pinnedIdOrTitle === "string" && it.title?.trim() === String(pinnedIdOrTitle).trim()) return true;
    return /дары/i.test(it.title || "");
  };

  const ordered = useMemo(() => {
    const seen = seenRef.current;
    const pinned: MiniCardItem[] = [];
    const unseen: MiniCardItem[] = [];
    const viewed: MiniCardItem[] = [];

    items.forEach((i) => {
      if (isPinned(i)) pinned.push(i);
      else if (seen[String(i.id)]) viewed.push(i);
      else unseen.push(i);
    });

    return [...pinned, ...unseen, ...viewed];
  }, [items]);

  const handleClick = (it: MiniCardItem, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (isPinned(it) || String(it.id) === "gifts" || it.title?.trim() === "Дары") {
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
            <img className="mcs__img" src={it.imageUrl} alt={it.title} />
          </div>
          <div className="mcs__bar">
            <div className="mcs__barTitle">{it.title}</div>
          </div>
        </button>
      ))}
    </HScroller>
  );
}