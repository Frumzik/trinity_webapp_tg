import type {ReactNode} from 'react'
import './greyTile.scss'
import TileWrapper from '../TileWrapper'

type Props = {
    title: ReactNode
    imageUrl: string
    href?: string
    onClick?: () => void
    buttonText?: string
    imageAlt?: string
    className?: string
    style?: React.CSSProperties
    buttonClassName?: string
    buttonStyle?: React.CSSProperties
    ariaLabel?: string
}

export default function GreyTitle({
                                      title, imageUrl, href, onClick, buttonText,
                                      className, style, buttonClassName, buttonStyle, ariaLabel
                                  }: Props) {
    return (
        <TileWrapper href={href} style={style} onClick={onClick} className={['promoCard', className].filter(Boolean).join(' ')} ariaLabel={ariaLabel}>
            <div className="promoCard__img" aria-hidden style={{backgroundImage: `url(${imageUrl})`}}/>
            <div className="promoCard__panel">
                <div className="promoCard__title">{title}</div>
                {buttonText ? (
                    <span className={['promoCard__btn', buttonClassName].filter(Boolean).join(' ')} style={buttonStyle}>
            {buttonText}
          </span>
                ) : null}
            </div>
        </TileWrapper>
    )
}
