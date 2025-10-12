import { HScroller } from '../../shared/ui/h-scroller'
import PromoTile from '../promo-tile'
import './promo-slider.scss'

export type PromoItem = {
    id: string | number
    title: string
    imageUrl?: string
    onClick?: () => void
}

type Props = {
    items: PromoItem[]
    bgSrc: string
    className?: string
    gap?: number
}

export default function PromoSlider({ items, bgSrc, className, gap = 12 }: Props) {
    return (
        <HScroller className={['promo', className].filter(Boolean).join(' ')} trackClassName="promo__track" gap={gap}>
            {items.map(x => (
                <PromoTile key={x.id} title={x.title} bgSrc={bgSrc} imageUrl={x.imageUrl} onClick={x.onClick} />
            ))}
        </HScroller>
    )
}
