import { forwardRef, useRef } from "react";
import { useInertiaDragScroll } from "../../lib/hooks/useInertiaDragScroll.ts";
import "./hscroller.scss";

type Props = {
  className?: string;
  trackClassName?: string;
  children: React.ReactNode;
  friction?: number;
  minVelocity?: number;
  gap?: number;
};

const HScroller = forwardRef<HTMLDivElement, Props>(function HScroller(
  { className, trackClassName, children, friction, minVelocity, gap = 12 },
  refFromParent,
) {
  const innerRef = useRef<HTMLDivElement>(null);
  const ref = (refFromParent as React.RefObject<HTMLDivElement>) || innerRef;
  const bind = useInertiaDragScroll(ref, {
    axis: "x",
    wheelToAxis: "auto",
    friction,
    minVelocity,
  });

  return (
    <div className={["hscroll", className].filter(Boolean).join(" ")}>
      <div
        ref={ref}
        className={["hscroll__track", trackClassName].filter(Boolean).join(" ")}
        style={{ gap }}
        {...bind}
      >
        {children}
      </div>
    </div>
  );
});

export default HScroller;
