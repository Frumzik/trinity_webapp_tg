import { useState } from "react";
import WebApp from "@twa-dev/sdk";              // <-- уже есть в проекте
import PresentationSentModal from "../presentation-sent-modal";
import DownloadIcon from "../../assets/icons/download.svg";
import "./burger.scss";

type Props = { open: boolean; onClose: () => void };

export default function BurgerMenu({ open, onClose }: Props) {
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onDownload = async (e: React.MouseEvent) => {
    e.preventDefault();

    const tgId =
      WebApp.initDataUnsafe?.user?.id ??
      (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.id;

    if (!tgId) {
      console.error("tgId не найден, возможно, ты не в Telegram WebApp");
      alert("Не могу найти tgId. Открой приложение внутри Telegram.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Отправляю запрос в бота с tgId =", tgId);

      const res = await fetch("https://bot.3nity.space/bot/presentation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tgId }),
      });

      console.log("Ответ от сервера:", res);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Ошибка ответа:", res.status, text);
        alert(`Ошибка отправки презентации: ${res.status}`);
        return;
      }

      setOpenModal(true);
    } catch (err) {
      console.error("Сетевая ошибка при запросе в бота:", err);
      alert("Не получилось достучаться до сервера бота (network error).");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={`drawer ${open ? "drawer--open" : ""}`} onClick={onClose}>
      <div className="drawer__overlay" />
      <aside className="drawer__panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer_wrapper">
          <nav className="drawer__list">
            <a className="drawer__item" href="/settings">
              Настройки
            </a>
            <a className="drawer__item" href="/about">
              О проекте
            </a>
            <a className="drawer__item" href="#" onClick={onDownload}>
              {isLoading ? (
                "Отправляем…"
              ) : (
                <>
                  Скачать
                  <br /> презентацию <img src={DownloadIcon} alt="" />
                </>
              )}
            </a>
          </nav>
        </div>
        <div className="drawer__footer">Trinity</div>
      </aside>

      <PresentationSentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        fileName="Trinity.pdf"
        fileSizeText="9.1 MB"
        durationText="00:00"
      />
    </div>
  );
}