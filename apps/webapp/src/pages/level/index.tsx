import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Hero from './ui/Hero';
import TopActions from './ui/TopActions';
import Sheet from './ui/Sheet';
import './level.scss';
import PracticeSlider from '../../widgets/practise-card-slider';
import SectionHeader from './ui/Sectionheader';
import { useGetUserTrainingByIdQuery } from '../../shared/api/learning.api';
import { useLazyGetLessonAdminQuery } from '../../shared/api/contentAdmin.api';

/** ---------- Local progress (front-only) ---------- */
type LocalProgress = {
  seconds: number;
  duration: number;
  status: 'in_progress' | 'completed';
};
const LP_KEY = 'lessonProgress';

const lpLoad = (): Record<string, LocalProgress> => {
  try { return JSON.parse(localStorage.getItem(LP_KEY) || '{}'); } catch { return {}; }
};
const lpSave = (obj: Record<string, LocalProgress>) => {
  try { localStorage.setItem(LP_KEY, JSON.stringify(obj)); } catch {}
};

export const lpMarkInProgress = (lessonId: number | string, duration = 0, seconds = 0) => {
  const k = String(lessonId);
  const lp = lpLoad();
  const prev = lp[k] || { seconds: 0, duration: 0, status: 'in_progress' as const };
  lp[k] = { ...prev, seconds, duration: Math.max(prev.duration, duration), status: 'in_progress' };
  lpSave(lp);
};

export const lpMarkCompleted = (lessonId: number | string) => {
  const k = String(lessonId);
  const lp = lpLoad();
  lp[k] = {
    seconds: Math.max(lp[k]?.seconds ?? 0, lp[k]?.duration ?? 0),
    duration: lp[k]?.duration ?? 0,
    status: 'completed'
  };
  lpSave(lp);
};
const setCompleted = (lessonId: number | string) => {
  const key = String(lessonId);
  const lp = lpLoad();
  lp[key] = { seconds: 0, duration: 0, status: 'completed' };
  lpSave(lp);
};
const mergeStatus = (lesson: any, lp: Record<string, LocalProgress>) => {
  const server = (lesson?.progressStatus as string) || 'not_started';
  const local = lp[String(lesson?.lessonId)];
  if (local?.status === 'completed') return 'completed';
  if (server === 'completed') return 'completed';
  if (local?.status === 'in_progress') return 'in_progress';
  return server;
};

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useGetUserTrainingByIdQuery({
    id: Number(id),
  });
  const [fetchLesson] = useLazyGetLessonAdminQuery();

  const training = data?.data;
  const lessons = training?.lessons ?? [];

  /** принятый payload из плеера (выход/complete) — применяем локально */
  useEffect(() => {
    const st = location.state as
      | {
          sessionDecision?: 'save' | 'discard';
          session?: {
            lessonId: number | string;
            current: number;
            duration: number;
            completed: boolean;
          };
        }
      | undefined;

    if (st?.sessionDecision === 'save' && st.session) {
      const { lessonId, current, duration, completed } = st.session;
      const lp = lpLoad();
      lp[String(lessonId)] = {
        seconds: Math.max(0, Math.round(current)),
        duration: Math.max(0, Math.round(duration)),
        status: completed ? 'completed' : 'in_progress',
      };
      lpSave(lp);
    }
    // очистить одноразовый стейт
    if (st?.sessionDecision) window.history.replaceState({}, '');
  }, [location.state]);

  const tiles = useMemo(
    () =>
      lessons.map((l: any) => ({
        id: l.lessonId,
        title: l.title,
        subtitle: l.duration ?? '',
        imageUrl: l.coverUrl ?? training?.coverUrl ?? '',
        accessStatus: l.accessStatus,
        typeHint: l.type,
      })),
    [lessons, training]
  );

  const audioItems = useMemo(() => {
    return (training?.lessons ?? [])
      .filter((l: any) => l.type === 'audio')
      .map((l: any) => ({
        id: l.lessonId,
        title: l.title,
        subtitle: l.duration ?? undefined,
        artworkUrl: l.coverUrl ?? training?.coverUrl ?? undefined,
        mediaUrl: undefined as string | undefined, // префетч/плеер дотянет
      }));
  }, [training]);

  const videoItems = useMemo(() => {
    return (training?.lessons ?? [])
      .filter((l: any) => l.type === 'video')
      .map((l: any) => ({
        id: l.lessonId,
        title: l.title,
        subtitle: l.duration ?? undefined,
        artworkUrl: l.coverUrl ?? training?.coverUrl ?? undefined,
        // ключевой момент: для видео используем videoUrl (подставим позже)
        videoUrl: undefined as string | undefined,
      }));
  }, [training]);
  const handleOpen = async (lessonId: number | string) => {
    const backTarget = `/level/${training.trainingId}`;

    const audioIdx = audioItems.findIndex((i) => String(i.id) === String(lessonId));
    if (audioIdx !== -1) {
      try {
        const res = await fetchLesson({ id: Number(lessonId), populate: true }).unwrap();
        const l: any = res.data;
        const media = l?.content?.audioUrl || l?.mediaUrl;
        const queuePrefilled = media
          ? audioItems.map((it) =>
            String(it.id) === String(lessonId) ? { ...it, mediaUrl: media } : it
          )
          : audioItems;
        lpMarkCompleted(lessonId);
        navigate('/player', {
          state: {
            queue: queuePrefilled,
            index: audioIdx,
            trainingId: training.trainingId,
            returnTo: backTarget,
          },
        });
        return;
      } catch {
        lpMarkCompleted(lessonId);
        navigate('/player', {
          state: {
            queue: audioItems,
            index: audioIdx,
            trainingId: training.trainingId,
            returnTo: backTarget,
          },
        });
        return;
      }
    }

    // 2) видео-плейлист — НОВОЕ
    const videoIdx = videoItems.findIndex((i) => String(i.id) === String(lessonId));
    if (videoIdx !== -1) {
      try {
        const res = await fetchLesson({ id: Number(lessonId), populate: true }).unwrap();
        const l: any = res.data;
        const vurl = l?.content?.videoUrl || l?.videoUrl;
        const queuePrefilled = vurl
          ? videoItems.map((it) =>
            String(it.id) === String(lessonId) ? { ...it, videoUrl: vurl } : it
          )
          : videoItems;
        lpMarkCompleted(lessonId);
        navigate('/player', {
          state: {
            queue: queuePrefilled,
            index: videoIdx,
            trainingId: training.trainingId,
            returnTo: backTarget,
          },
        });
        return;
      } catch {
        lpMarkCompleted(lessonId);
        navigate('/player', {
          state: {
            queue: videoItems,
            index: videoIdx,
            trainingId: training.trainingId,
            returnTo: backTarget,
          },
        });
        return;
      }
    }

    // 3) текст — как было
    try {
      const res = await fetchLesson({ id: Number(lessonId), populate: true }).unwrap();
      const l: any = res.data;
      const isText = l?.type === 'text' || !!l?.content?.html;
      if (isText && training) {
        setCompleted(lessonId); // текст сразу считаем выполненным
        navigate(`/lesson/${training.trainingId}/${lessonId}`);
        return;
      }
    } catch {}

    alert('Контент этого урока ещё не загружен');
  };



  const headerProgress = useMemo(() => {
    const lp = lpLoad();
    const total = lessons.length;

    const started = lessons.filter((l: any) => {
      const rec = lp[String(l.lessonId)];
      return rec?.status === 'in_progress' || rec?.status === 'completed';
    }).length;
    return { current: started, total };
  }, [lessons]);

  const returnTo = (location.state as any)?.returnTo as string | undefined;


  if (isLoading) {
    return (
      <div className="preview">
        <div style={{ padding: 16 }}>Загрузка…</div>
      </div>
    );
  }
  if (isError || !training) {
    return (
      <div className="preview">
        <div style={{ padding: 16 }}>
          Не удалось загрузить ступень.{' '}
          <button onClick={() => refetch()}>Повторить</button>
        </div>
      </div>
    );
  }

  return (
    <div className="preview">
      <TopActions
        onBack={() => {
          if (returnTo) {
            navigate(returnTo, { replace: true });
          } else {
            navigate('/levels', { replace: true });
          }
        }}
        onMenu={() => {}}
      />

      <Hero
        imageSrc={training.coverUrl ?? ''}
        header={{
          title: training.title,
          subtitle: training.description ?? '',
          practicesCount: lessons.length,
          progress: headerProgress,
        }}
      />

      <Sheet>
        <SectionHeader title="Уроки" count={tiles.length} />
        <PracticeSlider
          items={tiles.map((t) => ({
            id: t.id,
            title: t.title,
            subtitle: t.subtitle,
            imageUrl: t.imageUrl,
            onClick: () => handleOpen(t.id),
          }))}
        />
      </Sheet>
    </div>
  );
}
