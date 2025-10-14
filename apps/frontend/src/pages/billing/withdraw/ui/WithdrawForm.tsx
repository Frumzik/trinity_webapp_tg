import { useMemo, useState } from 'react'
import type { Network } from '../../../../entities/wallet/model/types'
import GradientButton from '../../../../shared/ui/gradient-button'
import './withdraw-form.scss'

type Props = {
    avatarSrc: string
    title: string
    subtitle?: string
    submit: (value: number, to: string, net: Network) => Promise<void>
}

const PERCENT_FEE = 5 // 5%

export default function WithdrawForm({ avatarSrc, title, subtitle, submit }: Props) {
    const [amount, setAmount] = useState(1000)
    const [addr, setAddr] = useState('')
    const [sending, setSending] = useState(false)
    const net: Network = 'USDT_BEP20'
    const chips = [500, 1000, 1500, 2000]

    // Набор для большого инпута "сумма . центы"
    const [intPart, fracPart] = useMemo(() => {
        const safe = Number.isFinite(amount) ? amount : 0
        const s = safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const [i, f = '00'] = s.split('.')
        return [i, f]
    }, [amount])

    // Комиссия 5% и итог
    const fee = useMemo(() => (amount * PERCENT_FEE) / 100, [amount])
    const total = useMemo(() => amount + fee, [amount, fee])

    const totalText = useMemo(
        () => total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        [total]
    )

    const canSend = amount > 0 && addr.trim().length > 0 && !sending

    const onSend = async () => {
        if (!canSend) return
        setSending(true)
        try {
            await submit(amount, addr.trim(), net) // передаём исходную сумму, комиссия отображается в UI
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="wform">
            <div className="wform__head">
                <img className="wform__avatar" src={avatarSrc} alt="" />
                <div className="wform__title">{title}</div>
                {subtitle && <div className="wform__sub">{subtitle}</div>}
            </div>

            <div className="wform__amount">
                <div className="wform__label">Введите сумму</div>
                <div className="wform__input-wrap">
                    <input
                        className="wform__input"
                        value={intPart.replace(/,/g, '')}
                        onChange={(e) => {
                            const next = Number(e.target.value.replace(/\D/g, '') || 0)
                            setAmount(next)
                        }}
                        inputMode="numeric"
                    />
                    <span className="wform__cents">.{fracPart}</span>
                    <span className="wform__usd"> $</span>
                </div>
            </div>

            <div className="wform__chips">
                {chips.map((v) => (
                    <button key={v} className="wform__chip" onClick={() => setAmount(v)}>
                        {v.toLocaleString('en-US')} $
                    </button>
                ))}
            </div>

            <div className="wform__fee">
                Комиссия составит <b>{fee.toFixed(2)} $</b>
                <div className="wform__fee-sub">(фиксированная {PERCENT_FEE}%)</div>
            </div>

            <div className="wform__addr">
                <input
                    className="wform__addr-input"
                    placeholder="Вставьте адрес USDT BEP 20"
                    value={addr}
                    onChange={(e) => setAddr(e.target.value)}
                />
            </div>

            <div className="wform__agree">
                Нажимая кнопку «вывести»,<br />
                я подтверждаю, что ознакомился<br />с <a href="#">Правилами сервиса</a>
            </div>

            <div className="gbtn-bar rectangle-btn">
                <div className="gbtn-bar__inner rectangle-btn-inner">
                    <GradientButton className="egd" onClick={onSend} >
                        ВЫВЕСТИ $ {totalText}
                    </GradientButton>
                </div>
            </div>
        </div>
    )
}