import './switch.scss'

type Props = {
    checked: boolean
    onChange: (v: boolean) => void
}

export default function Switch({ checked, onChange }: Props) {
    return (
        <button
            type="button"
            className={'ui-switch' + (checked ? ' is-on' : '')}
            onClick={() => onChange(!checked)}
            aria-pressed={checked}
        >
            <span className="ui-switch__thumb" />
        </button>
    )
}