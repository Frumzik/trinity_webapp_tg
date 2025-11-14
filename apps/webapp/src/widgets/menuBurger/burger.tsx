import { useState } from "react";
import PresentationSentModal from "../presentation-sent-modal";
import DownloadIcon from "../../assets/icons/download.svg";
import "./burger.scss";

type Props = { open: boolean; onClose: () => void };

export default function BurgerMenu({ open, onClose }: Props) {
  const [openModal, setOpenModal] = useState(false);

  const onDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenModal(true);
  };

  return (
    <div className={`drawer ${open ? "drawer--open" : ""}`} onClick={onClose}>
      <div className="drawer__overlay" />
      <aside className="drawer__panel" onClick={(e) => e.stopPropagation()}>
        <nav className="drawer__list">
          <a className="drawer__item" href="/settings">
            Настройки
          </a>
          <a className="drawer__item" href="/about">
            О проекте
          </a>
          <a className="drawer__item" href="#" onClick={onDownload}>
            Скачать
            <br /> презентацию <img src={DownloadIcon} alt="" />
          </a>
        </nav>
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
