import './levelTile.scss'
import TileWrapper from '../TileWrapper'

type Props = {
    level: number
    completed: number
    total: number
    imageUrl?: string
    to?: string
    href?: string
    onClick?: () => void
    className?: string
    ariaLabel?: string
}

export default function LevelTile({ level, completed, total, imageUrl, to, href, onClick, className, ariaLabel }: Props) {
    const ratio = total > 0 ? Math.min(1, Math.max(0, completed / total)) : 0
    const next = level + 1
    const percent = Math.round(ratio * 100)
    const cls = ['levelCard', to || href || onClick ? 'is-clickable' : '', className].filter(Boolean).join(' ')

    return (
        <TileWrapper to={to} href={href} onClick={onClick} className={cls} ariaLabel={ariaLabel}>
            {imageUrl ? <div className="levelCard__img" style={{ backgroundImage: `url(${imageUrl})` }} /> : null}
            <div className="levelCard__bg" />
            <div className="levelCard__panel">
                <div className="levelCard__title">Уровень</div>
                <div className="levelCard__box">
                    <div className="levelCard__subtitle">Прогресс<br/>до следующего</div>
                    <div className="levelCard__scale">
                        <div className="levelCard__scale-container">
                            <span className="levelCard__mark levelCard__mark--active">{level}</span>
                            <span className="levelCard__mark levelCard__mark--muted">{next}</span>
                        </div>
                        <div className="levelCard__bar">
                            <div className="levelCard__fill" style={{ width: `${percent}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </TileWrapper>
    )
}
