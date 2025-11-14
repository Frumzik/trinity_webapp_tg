import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import type { ComponentType, SVGProps } from "react";

type Img = string | ComponentType<SVGProps<SVGSVGElement>>;

type Props = {
    title: string;
    bgSrc: Img;
    imageUrl?: Img;
    onClick?: () => void;
    className?: string;
    to?: string;        // внутр. роут
    href?: string;      // внешняя ссылка
};

export default function PromoTile({
                                      title, bgSrc, imageUrl, onClick, className, to, href,
                                  }: Props) {
    const Bg = typeof bgSrc === "string" ? null : bgSrc;
    const Fg = imageUrl && typeof imageUrl !== "string" ? imageUrl : null;
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) return onClick();
        if (to) return navigate(to);
        if (href) return window.location.assign(href);
    };

    return (
        <button type="button" className={clsx("promo__tile", className)} onClick={handleClick}>
            {Bg ? <Bg className="promo__bg" /> : <img className="promo__bg" src={bgSrc as string} alt="" aria-hidden />}
            {Fg ? <Fg className="promo__fg" /> : imageUrl ? <img className="promo__fg" src={imageUrl as string} alt="" aria-hidden /> : null}
            <div className="promo__label"><span className="promo__labelText" style={{
              fontFamily: '"Alegreya Sans", sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '1.4',
              letterSpacing: '0.2px',
              color: '#fff',
            }}>{title}</span></div>
        </button>
    );
}