import { useId } from 'react'
import clsx from 'clsx'
import './forms.scss'

type BaseType = 'text' | 'email' | 'password' | 'number' | 'date'

type Props = {
    label?: string
    placeholder?: string
    value: string | number
    onChange: (v: string) => void
    type?: BaseType
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
    maxLength?: number
    name?: string
    autoComplete?: string

    spinner?: boolean
    step?: number
    min?: number
    max?: number
    className?: string
}

export default function TextField({
                                      label,
                                      value,
                                      onChange,
                                      placeholder,
                                      type = 'text',
                                      inputMode,
                                      maxLength,
                                      name,
                                      autoComplete = 'off',
                                      spinner = false,
                                      step = 1,
                                      min,
                                      max,
                                      className,
                                  }: Props) {
    const id = useId()

    const toNumber = (raw: string) => {
        const cleaned = raw.replace(/[^\d]/g, '')
        return cleaned
    }

    const inc = (delta: number) => {
        const cur = Number(String(value) || 0)
        let next = cur + delta
        if (typeof min === 'number') next = Math.max(min, next)
        if (typeof max === 'number') next = Math.min(max, next)
        onChange(String(next))
    }

    return (
        <label className="f-field" htmlFor={id}>
            {label && <div className="f-label">{label}</div>}

            <div className={clsx('f-input-wrap', spinner && 'f-input-wrap--spin', className)}>
                <input
                    id={id}
                    className="f-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        if (type === 'number' || spinner) {
                            onChange(toNumber(e.target.value))
                        } else {
                            onChange(e.target.value)
                        }
                    }}
                    type={type}
                    inputMode={inputMode ?? (spinner || type === 'number' ? 'numeric' : undefined)}
                    maxLength={maxLength}
                    name={name}
                    autoComplete={autoComplete}
                    autoCorrect="off"
                    spellCheck={false}
                />

                {spinner && (
                    <span className="f-spin">
            <button
                type="button"
                className="f-spin__btn f-spin__btn--up"
                aria-label="Increase"
                onClick={() => inc(step)}
            >
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                <path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
                type="button"
                className="f-spin__btn f-spin__btn--down"
                aria-label="Decrease"
                onClick={() => inc(-step)}
            >
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </span>
                )}
            </div>
        </label>
    )
}