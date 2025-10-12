import GradientButton from '../../../../shared/ui/gradient-button'
import './subscription-banner.scss'

type Props = {
    planLabel: string
    planName: string
    cta: string
    onCta: () => void
}

export default function SubscriptionBanner({ planLabel, planName, cta, onCta }: Props) {
    return (
        <div className="subb">
            <div className="subb__left">
                <div className="subb__label">{planLabel}</div>
                <div className="subb__name">{planName}</div>
            </div>
            <div className="subb__right">
                <GradientButton className="subb__btn" onClick={onCta}>{cta}</GradientButton>
            </div>
        </div>
    )
}