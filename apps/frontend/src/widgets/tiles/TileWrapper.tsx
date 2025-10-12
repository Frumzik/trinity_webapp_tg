import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

type Props = {
    to?: string             // роут react-router
    href?: string           // внешняя ссылка
    onClick?: () => void    // действие (например, модалка)
    className?: string
    style?: React.CSSProperties
    ariaLabel?: string
    children: ReactNode
    disabled?: boolean
}

export default function TileWrapper({
                                        to,
                                        href,
                                        onClick,
                                        className,
                                        style,
                                        ariaLabel,
                                        children,
                                        disabled,
                                    }: Props) {
    const navigate = useNavigate()
    const isActive = !disabled && (to || href || onClick)

    const handleActivate = () => {
        if (!isActive) return
        if (onClick) onClick()
        else if (to) navigate(to)
        else if (href) window.location.assign(href)
    }

    return (
        <div
            className={['tileWrapper', isActive ? 'is-clickable' : '', className].filter(Boolean).join(' ')}
            role={to || href ? 'link' : onClick ? 'button' : undefined}
            tabIndex={isActive ? 0 : undefined}
            aria-label={ariaLabel}
            onClick={isActive ? handleActivate : undefined}
            onKeyDown={isActive ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleActivate()
                }
            } : undefined}
            style={style}
        >
            {children}
        </div>
    )
}
