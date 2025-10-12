import TopBar from '../../../widgets/topbarTextpage/index.tsx'
import DepositInfo from './ui/DepositInfo'
import { getDepositAddress } from '../../../entities/wallet/api/walet.api.ts'
import { useEffect, useState } from 'react'
import type { DepositAddress } from '../../../entities/wallet/model/types.ts'
import Avatar from '../../../assets/image/level/card1.png'
import './index.scss'

export default function WalletPage() {
    const [addr, setAddr] = useState<DepositAddress | null>(null)

    useEffect(() => { getDepositAddress().then(setAddr) }, [])

    if (!addr) return null

    return (
        <div className="wallet">
            <TopBar title="Кошелек" />
            <DepositInfo
                avatarSrc={Avatar}
                title="Пополнить счёт"
                captionTop={`Это ваш адрес ${addr.network.replace('_',' ')}\nдля пополнения`}
                warnTop="Скопируйте и внимательно проверьте,"
                warnStrong="один пропущенный символ приведет"
                warnBottom="к потере средств!"
                note="Убедитесь в корректности сети,\nкоторую вы выбрали для вывода!"
                address={addr.address}
                cta="Скопировать адрес"
            />
        </div>
    )
}