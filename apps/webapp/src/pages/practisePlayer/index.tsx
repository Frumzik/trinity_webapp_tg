// src/pages/practisePlayer/PlayerScreen.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PlayerPage, {
  type MediaTrack as UITrack,
  type PlayerPayload,
} from '../../widgets/practisePlayer';
import {
  useGetLessonAdminQuery,
  useLazyGetLessonAdminQuery,
} from '../../shared/api/contentAdmin.api';
import { useLessonFavorite } from '../../shared/lib/hooks/useLessonFavorite';
import { lpMarkInProgress } from '../level';

type MediaTrack = {
  id: string | number;
  title: string;
  subtitle?: string;
  mediaUrl?: string;
  videoUrl?: string;
  artworkUrl?: string;
};

type NavState = {
  track?: any;
  current?: number;
  duration?: number;
  progressPct?: number;
  completed?: boolean;
  decision?: 'save' | 'discard';
  meta?: { action: 'back' | 'prev' | 'next' | 'autoNext' };
  queue?: MediaTrack[];
  index?: number;
  trainingId?: number | string;
  returnTo?: string;
} | null;

type PendingAction = { kind: 'back' | 'prev' | 'next' | 'autoNext' } | null;

const toUI = (t: MediaTrack, fav: boolean): UITrack => ({
  id: t.id,
  title: t.title,
  subtitle: t.subtitle,
  mediaUrl: t.mediaUrl,
  videoUrl: t.videoUrl,
  artworkUrl: t.artworkUrl ?? '',
  isFavorite: fav,
});

function saveLessonProgress(
  lessonId: number | string,
  current: number,
  duration: number,
  completed: boolean
) {
  try {
    localStorage.setItem(
      `lessonProgress:${lessonId}`,
      JSON.stringify({
        lessonId,
        current,
        duration,
        completed,
        updatedAt: Date.now(),
      })
    );
  } catch {}
}

const ratio = (p: PlayerPayload) => {
  const dur = Math.max(1, Math.round(p.duration || 0));
  const cur = Math.max(0, Math.round(p.current || 0));
  return cur / dur;
};

// локальная прога как на странице Level
const lpLoad = (): Record<
  string,
  { seconds: number; duration: number; status: 'in_progress' | 'completed' }
> => {
  try {
    return JSON.parse(localStorage.getItem('lessonProgress') || '{}');
  } catch {
    return {};
  }
};

export default function PlayerScreen() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as NavState) ?? null;

  const { data: lessonRes } = useGetLessonAdminQuery(
    { id: Number(trackId), populate: true },
    { skip: !trackId }
  );
  const [fetchLesson] = useLazyGetLessonAdminQuery();

  const [queue, setQueue] = useState<MediaTrack[]>(navState?.queue ?? []);
  const [index, setIndex] = useState<number>(navState?.index ?? 0);
  const trainingIdRef = useRef<number | string | undefined>(
    navState?.trainingId
  );
  const returnToRef = useRef<string | undefined>(navState?.returnTo);

  // описание урока (для низа)
  const [desc, setDesc] = useState<string | null>(null);

  const playedMsRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const tickerRef = useRef<number | null>(null);
  const durationRef = useRef<number>(0);

  const track = useMemo(
    () => (queue.length ? queue[(index + queue.length) % queue.length] : null),
    [queue, index]
  );

  const currentLessonId = track ? Number(track.id) : undefined;
  const currentTrainingId = trainingIdRef.current
    ? Number(trainingIdRef.current)
    : undefined;
  const { isFav, toggle, pending } = useLessonFavorite(
    currentLessonId,
    currentTrainingId
  );

  // первичная подгрузка одиночного урока (когда зашли по /player/:trackId без очереди)
  useEffect(() => {
    if (queue.length || !lessonRes?.data) return;

    const l: any = lessonRes.data;
    const media = l?.content?.audioUrl || l?.mediaUrl;
    const vurl = l?.content?.videoUrl || l?.videoUrl;
    if (!media && !vurl) return;

    trainingIdRef.current = Number(l?.parentId) || trainingIdRef.current;
    if (!returnToRef.current && trainingIdRef.current != null) {
      returnToRef.current = `/level/${trainingIdRef.current}`;
    }

    const descText =
      l?.description ??
      l?.shortDescription ??
      l?.parent?.description ??
      null;
    setDesc(descText);

    // фоновая картинка ДЛЯ АУДИО: сначала bgUrl, потом parent.bgUrl, потом cover'ы
    const bgImage =
      !vurl
        ? (l?.bgUrl ??
          l?.parent?.bgUrl ??
          l?.coverUrl ??
          l?.parent?.coverUrl ??
          undefined)
        : undefined;

    setQueue([
      {
        id: l.lessonId,
        title: l.title,
        subtitle: descText || undefined,
        mediaUrl: media,
        videoUrl: vurl,
        artworkUrl: bgImage,
      },
    ]);
    setIndex(0);
  }, [lessonRes, queue.length]);

  // догружаем медиа/описание/фон для элемента очереди
  useEffect(() => {
    (async () => {
      if (!track) return;

      try {
        const res = await fetchLesson({
          id: Number(track.id),
          populate: true,
        }).unwrap();
        const l: any = res.data;
        const media = l?.content?.audioUrl || l?.mediaUrl;
        const vurl = l?.content?.videoUrl || l?.videoUrl;

        const descText =
          l?.description ??
          l?.shortDescription ??
          l?.parent?.description ??
          null;
        setDesc(descText);

        const bgImage =
          !vurl
            ? (l?.bgUrl ??
              l?.parent?.bgUrl ??
              l?.coverUrl ??
              l?.parent?.coverUrl ??
              undefined)
            : undefined;

        setQueue((q) =>
          q.map((t, i) =>
            i === index
              ? {
                ...t,
                ...(media ? { mediaUrl: media } : {}),
                ...(vurl ? { videoUrl: vurl } : {}),
                subtitle: descText || t.subtitle,
                // фон для аудио
                ...(bgImage ? { artworkUrl: bgImage } : {}),
              }
              : t
          )
        );
      } catch {
        // молча
      }
    })();
  }, [track?.id, index, fetchLesson]);

  // таймер «прослушано/просмотрено»
  useEffect(() => {
    if (!track) return;

    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }

    startedAtRef.current = Date.now();
    tickerRef.current = window.setInterval(() => {
      if (startedAtRef.current != null) {
        const now = Date.now();
        playedMsRef.current += now - startedAtRef.current;
        startedAtRef.current = now;
      }
    }, 250);

    return () => {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
      if (startedAtRef.current != null) {
        playedMsRef.current += Date.now() - startedAtRef.current;
        startedAtRef.current = null;
      }
    };
  }, [track?.id]);

  const onDurationReady = (sec: number) => {
    durationRef.current = sec || 0;
  };

  const buildPayload = (completed: boolean): PlayerPayload => {
    const cur = Math.max(0, Math.round(playedMsRef.current / 1000));
    const dur = Math.max(cur, Math.round(durationRef.current || 0));
    const pct = dur ? Math.min(100, Math.round((cur / dur) * 100)) : 0;
    return {
      track: toUI(track!, isFav),
      current: cur,
      duration: dur,
      progressPct: pct,
      completed,
    };
  };

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const requestConfirm = (act: PendingAction) => {
    if (!track) return;
    if (startedAtRef.current != null) {
      playedMsRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = Date.now();
    }
    setPendingAction(act);
    const p = buildPayload(false);
    navigate('/player/exit', {
      state: {
        ...p,
        queue,
        index,
        trainingId: trainingIdRef.current,
        meta: { action: act?.kind || 'back' },
        returnTo: returnToRef.current,
      },
    });
  };

  const onPrev =
    queue.length > 1 ? () => requestConfirm({ kind: 'prev' }) : undefined;
  const onNext =
    queue.length > 1 ? () => requestConfirm({ kind: 'next' }) : undefined;
  const onBackTop = () => requestConfirm({ kind: 'back' });

  const handleCompleted = () => {
    if (startedAtRef.current != null) {
      playedMsRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
    const p = buildPayload(true);
    navigate('/player/complete', {
      state: {
        ...p,
        queue,
        index,
        trainingId: trainingIdRef.current,
        nextIndex: index + 1,
        returnTo: returnToRef.current,
      },
    });
  };

  useEffect(() => {
    if (trackId) lpMarkInProgress(Number(trackId));
  }, [trackId]);

  useEffect(() => {
    if (currentLessonId != null) lpMarkInProgress(currentLessonId);
  }, [currentLessonId]);

  // обработка результата из /player/exit
  useEffect(() => {
    const st = (location.state as NavState) || null;
    if (!st?.decision || !st?.meta?.action) return;

    if (Array.isArray(st.queue)) setQueue(st.queue);
    if (typeof st.index === 'number') setIndex(st.index);
    if (st.trainingId != null) trainingIdRef.current = st.trainingId;
    if (st.returnTo) returnToRef.current = st.returnTo;

    const p: PlayerPayload =
      st.track && typeof st.duration === 'number'
        ? {
          track: st.track,
          current: st.current ?? 0,
          duration: st.duration ?? 0,
          progressPct: st.progressPct ?? 0,
          completed: false,
        }
        : buildPayload(false);

    if (st.decision === 'save') {
      const completed = ratio(p) >= 0.5;
      saveLessonProgress(p.track.id, p.current, p.duration, completed);
    }

    const a = st.meta.action;
    if (a === 'back') {
      if (returnToRef.current) {
        navigate(returnToRef.current, { replace: true });
      } else if (typeof trainingIdRef.current === 'number') {
        navigate(`/level/${trainingIdRef.current}`, { replace: true });
      } else {
        navigate('/levels', { replace: true });
      }
    } else if (a === 'prev') {
      const len = st.queue?.length ?? queue.length;
      if (len > 0) setIndex((i) => (i - 1 + len) % len);
    } else if (a === 'next' || a === 'autoNext') {
      const len = st.queue?.length ?? queue.length;
      if (len > 0) setIndex((i) => (i + 1) % len);
    }

    navigate('.', { replace: true, state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressNode = (() => {
    const lp = lpLoad();
    const rec =
      currentLessonId != null ? lp[String(currentLessonId)] : undefined;
    const donePct = rec?.duration
      ? Math.min(
        100,
        Math.round((rec.seconds / Math.max(1, rec.duration)) * 100)
      )
      : 0;

    return (
      <div>
        {desc && <div className="player__desc">{desc}</div>}
        <div className="player__progress">
          <div
            className="player__progress-bar"
            style={{ ['--done' as any]: `${donePct}%` }}
          />
          <div className="player__progress-text">{donePct}%</div>
        </div>
      </div>
    );
  })();

  const [isFs, setIsFs] = useState(false);
  const toggleFullscreenLandscape = async () => {
    const el = document.fullscreenElement
      ? document
      : (document.querySelector('.player.player--video') as HTMLElement | null);
    try {
      if (!document.fullscreenElement) {
        if (el && 'requestFullscreen' in el) {
          await (el as any).requestFullscreen();
        }
        // @ts-ignore
        if (screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock('landscape');
          } catch {}
        }
        setIsFs(true);
      } else {
        // @ts-ignore
        if (screen.orientation && screen.orientation.unlock) {
          try {
            screen.orientation.unlock();
          } catch {}
        }
        await document.exitFullscreen();
        setIsFs(false);
      }
    } catch {
      setIsFs(!!document.fullscreenElement);
    }
  };

  if (!track || (!track.mediaUrl && !track.videoUrl)) {
    return (
      <div className="player player--loading">
        <div className="player__spinner">Загрузка…</div>
      </div>
    );
  }

  return (
    <PlayerPage
      track={toUI(track, isFav)}
      onBack={onBackTop}
      onPrev={onPrev}
      onNext={onNext}
      onMenu={() => {}}
      onExit={() => requestConfirm({ kind: 'back' })}
      onCompleted={handleCompleted}
      onDurationReady={onDurationReady}
      showFav
      onToggleFav={() => !pending && toggle()}
      extraBottom={progressNode}
      onToggleFullscreen={track.videoUrl ? toggleFullscreenLandscape : undefined}
      isFullscreen={isFs}
    />
  );
}