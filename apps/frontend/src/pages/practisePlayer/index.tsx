import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PlayerPage, { type MediaTrack as UITrack, type PlayerPayload } from '../../widgets/practisePlayer';
import { useGetLessonAdminQuery, useLazyGetLessonAdminQuery } from '../../shared/api/contentAdmin.api';
import { useLessonFavorite } from '../../shared/lib/hooks/useLessonFavorite';

type MediaTrack = {
  id: string | number;
  title: string;
  subtitle?: string;
  mediaUrl?: string;
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
  mediaUrl: t.mediaUrl!,
  artworkUrl: t.artworkUrl ?? '',
  isFavorite: fav,
});

function saveLessonProgress(lessonId: number | string, current: number, duration: number, completed: boolean) {
  try {
    localStorage.setItem(
      `lessonProgress:${lessonId}`,
      JSON.stringify({ lessonId, current, duration, completed, updatedAt: Date.now() })
    );
  } catch {}
}

const ratio = (p: PlayerPayload) => {
  const dur = Math.max(1, Math.round(p.duration || 0));
  const cur = Math.max(0, Math.round(p.current || 0));
  return cur / dur;
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
  const trainingIdRef = useRef<number | string | undefined>(navState?.trainingId);
  const returnToRef = useRef<string | undefined>(navState?.returnTo);

  const playedMsRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const tickerRef = useRef<number | null>(null);
  const durationRef = useRef<number>(0);

  const track = useMemo(
    () => (queue.length ? queue[(index + queue.length) % queue.length] : null),
    [queue, index]
  );

  const currentLessonId = track ? Number(track.id) : undefined;
  const currentTrainingId = trainingIdRef.current ? Number(trainingIdRef.current) : undefined;
  const { isFav, toggle, pending } = useLessonFavorite(currentLessonId, currentTrainingId);

  useEffect(() => {
    if (queue.length || !lessonRes?.data) return;
    const l: any = lessonRes.data;
    const media = l?.content?.audioUrl || l?.mediaUrl;
    if (!media) return;
    trainingIdRef.current = Number(l?.parentId) || trainingIdRef.current;
    if (!returnToRef.current && trainingIdRef.current != null) {
      returnToRef.current = `/level/${trainingIdRef.current}`;
    }
    setQueue([
      {
        id: l.lessonId,
        title: l.title,
        subtitle: l.duration ?? undefined,
        mediaUrl: media,
        artworkUrl: l.coverUrl ?? undefined,
      },
    ]);
    setIndex(0);
  }, [lessonRes, queue.length]);

  useEffect(() => {
    (async () => {
      if (!track || track.mediaUrl) return;
      try {
        const res = await fetchLesson({ id: Number(track.id), populate: true }).unwrap();
        const l: any = res.data;
        const media = l?.content?.audioUrl || l?.mediaUrl;
        if (media)
          setQueue((q) => q.map((t, i) => (i === index ? { ...t, mediaUrl: media } : t)));
      } catch {}
    })();
  }, [track?.id, track?.mediaUrl, index, fetchLesson]);

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

  const onPrev = queue.length > 1 ? () => requestConfirm({ kind: 'prev' }) : undefined;
  const onNext = queue.length > 1 ? () => requestConfirm({ kind: 'next' }) : undefined;
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
      const url =
        returnToRef.current ??
        (typeof trainingIdRef.current === 'number' ? `/level/${trainingIdRef.current}` : '/levels');
      navigate(url, { replace: true });
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

  if (!track || !track.mediaUrl) {
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
      isFav={isFav}
      onToggleFav={() => !pending && toggle()}
    />
  );
}