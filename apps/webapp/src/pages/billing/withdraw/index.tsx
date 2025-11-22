import "./index.scss";
import TopBar from "../../../widgets/topbarTextpage";
import WithdrawForm from "./ui/WithdrawForm";
import { useGetUserQuery } from "../../../shared/api/user.api";
import { useWithdrawMutation } from "../../../shared/api/acquiring.api";

export default function WithdrawPage() {
  const { data } = useGetUserQuery({ populate: false });
  const balance = data?.data?.balance ?? 0;

  const [withdraw, { isLoading }] = useWithdrawMutation();

  return (
    <div className="withdraw">
      <TopBar title="Кошелек" />
      <WithdrawForm
        title="Получить Вознаграждения"
        subtitle=""
        balance={balance}
        loading={isLoading}
        submit={async (value, address) => {
          await withdraw({
            address: address.trim(),
            amount: String(value),
          }).unwrap();
        }}
      />
    </div>
  );
}