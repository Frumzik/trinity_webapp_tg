import { HScroller } from '../../shared/ui/h-scroller'
import './card-slider.scss'

import MiniCard1 from "../../assets/icons/miniCard1.svg"
import MiniCard2 from "../../assets/icons/miniCard2.svg"

export type MiniCardItem = { id: string | number; title: string; imageUrl: string; rightText?: string }

type Props = {
    items?: MiniCardItem[]
    className?: string
    onItemClick?: (item: MiniCardItem) => void
    gap?: number
}

const fallback: MiniCardItem[] = [
    { id: 1, title: 'Духовный старт', imageUrl: MiniCard1, rightText: '36' },
    { id: 2, title: 'Акции', imageUrl: MiniCard2, rightText: '5' },
    { id: 3, title: 'Анонсы', imageUrl: MiniCard1 },
    { id: 4, title: 'Анонсы', imageUrl: MiniCard2 },
    { id: 5, title: 'Анонсы', imageUrl: MiniCard1 },
    { id: 6, title: 'Анонсы', imageUrl: MiniCard2 },
]

export default function MiniCardSlider({ items, onItemClick, }: Props) {
    const data = items && items.length ? items : fallback
    if (!data.length) return null

    return (
        <HScroller className="mcs" trackClassName="mcs__track">
            {data.map(it => (
                <button key={it.id} className="mcs__card" type="button" onClick={() => onItemClick?.(it)}>
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
    )
}
