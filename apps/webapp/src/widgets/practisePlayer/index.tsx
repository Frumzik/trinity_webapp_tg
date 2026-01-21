import { useEffect, useRef, useState, useCallback } from 'react';
import clsx from 'clsx';
import TopActions from '../../pages/level/ui/TopActions';
import rigthArrow from '../../assets/image/level/arrow-right.svg';
import leftArrow from '../../assets/image/level/arrow-left.svg';
import '../../pages/practisePlayer/player.scss';

export type MediaTrack = {
  id: string | number;
  title: string;
  subtitle?: string;
  mediaUrl?: string;
  videoUrl?: string;
  artworkUrl?: string;
  isFavorite?: boolean;
};

export type PlayerPayload = {
  track: MediaTrack;
  current: number;
  duration: number;
  progressPct: number;
  completed: boolean;
};

type Props = {
  track: MediaTrack;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onMenu?: () => void;
  onProgress?: (p: PlayerPayload) => void;
  onToggleFav?: (next: boolean) => void;
  onExit?: (p: PlayerPayload) => void;
  onCompleted?: (p: PlayerPayload) => void;
  onDurationReady?: (sec: number) => void;
  resumeAtSec?: number;
  showFav?: boolean;
  className?: string;

  extraBottom?: React.ReactNode;
};

const AUTOHIDE_MS = 2000;

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function PlayerPage({
  track,
  onBack,
  onPrev,
  onNext,
  onMenu,
  onToggleFav,
  onExit,
  onProgress,
  onCompleted,
  onDurationReady,
  resumeAtSec = 0,
  showFav = true,
  className,
  extraBottom,
}: Props) {
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const isVideo = !!track.videoUrl;
  const src = isVideo ? track.videoUrl! : track.mediaUrl || '';
  const lastSavedRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFav, setFav] = useState(!!track.isFavorite);
  const [scrub, setScrub] = useState(false);

  // HUD visibility (только для видео)
  const [hudVisible, setHudVisible] = useState(true);
  const hideTimerRef = useRef<number | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const onErr = () => {
    const m = mediaRef.current;
    console.log('MEDIA ERROR', m?.error, { src });
  };

  const onStalled = () => console.log('MEDIA STALLED', { src });
  const onWaiting = () => console.log('MEDIA WAITING', { src });

  const scheduleHide = useCallback(() => {
    if (!isVideo) return;
    clearHideTimer();
    if (playing) {
      hideTimerRef.current = window.setTimeout(() => {
        setHudVisible(false);
      }, AUTOHIDE_MS);
    }
  }, [isVideo, playing]);

  const bumpHud = useCallback(() => {
    if (!isVideo) return;
    setHudVisible(true);
    scheduleHide();
  }, [isVideo, scheduleHide]);

  useEffect(() => {
    const m = mediaRef.current;
    setReady(false);
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setHudVisible(true);
    clearHideTimer();

    if (m) {
      (m as HTMLMediaElement).src = src;
      (m as HTMLMediaElement).load?.();
    }
  }, [track.id, src]);

  // события media
  useEffect(() => {
    const m = mediaRef.current;
    if (!m) return;

    const onLoaded = () => {
      const d = Number.isFinite(m.duration) ? m.duration : 0;
      setDuration(d);
      setReady(true);
      if (resumeAtSec && d > 0) {
        const start = Math.min(d - 0.5, Math.max(0, resumeAtSec));
        m.currentTime = start;
        setCurrent(start);
      }
      onDurationReady?.(d);
    };

    const onTime = () => {
      if (!scrub) {
        setCurrent(m.currentTime);
        const now = Date.now();
        if (now - lastSavedRef.current > 2000) {
          lastSavedRef.current = now;
          onProgress?.({
            track,
            current: m.currentTime,
            duration: m.duration || 0,
            progressPct: ((m.currentTime || 0) / (m.duration || 1)) * 100,
            completed: false,
          });
        }
      }
    };

    const onPlay = () => {
      setPlaying(true);
      scheduleHide();
    };

    const onPause = () => {
      setPlaying(false);
      setHudVisible(true);
      clearHideTimer();
    };

    const onEnded = () => {
      setPlaying(false);
      setHudVisible(true);
      clearHideTimer();
      onCompleted?.({
        track,
        current: m.currentTime,
        duration: m.duration || 0,
        progressPct: ((m.currentTime || 0) / (m.duration || 1)) * 100,
        completed: true,
      });
    };

    m.addEventListener('loadedmetadata', onLoaded);
    m.addEventListener('timeupdate', onTime);
    m.addEventListener('play', onPlay);
    m.addEventListener('pause', onPause);
    m.addEventListener('ended', onEnded);
    return () => {
      m.removeEventListener('loadedmetadata', onLoaded);
      m.removeEventListener('timeupdate', onTime);
      m.removeEventListener('play', onPlay);
      m.removeEventListener('pause', onPause);
      m.removeEventListener('ended', onEnded);
    };
  }, [
    onCompleted,
    onDurationReady,
    onProgress,
    scrub,
    track,
    resumeAtSec,
    scheduleHide,
  ]);
  // хоткеи
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.code === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
      }
      // любое взаимодействие — показать HUD и перезапланировать скрытие (когда видео играет)
      if (isVideo) bumpHud();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPrev, onNext, ready, playing, isVideo, bumpHud]);

  const togglePlay = async () => {
    const m = mediaRef.current;
    if (!m || !ready) return;

    if (playing) {
      m.pause();
      setPlaying(false);
      setHudVisible(true);
      clearHideTimer();
    } else {
      setHudVisible(true);
      try {
        await m.play();
        setPlaying(true);
        scheduleHide(); // << ключевое
      } catch {}
    }
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;
  const onScrubStart = () => {
    setScrub(true);
    if (isVideo) setHudVisible(true);
    clearHideTimer();
  };
  const onScrubChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCurrent(Number(e.target.value));

  const onScrubEnd = () => {
    const m = mediaRef.current;
    if (!m) return;
    m.currentTime = current;
    setScrub(false);
    if (isVideo && playing) scheduleHide();
  };
  useEffect(() => {
    setFav(!!track.isFavorite);
  }, [track.isFavorite]);
  const toggleFav = () => {
    const next = !isFav;
    setFav(next);
    onToggleFav?.(next);
  };
  useEffect(() => {
    if (!isVideo) return;
    if (playing) {
      setHudVisible(true);
      scheduleHide();
    } else {
      setHudVisible(true);
      clearHideTimer();
    }
  }, [isVideo, playing, scheduleHide]);
  const backWithPayload = () => {
    const m = mediaRef.current;
    const payload = m
      ? {
          track,
          current: m.currentTime,
          duration: m.duration || 0,
          progressPct: ((m.currentTime || 0) / (m.duration || 1)) * 100,
          completed: false,
        }
      : undefined;

    if (onExit && payload) onExit(payload);
    else onBack();
  };

  const onUserInteract = () => bumpHud();

  return (
    <div
      className={clsx(
        'player',
        isVideo && 'player--video',
        isVideo && !hudVisible && 'is-hud-hidden',
        className
      )}
      onPointerMove={isVideo ? onUserInteract : undefined}
      onPointerDown={isVideo ? onUserInteract : undefined}
    >
      {!isVideo && track.artworkUrl && (
        <>
          <img className="player__bg" src={track.artworkUrl} alt="" />
          <div className="player__shade" />
        </>
      )}

      <div className="player__top hud">
        <TopActions
          onBack={backWithPayload}
          onMenu={onMenu ?? (() => {})}
          showFav={showFav}
          isFav={isFav}
          onToggleFav={toggleFav}
        />
      </div>

      {onPrev && (
        <button
          className="player__nav player__nav--prev hud"
          onClick={onPrev}
          aria-label="Prev"
        >
          <img src={leftArrow} alt="" />
        </button>
      )}
      {onNext && (
        <button
          className="player__nav player__nav--next hud"
          onClick={onNext}
          aria-label="Next"
        >
          <img src={rigthArrow} alt="" />
        </button>
      )}

      <button
        className="player__play hud"
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        <span className={clsx('player__knob', playing && 'is-playing')}>
          <span className="player__play-icon">
            <svg width="80" height="80" viewBox="0 0 28 28" fill="none">
              <path
                d="M10 7 L10 21 L20 14 Z"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </button>

      <div className="player__panel hud">
        <div className="player__title">{track.title}</div>
        {track.subtitle && (
          <div className="player__subtitle">{track.subtitle}</div>
        )}

        <div className="player__seek" style={{ ['--pct' as any]: `${pct}%` }}>
          <span className="player__time">{formatTime(current)}</span>
          <input
            type="range"
            min={0}
            max={Math.max(1, Math.floor(duration))}
            step={1}
            value={Math.floor(current)}
            onMouseDown={onScrubStart}
            onTouchStart={onScrubStart}
            onChange={onScrubChange}
            onMouseUp={onScrubEnd}
            onTouchEnd={onScrubEnd}
            className="player__range"
            aria-label="Seek"
          />
          <span className="player__time">{formatTime(duration)}</span>
        </div>
      </div>

      {track.videoUrl ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          className="player__video"
          preload="metadata"
          playsInline
          controls={false}
          onClick={onUserInteract}
          onPointerDown={onUserInteract}
          onError={onErr}
          onStalled={onStalled}
          onWaiting={onWaiting}
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          preload="metadata"
          onError={onErr}
          onStalled={onStalled}
          onWaiting={onWaiting}
        />
      )}

      {extraBottom && <div className="player__bottom hud">{extraBottom}</div>}
    </div>
  );
}
