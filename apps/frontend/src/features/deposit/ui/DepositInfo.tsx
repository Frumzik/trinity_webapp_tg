import type { DepositAddress } from '../../../entities/wallet/model/types.ts'
import AddressRow from '../../../widgets/wallet/AddressRow'
import GradientButton from '../../../shared/ui/gradient-button'
import './deposit-info.scss'

type Props = { address: DepositAddress; onCopy?: () => void }

export default function DepositInfo({ address, onCopy }: Props) {
    return (
        <div className="deposit">
            <div className="deposit__title">Пополнить счёт</div>
            <div className="deposit__note">Это ваш адрес USDT {address.network} для пополнения</div>
            <AddressRow address={address.address} onCopy={onCopy} />
            <div className="deposit__cta">
                <GradientButton onClick={onCopy}>Скопировать адрес</GradientButton>
            </div>
        </div>
    )
}