import { useEffect, useMemo, useState } from 'react'
import type { WithdrawQuote, Network } from '../../../../entities/wallet/model/types'
import GradientButton from '../../../../shared/ui/gradient-button'
import './withdraw-form.scss'

type Props = {
    avatarSrc: string
    title: string
    subtitle?: string
    quote: (value: number) => Promise<WithdrawQuote>
    submit: (value: number, to: string, net: Network) => Promise<void>
}

export default function WithdrawForm({ avatarSrc, title, subtitle, quote, submit }: Props) {
    const [amount, setAmount] = useState(1000)
    const [q, setQ] = useState<WithdrawQuote | null>(null)
    const [addr, setAddr] = useState('')
    const net: Network = 'USDT_BEP20'
    const chips = [500, 1000, 1500, 2000]

    useEffect(() => { quote(amount).then(setQ) }, [amount, quote])

    const [intPart, fracPart] = useMemo(() => {
        const s = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        return s.split('.')
    }, [amount])

    const totalText = useMemo(() => {
        const v = q ? Math.round(q.total) : amount
        return v.toLocaleString('en-US')
    }, [q, amount])

    const onSend = async () => { await submit(amount, addr, net) }

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
                        onChange={e => setAmount(Number(e.target.value.replace(/\D/g, '') || 0))}
                        inputMode="numeric"
                    />
                    <span className="wform__cents">.{fracPart}</span>
                    <span className="wform__usd"> $</span>
                </div>
            </div>

            <div className="wform__chips">
                {chips.map(v => (
                    <button key={v} className="wform__chip" onClick={() => setAmount(v)}>{v.toLocaleString('en-US')} $</button>
                ))}
            </div>

            <div className="wform__fee">
                Комиссия составит <b>{q?.fee.fixed ?? 0} $</b>
                <div className="wform__fee-sub">(фиксированная {q?.fee.percent ?? 0}%)</div>
            </div>

            <div className="wform__addr">
                <div className="wform__addr-label">Вставьте адрес USDT BEP 20</div>
                <input
                    className="wform__addr-input"
                    placeholder=""
                    value={addr}
                    onChange={e => setAddr(e.target.value)}
                />
            </div>

            <div className="wform__agree">
                Нажимая кнопку «вывести»,<br/>
                я подтверждаю, что ознакомился<br/>
                с <a href="#">Правилами сервиса</a>
            </div>

            <div className="wform__cta">
                <GradientButton className="wform__btn" onClick={onSend}>Вывести $ {totalText}</GradientButton>
                <span className="wform__pill" />
            </div>
        </div>
    )
}