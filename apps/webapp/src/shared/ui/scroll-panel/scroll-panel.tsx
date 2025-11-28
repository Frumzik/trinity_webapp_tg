// ScrollPanel.tsx
import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import "./scroll-panel.scss";

type Props = {
  children: ReactNode;
  maxHeight?: number | string;
  className?: string;
  showRail?: boolean;
  vars?: {
    railRight?: string;
    railTop?: string;
    railBottom?: string;
    railWidth?: string;
    railColor?: string;
    thumbColor?: string;
    zIndex?: number;
  };

  /** кастомный класс именно для sp__content */
  contentClassName?: string;
  /** стили именно для sp__content */
  contentStyle?: CSSProperties;
};

export default function ScrollPanel({
                                      children,
                                      maxHeight = "42dvh",
                                      className,
                                      showRail = true,
                                      vars,
                                      contentClassName,
                                      contentStyle,
                                    }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ h: 0, y: 0 });

  const recalc = () => {
    const el = boxRef.current;
    if (!el) return;
    const vh = el.clientHeight;
    const sh = el.scrollHeight;
    const ratio = Math.min(1, vh / (sh || 1));
    const th = Math.max(24, Math.round(vh * ratio));
    const maxS = Math.max(1, sh - vh);
    const ty = Math.round((el.scrollTop / maxS) * (vh - th));
    setThumb({ h: th, y: ty });
  };

  useEffect(() => {
    recalc();
    const ro = new ResizeObserver(recalc);
    const el = boxRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const styleVars: CSSProperties = {
    ["--sp-rail-right" as any]: vars?.railRight,
    ["--sp-rail-top" as any]: vars?.railTop,
    ["--sp-rail-bottom" as any]: vars?.railBottom,
    ["--sp-rail-width" as any]: vars?.railWidth,
    ["--sp-rail-color" as any]: vars?.railColor,
    ["--sp-thumb-color" as any]: vars?.thumbColor,
    ["--sp-z" as any]: vars?.zIndex,
  };

  return (
    <div
      className={["sp gg", className].filter(Boolean).join(" ")}
      style={styleVars}
    >
      <div
        className="sp__box"
        style={{ maxHeight }}
        ref={boxRef}
        onScroll={recalc}
      >
        <div
          className={["sp__content", contentClassName]
            .filter(Boolean)
            .join(" ")}
          style={contentStyle}
        >
          {children}
        </div>
      </div>
      {showRail && <div className="sp__rail" aria-hidden />}
      <div
        className="sp__thumbY"
        style={{
          height: `${thumb.h}px`,
          transform: `translateY(${thumb.y}px)`,
        }}
        aria-hidden
      />
    </div>
  );
}