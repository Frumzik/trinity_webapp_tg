import { useLocation, useNavigate } from "react-router-dom";
import GradientButton from "../../shared/ui/gradient-button";
import "./session.scss";
import TopBar from "../../widgets/topbarTextpage";

export default function SessionComplete() {
  const nav = useNavigate();
  const { state } = useLocation() as {
    state: { track: any; durationSec: number };
  };
  const t = state?.track;
  const minutes = Math.max(1, Math.round((state?.durationSec ?? 0) / 60));

  return (
    <div className="session session--complete">
      <TopBar title="Сессия завершилась" />

      <main className="session__main">
        <img className="session__thumb" src={t?.artworkUrl} alt="" />
        <div className="cont-session">
          <div className="session__title">{t?.title}</div>
          {t?.subtitle && <div className="session__subtitle">{t.subtitle}</div>}
          <div className="session__chip">
            <span style={{ fontWeight: "700" }}>{minutes}</span> минут прошло
          </div>
        </div>
      </main>

      <footer className="session__footer">
        <div className="session__done-banner">Практика пройдена</div>
        <GradientButton onClick={() => nav("/")}>Продолжить</GradientButton>
      </footer>
    </div>
  );
}
