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
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="7" viewBox="0 0 8 7" fill="none">
<path d="M3.89697 0L7.79409 6.75H-0.000141621L3.89697 0Z" fill="white"/>
</svg>
            </button>
            <button
                type="button"
                className="f-spin__btn f-spin__btn--down"
                aria-label="Decrease"
                onClick={() => inc(-step)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="7" viewBox="0 0 8 7" fill="none">
  <path d="M3.89697 6.75L-0.000140554 -7.34099e-07L7.79409 -5.27059e-08L3.89697 6.75Z" fill="white"/>
</svg>
            </button>
          </span>
                )}
            </div>
        </label>
    )
}