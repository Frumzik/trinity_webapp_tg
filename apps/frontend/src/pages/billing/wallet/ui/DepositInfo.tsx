import { useState } from 'react'
import GradientButton from '../../../../shared/ui/gradient-button'
import AddressRow from './address/AddressRow'
import './deposit-info.scss'

type Props = {
    avatarSrc: string
    title: string
    captionTop: string
    warnTop: string
    warnStrong: string
    warnBottom: string
    note: string
    address: string
    cta: string
}

export default function DepositInfo(p: Props) {
    const [copied, setCopied] = useState(false)
    const copy = async () => {
        await navigator.clipboard.writeText(p.address)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <div className="dep">
            <div className="dep__head">
                <img className="dep__avatar" src={p.avatarSrc} alt="" />
                <div className="dep__title">{p.title}</div>
                <div className="dep__caption">{p.captionTop}</div>
            </div>

            <div className="dep__block">
                <div className="dep__warn">
                    {p.warnTop} <span className="dep__strong">{p.warnStrong}</span> {p.warnBottom}
                </div>
            </div>

            <div className="dep__block">
                <div className="dep__note">{p.note}</div>
            </div>

            <div className="dep__block dep__addr">
                <AddressRow value={p.address} onCopy={copy} />
                <div className="dep__hint">{copied ? 'Скопировано' : 'Нажмите на адрес, чтобы его скопировать'}</div>
            </div>

            <div className="dep__cta">
                <GradientButton className="dep__btn" onClick={copy}>{p.cta}</GradientButton>
                <span className="dep__pill" />
            </div>
        </div>
    )
}