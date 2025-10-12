import './address-row.scss'

type Props = { address: string; onCopy?: () => void }

export default function AddressRow({ address, onCopy }: Props) {
    const copy = async () => {
        await navigator.clipboard.writeText(address)
        onCopy?.()
    }
    return (
        <button className="addr" onClick={copy}>
            <span className="addr__text">{address}</span>
        </button>
    )
}