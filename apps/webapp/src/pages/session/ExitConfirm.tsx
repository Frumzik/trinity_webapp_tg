import { useLocation, useNavigate } from "react-router-dom";
import GradientButton from "../../shared/ui/gradient-button";
import "./session.scss";

type ExitState = {
  track: any;
  current?: number;
  duration?: number;
  progressPct?: number;
  queue?: any[];
  index?: number;
  meta?: { action: "back" | "prev" | "next" | "autoNext" };
  trainingId?: number | string;
} | null;
function formatTimeMmSs(totalSec: number) {
  const sec = Math.max(0, Math.round(totalSec || 0));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getMinutesWord(minutes: number) {
  const n = minutes % 100;
  if (n >= 11 && n <= 14) return "минут";
  const last = n % 10;
  if (last === 1) return "минута";
  if (last >= 2 && last <= 4) return "минуты";
  return "минут";
}
export default function ExitConfirm() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: ExitState };

  const t = state?.track;
  const totalSec = Math.max(0, Math.round((state?.current ?? 0) as number));
  const minutes = Math.floor(totalSec / 60) || 0;
  const timeLabel = formatTimeMmSs(totalSec);
  const minutesWord = getMinutesWord(minutes || 1);
  const decide = (decision: "save" | "discard") => {
    if (decision === "discard" && state?.track?.id != null) {
      const lessonId = state.track.id;

      // Полностью удаляем оба вида прогресса
      localStorage.removeItem(`lessonProgress:${lessonId}`);

      const raw = localStorage.getItem("lessonProgress");
      if (raw) {
        const all = JSON.parse(raw) || {};
        delete all[String(lessonId)];
        localStorage.setItem("lessonProgress", JSON.stringify(all));
      }
    }

    nav("/player", {
      replace: true,
      state: {
        ...state,
        decision,
      },
    });
  };
  return (
    <div className="session__wrapper">
    <div className="session session--blur" style={{ backgroundImage: `url(${t?.artworkUrl})` }}>
      <div className="session__shade" />

      <div className="session__center">
        <div className="session__title" style={{ color: "#FFF" }}>{t?.title}</div>
        {t?.subtitle && <div className="session__subtitle" style={{ color: "#FFF" }}>{t.subtitle}</div>}
        <div
          className="session__chip"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.10)",
            background: "rgba(255, 255, 255, 0.25)",
            boxShadow: "0 4px 20px 0 rgba(15, 23, 42, 0.04)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            color: "#FFF",
          }}
        >
          <span style={{ fontWeight: 700 }}>{timeLabel}</span> {minutesWord} прослушано
        </div>
      </div>

      <div className="session__actions">
        <GradientButton onClick={() => decide("save")}>Сохранить</GradientButton>
        <button className="session__link" onClick={() => decide("discard")}>
          Закончить сессию без сохранения
        </button>
      </div>
    </div>
    </div>
  );
}