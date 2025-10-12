import { HScroller } from '../../shared/ui/h-scroller'
import PracticeTile from "../practise-tile/index.tsx"
import './practise-slider.scss'

export type PracticeItem = {
    id: string | number
    title: string
    imageUrl: string
    subtitle?: string
    onClick?: () => void
}

type Props = {
    items: PracticeItem[]
    gap?: number
    className?: string
}

export default function PracticeSlider({ items, gap = 12, className }: Props) {
    return (
        <HScroller
            className={['ptileWrap', className].filter(Boolean).join(' ')}
            trackClassName="ptile__track"
            gap={gap}
        >
            {items.map((x) => (
                <PracticeTile
                    key={x.id}
                    title={x.title}
                    subtitle={x.subtitle}
                    imageUrl={x.imageUrl}
                    onClick={x.onClick}
                />
            ))}
        </HScroller>
    )
}
