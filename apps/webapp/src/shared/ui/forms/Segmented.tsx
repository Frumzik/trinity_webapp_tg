import './forms.scss'
import type { ReactNode } from 'react'

type Opt = { label: string; value: string; icon?: ReactNode }
type Props = {
    label?: string
    value: string
    options: Opt[]
    onChange: (v: string) => void
}

export default function Segmented({ label, value, options, onChange }: Props) {
    return (
        <div className="f-seg">
            {label && <div className="f-label">{label}</div>}
            <div className="f-seg__wrap" role="tablist" aria-label={label}>
                {options.map(o => {
                    const active = o.value === value
                    return (
                        <button
                            key={o.value}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            className={'f-seg__btn' + (active ? ' is-active' : '')}
                            onClick={() => onChange(o.value)}
                        >
                            {o.icon && <span className="f-seg__icon" aria-hidden>{o.icon}</span>}
                            <span className="f-seg__text">{o.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}