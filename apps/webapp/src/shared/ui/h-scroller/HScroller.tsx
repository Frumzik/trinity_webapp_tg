
import { forwardRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

type Props = {
  className?: string;
  trackClassName?: string; // не нужен, оставлен для совместимости
  children: React.ReactNode;
  gap?: number; // в px
};

const HScroller = forwardRef<HTMLDivElement, Props>(function HScroller(
  { className, children, gap = 12 },
  _ref
) {
  return (
    <div className={["hscroll", className].filter(Boolean).join(" ")}>
      <Swiper
        modules={[FreeMode, Mousewheel]}
        slidesPerView="auto"           // ширина берётся из контента
        spaceBetween={gap}             // отступы между карточками
        freeMode                        // инерция/флик
        mousewheel={{ forceToAxis: true, releaseOnEdges: true }} // колесо вбок
        grabCursor                      // курсор-рука на десктопе
      >
        {/* каждую «карточку» завернём в SwiperSlide с auto-width */}
        {Array.isArray(children)
          ? children.map((child: any, i) => (
            <SwiperSlide key={child?.key ?? i} style={{ width: "auto" }}>
              {child}
            </SwiperSlide>
          ))
          : <SwiperSlide style={{ width: "auto" }}>{children}</SwiperSlide>}
      </Swiper>
    </div>
  );
});

export default HScroller;
export { default as HScroller } from "./HScroller";