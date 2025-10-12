import clsx from 'clsx'
import type { ComponentType, SVGProps } from 'react'
import "./practise-tile.scss"
type Img = string | ComponentType<SVGProps<SVGSVGElement>>

type Props = {
    title: string
    imageUrl: Img
    subtitle?: string           // ← любая строка, например "25 min"
    onClick?: () => void
    className?: string
}

export default function PracticeTile({
                                         title,
                                         subtitle,
                                         imageUrl,
                                         onClick,
                                         className
                                     }: Props) {
    const Bg = typeof imageUrl === 'string' ? null : (imageUrl as ComponentType<any>)

    return (
        <button type="button" className={clsx('ptile', className)} onClick={onClick}>
            {Bg ? (
                <Bg className="ptile__bg" />
            ) : (
                <img className="ptile__bg" src={imageUrl as string} alt="" aria-hidden />
            )}

            <div className="ptile__fade" aria-hidden />

            <div className="ptile__body">
                <div className="ptile__title">{title}</div>

                {subtitle && (
                    <div className="ptile__meta">
                        <svg className="ptile__time-ico" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                        <span>{subtitle}</span>
                    </div>
                )}
            </div>
        </button>
    )
}
