// TransferToUserPage.tsx (новая страница: сумма + username)
import "./index.scss";
import TopBar from "../../../widgets/topbarTextpage";
import WithdrawForm from "./ui/WithdrawForm";
import { useGetUserQuery } from "../../../shared/api/user.api";
import { useAppNavigate } from "../../../shared/lib/hooks/useAppNavigate";
import { useState } from "react";
import FlexibleModal from "../../../widgets/flexible-modal";

// TODO: подключи свой mutation для internal transfer
// import { useTransferMutation } from "../../../shared/api/....";

export default function TransferToUserPage() {
  const navigate = useAppNavigate();
  const { data } = useGetUserQuery({ populate: false });
  const balance = data?.data?.balance ?? 0;

  const [toValue, setToValue] = useState("");
  const [toMode, setToMode] = useState<"username" | "wallet">("username");

  const [resultOpen, setResultOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState<string | undefined>();
  const [resultDesc, setResultDesc] = useState<string | undefined>();
  const [resultCta, setResultCta] = useState<string | undefined>();
  const [resultOnCta, setResultOnCta] = useState<(() => void) | undefined>();
  return (
    <div className="withdraw">
      <TopBar title="Перевести" />

      <WithdrawForm
        title={
          <p style={{ width: "250px", lineHeight: "25px" }}>
            Внутренний перевод внутри системы
          </p>
        }
        subtitle="Комиссия не взимается"
        balance={balance}
        loading={false}
        showFeeBlock={false}
        showToInput={true}
        toValue={toValue}
        onChangeTo={setToValue}
        toMode={toMode}
        onToggleToMode={(next) => {
          setToMode(next);
          setToValue("");
        }}
        submitButtonText={({ amount }) => <>ВЫВЕСТИ {amount.toFixed(2)} OM</>}
        submit={async (value, to, mode) => {
          try {
            if (mode === "username") {
              // await transferToUser({ username: to, amount: String(value) }).unwrap();
            } else {
              // await withdrawToWallet({ address: to, amount: String(value) }).unwrap();
            }

            setResultTitle(mode === "username" ? "Перевод отправлен" : "Вывод создан");
            setResultDesc(
              mode === "username"
                ? `Вы отправили ${value} OM пользователю ${to}`
                : `Вы отправили ${value} OM на адрес ${to}`
            );

            setResultCta(undefined);
            setResultOnCta(undefined);
            setResultOpen(true);
          } catch (e: any) {
            const raw = e?.data?.message ?? e?.error ?? "Не удалось выполнить перевод";
            const msg = Array.isArray(raw) ? raw[0] : String(raw);

            setResultTitle(msg);
            setResultDesc("");
            setResultCta("Поддержка");
            setResultOnCta(() => () => {
              setResultOpen(false);
              navigate("/support");
            });
            setResultOpen(true);
          }
        }}
      />


      <FlexibleModal
        open={resultOpen}
        title={resultTitle}
        description={resultDesc}
        ctaLabel={resultCta}
        onCta={resultOnCta}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}