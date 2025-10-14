import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PlayerPage, {
  type MediaTrack,
  type PlayerPayload,
} from "../../widgets/practisePlayer";
import Card1 from "../../assets/image/level/card1.png";
import Card2 from "../../assets/image/level/card2.svg";
import Card3 from "../../assets/image/level/card4.svg";
import Audio from "../../assets/Лолита - Шпилька-каблучок.mp3";
import "./player.scss";

type TrackDTO = {
  id: number | string;
  title: string;
  subtitle?: string;
  media_url: string;
  artwork_url: string;
  is_favorite?: boolean;
};

function toMediaTrack(dto: TrackDTO): MediaTrack {
  return {
    id: dto.id,
    title: dto.title,
    subtitle: dto.subtitle,
    mediaUrl: dto.media_url,
    artworkUrl: dto.artwork_url,
    isFavorite: dto.is_favorite ?? false,
  };
}

async function fetchTrack(id: string | number): Promise<MediaTrack> {
  const mock: TrackDTO = {
    id,
    title: "Lion's breath",
    subtitle: "Sleep meditation",
    media_url: Audio,
    artwork_url: Card1,
    is_favorite: false,
  };
  return toMediaTrack(mock);
}

async function fetchPlaylist(): Promise<MediaTrack[]> {
  return [
    toMediaTrack({
      id: 101,
      title: "Lion's breath",
      subtitle: "Sleep meditation",
      media_url: "/audio/lion.mp3",
      artwork_url: Card1,
    }),
    toMediaTrack({
      id: 102,
      title: "Heavy Rain",
      subtitle: "Rain & focus",
      media_url: "/audio/rain.mp3",
      artwork_url: Card2,
      is_favorite: true,
    }),
    toMediaTrack({
      id: 103,
      title: "Ocean Waves",
      subtitle: "Calm & sleep",
      media_url: "/audio/ocean.mp3",
      artwork_url: Card3,
    }),
  ];
}

export default function PlayerScreen() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    queue?: MediaTrack[];
    index?: number;
  } | null;

  const [queue, setQueue] = useState<MediaTrack[] | null>(state?.queue ?? null);
  const [, setIndex] = useState<number>(state?.index ?? 0);
  const [track, setTrack] = useState<MediaTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        setLoading(true);
        setError(null);
        if (state?.queue?.length) {
          if (!cancelled) {
            setQueue(state.queue);
            setIndex(state.index ?? 0);
            setTrack(state.queue[state.index ?? 0]);
          }
          return;
        }
        if (trackId) {
          const t = await fetchTrack(trackId);
          if (!cancelled) {
            setQueue([t]);
            setIndex(0);
            setTrack(t);
          }
          return;
        }
        const list = await fetchPlaylist();
        if (!cancelled) {
          setQueue(list);
          setIndex(0);
          setTrack(list[0] ?? null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Ошибка загрузки");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [trackId, state]);

  const onPrev =
    queue && queue.length > 1
      ? () => {
          setIndex((i) => {
            const ni = (i - 1 + queue.length) % queue.length;
            setTrack(queue[ni]);
            return ni;
          });
        }
      : undefined;

  const onNext =
    queue && queue.length > 1
      ? () => {
          setIndex((i) => {
            const ni = (i + 1) % queue.length;
            setTrack(queue[ni]);
            return ni;
          });
        }
      : undefined;

  const onToggleFav = async (fav: boolean) => {
    setTrack((t) => (t ? { ...t, isFavorite: fav } : t));
    if (queue)
      setQueue(
        (q) =>
          q?.map((it) =>
            it.id === track?.id ? { ...it, isFavorite: fav } : it,
          ) ?? q,
      );
  };

  const handleExit = (p: PlayerPayload) => {
    navigate("/player/exit", { state: p });
  };

  const handleCompleted = (p: PlayerPayload) => {
    navigate("/player/complete", { state: p });
  };

  if (loading)
    return (
      <div className="player player--loading">
        <div className="player__spinner">Загрузка…</div>
      </div>
    );
  if (error || !track)
    return (
      <div className="player player--error">
        <div className="player__error">
          {error ?? "Трек не найден"}
          <button onClick={() => navigate(-1)}>Назад</button>
        </div>
      </div>
    );

  return (
    <PlayerPage
      track={track}
      onBack={() => navigate(-1)}
      onPrev={onPrev}
      onNext={onNext}
      onMenu={() => {}}
      onToggleFav={onToggleFav}
      onExit={handleExit}
      onCompleted={handleCompleted}
      showFav
    />
  );
}
