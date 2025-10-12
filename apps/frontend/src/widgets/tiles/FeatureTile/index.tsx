import type { ComponentType, SVGProps } from 'react'
import './feature-tile.scss'
import TileWrapper from '../TileWrapper'
import LockIcon from '../../../assets/icons/lock.svg?url'

type SvgComp = ComponentType<SVGProps<SVGSVGElement>>

type Props = {
    title: string
    description?: string
    enabled: boolean
    bgImageUrl?: string
    bgImageSvg?: SvgComp
    rightImageUrl?: string
    rightImageSvg?: SvgComp
    buttonTextEnabled?: string
    buttonTextDisabled?: string
    onOpen?: () => void     // модалка/доп. действие
    to?: string
    href?: string
    onClick?: () => void
    className?: string
    ariaLabel?: string
}

export default function FeatureTile({
                                        title,
                                        description,
                                        enabled,
                                        bgImageUrl,
                                        bgImageSvg: BgSvg,
                                        rightImageUrl,
                                        rightImageSvg: RightSvg,
                                        buttonTextEnabled = 'Перейти',
                                        buttonTextDisabled = 'В разработке',
                                        onOpen,
                                        href,
                                        onClick,
                                        className,
                                        ariaLabel
                                    }: Props) {
    const rootCls = ['featureTile', enabled ? 'is-enabled' : 'is-disabled', className].filter(Boolean).join(' ')
    return (
        <TileWrapper
            to="/support"
            href={enabled ? href : undefined}
            onClick={enabled ? (onClick ?? onOpen) : undefined}
            className={rootCls}
            ariaLabel={ariaLabel}
        >
            {bgImageUrl ? (
                <div className="featureTile__bg" style={{ backgroundImage: `url("${bgImageUrl}")` }} />
            ) : BgSvg ? (
                <BgSvg className="featureTile__bgSvg" />
            ) : null}

            <div className="featureTile__left">
                <div className="featureTile__title">{title}</div>
                {description ? <div className="featureTile__desc">{description}</div> : null}
                <button
                    type="button"
                    className={`featureTile__btn${enabled ? '' : ' is-disabled'}`}
                    onClick={(e) => {
                        e.stopPropagation()
                        if (enabled) onOpen?.()
                    }}
                    disabled={!enabled}
                >
                    {enabled ? buttonTextEnabled : buttonTextDisabled}
                </button>
            </div>

            <div className="featureTile__right">
                {enabled ? (
                    rightImageUrl ? (
                        <img className="featureTile__image" src={rightImageUrl} alt="" />
                    ) : RightSvg ? (
                        <RightSvg className="featureTile__imageSvg" />
                    ) : null
                ) : (
                    <div className="featureTile__placeholder">
                        <img src={LockIcon} alt="" />
                    </div>
                )}
            </div>
        </TileWrapper>
    )
}
