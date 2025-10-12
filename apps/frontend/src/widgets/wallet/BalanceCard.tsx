import './balance-card.scss'

type Props = { amount: number; currency: string; onDeposit?: () => void; onWithdraw?: () => void }

export default function BalanceCard({ amount, onDeposit, onWithdraw }: Props) {
    const str = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const [intPart, fracPart] = str.split('.')
    return (
        <div className="balance">
            <div className="balance__sum">
                <span className="balance__cur">$</span>{' '}{intPart}
                <span className="balance__cents">.{fracPart}</span>
            </div>
            <div className="balance__note">Основной баланс</div>
            <div className="balance__actions">
                <button className="balance__btn" onClick={onDeposit}>Пополнение</button>
                <button className="balance__btn" onClick={onWithdraw}>Вывод</button>
            </div>
        </div>
    )
}