import { useLocation, useNavigate } from 'react-router-dom';
import GradientButton from '../../shared/ui/gradient-button';
import './session.scss';
import TopBar from '../../widgets/topbarTextpage';

type Track = {
  id: number | string;
  title: string;
  subtitle?: string;
  artworkUrl?: string;
};

type CompleteState = {
  track: Track;
  current?: number;
  duration?: number;
  progressPct?: number;
  completed?: boolean;

  queue?: any[];
  index?: number;
  nextIndex?: number;
  returnTo?: string;
  trainingId?: number | string;
} | null;

export default function SessionComplete() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: CompleteState };

  const t = state?.track;
  const minutes = Math.max(
    1,
    Math.round(((state?.duration ?? 0) as number) / 60)
  );

  const hasQueue =
    Array.isArray(state?.queue) && (state!.queue as any[]).length > 0;
  const idx = typeof state?.index === 'number' ? state!.index! : undefined;
  const nx =
    typeof state?.nextIndex === 'number'
      ? state!.nextIndex!
      : typeof idx === 'number' && hasQueue
      ? idx + 1
      : undefined;
  const hasNext =
    hasQueue &&
    typeof nx === 'number' &&
    nx! >= 0 &&
    nx! < (state!.queue as any[]).length;

  const continueAction = () => {
    if (hasNext) {
      // перейти к следующему (ленивая подгрузка url — в плеере)
      nav('/player', {
        replace: true,
        state: {
          queue: state!.queue,
          index: nx,
          trainingId: state?.trainingId,
          decision: 'save',
          meta: { action: 'autoNext' as const },
          // передадим и payload на всякий, чтобы можно было посчитать ratio при холодном возврате
          track: state!.track,
          current: state!.current,
          duration: state!.duration,
          progressPct: state!.progressPct,
        },
      });
      return;
    }
    if (state?.returnTo) {
      nav(state.returnTo, { replace: true });
      return;
    }
    if (state?.trainingId != null) {
      nav(`/level/${state.trainingId}`, { replace: true });
      return;
    }
    nav('/levels', { replace: true });
  };

  return (
    <div className="session session--complete">
      <TopBar title="Сессия завершилась"   backTo={state?.returnTo ?? '/level'}
      />
      <main className="session__main">
        {t?.artworkUrl && (
          <img className="session__thumb" src={t.artworkUrl} alt="" />
        )}
        <div className="cont-session">
          <div className="session__title">{t?.title}</div>
          {t?.subtitle && <div className="session__subtitle">{t.subtitle}</div>}
          <div className="session__chip">
            <span style={{ fontWeight: 700 }}>{minutes}</span> минут прошло
          </div>
        </div>
      </main>

      <footer className="session__footer">
        <div className="session__done-banner">Практика пройдена</div>
        <GradientButton onClick={continueAction}>
          {hasNext ? 'Продолжить' : 'К списку уроков'}
        </GradientButton>
      </footer>
    </div>
  );
}
