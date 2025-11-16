import { useEffect, useMemo, useState } from "react";
import TopBar from "../../../widgets/topbarTextpage";
import DepositInfo from "./ui/DepositInfo";
import { getDepositAddress } from "../../../entities/wallet/api/walet.api";
import type { DepositAddress } from "../../../entities/wallet/model/types";
import { useGetUserQuery } from "../../../shared/api/user.api";
import { getTelegramUser } from "../../../shared/telegram/telegram";
import "./index.scss";

function avatarFrom(username?: string | null, name?: string | null) {
  const seed = username || name || "user";
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    seed
  )}`;
}

export default function WalletPage() {
  const [addr, setAddr] = useState<DepositAddress | null>(null);

  useEffect(() => {
    getDepositAddress().then(setAddr);
  }, []);

  const { data } = useGetUserQuery({ populate: true });
  const u = (data as any)?.data ?? (data as any);
  const tg = getTelegramUser();

  const displayName = useMemo(() => {
    if (u?.name) return u.name;
    if (tg?.first_name || tg?.last_name) {
      return [tg?.first_name, tg?.last_name].filter(Boolean).join(" ");
    }
    return "Без имени";
  }, [u, tg]);

  const displayUsername = useMemo(() => {
    return u?.username || tg?.username || "—";
  }, [u, tg]);

  const avatarUrl = useMemo(() => {
    return (u as any)?.avatarUrl || (tg as any)?.photo_url || avatarFrom(displayUsername, displayName);
  }, [u, tg, displayUsername, displayName]);

  if (!addr) return null;

  return (
    <div className="wallet">
      <TopBar title="Кошелек" />
      <DepositInfo
        avatarSrc={avatarUrl}
        title="Пополнить счёт"
        captionTop={`Это ваш адрес ${addr.network.replace("_", " ")}\nдля пополнения`}
        warnTop={`Скопируйте и внимательно проверьте, один`}
        warnStrong={" пропущенный символ приведет к потере средств!"}
        warnBottom=""
        note={"Убедитесь в корректности сети,\n которую вы выбрали для вывода!"}
        address={addr.address}
        cta="Скопировать адрес"
      />
    </div>
  );
}