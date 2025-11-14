import TopBar from "../../../widgets/topbarTextpage/index.tsx";
import WithdrawForm from "./ui/WithdrawForm";
import {
  submitWithdraw,
} from "../../../entities/wallet/api/walet.api.ts";
import Avatar from "../../../assets/image/level/card1.png";
import "./index.scss";

export default function WithdrawPage() {
  return (
    <div className="withdraw">
      <TopBar title="Кошелек" />
      <WithdrawForm
        avatarSrc={Avatar}
        title="Вывод"
        subtitle="на кошелек"
        submit={async (v, a, n) => {
            await submitWithdraw(v, a, n);
        }}
      />
    </div>
  );
}
