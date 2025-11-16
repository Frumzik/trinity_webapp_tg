import TopBar from "../../../widgets/topbarTextpage";
import WithdrawForm from "./ui/WithdrawForm";
import { submitWithdraw } from "../../../entities/wallet/api/walet.api";
import "./index.scss";

export default function WithdrawPage() {
  return (
    <div className="withdraw">
      <TopBar title="Кошелек" />
      <WithdrawForm
        title="Получить"
        subtitle="на кошелек"
        submit={async (v, a, n) => {
          await submitWithdraw(v, a, n);
        }}
      />
    </div>
  );
}