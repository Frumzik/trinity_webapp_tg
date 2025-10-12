
import clsx from 'clsx'
import type { ComponentType, SVGProps } from 'react'

type Img = string | ComponentType<SVGProps<SVGSVGElement>>

type Props = {
    title: string
    bgSrc: Img
    imageUrl?: Img
    onClick?: () => void
    className?: string
}

export default function PromoTile({ title, bgSrc, imageUrl, onClick, className }: Props) {
    const Bg = typeof bgSrc === 'string' ? null : bgSrc
    const Fg = imageUrl && typeof imageUrl !== 'string' ? imageUrl : null

    return (
        <button type="button" className={clsx('promo__tile', className)} onClick={onClick}>
            {Bg ? <Bg className="promo__bg" /> : <img className="promo__bg" src={bgSrc as string} alt="" aria-hidden="true" />}
            {Fg ? <Fg className="promo__fg" /> : imageUrl ? <img className="promo__fg" src={imageUrl as string} alt="" aria-hidden="true" /> : null}
            <div className="promo__label"><span className="promo__labelText">{title}</span></div>
        </button>
    )
}
