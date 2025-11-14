import TopBar from "../../../widgets/topbarTextpage"
import BalanceCard from "../../../widgets/wallet/BalanceCard"
import TransactionList from "../../../widgets/transactions/TransactionList"
import "./index.scss"
import { useGetUserQuery } from "../../../shared/api/user.api"

export default function BillingHistoryPage() {
  const { data, isLoading } = useGetUserQuery({ populate: false })
  const amount = data?.data?.balance ?? 0

  return (
    <>
      <TopBar title="Общий доход" />
      <div className="billing-history">
        <BalanceCard
          amount={isLoading ? 0 : amount}
          currency="OM"
          onDeposit={() => {}}
          onWithdraw={() => {}}
        />
        <TransactionList items={[]} />
      </div>
    </>
  )
}