import { useEffect, useRef } from "react";
import { pushLog } from "./inAppLogger";

function dumpMedia(m: HTMLMediaElement, tag: string) {
  const err = (m as any).error;
  const buffered: Array<[number, number]> = [];
  try {
    for (let i = 0; i < m.buffered.length; i++) buffered.push([m.buffered.start(i), m.buffered.end(i)]);
  } catch {}

  pushLog("log", `media:${tag}`, {
    currentSrc: (m as any).currentSrc || (m as any).src,
    ct: m.currentTime,
    dur: m.duration,
    paused: m.paused,
    ended: m.ended,
    readyState: m.readyState,
    networkState: m.networkState,
    buffered,
    err: err ? { code: err.code, message: err.message } : null,
  });
}

export function useMediaDiagnostics(
  mediaRef: React.RefObject<HTMLMediaElement>,
  src: string
) {
  const lastCtRef = useRef<number>(0);
  const stuckSinceRef = useRef<number | null>(null);

  // логи событий
  useEffect(() => {
    const m = mediaRef.current;
    if (!m) return;

    const on = (name: string) => () => dumpMedia(m, name);

    const handlers: Array<[string, any]> = [
      ["loadedmetadata", on("loadedmetadata")],
      ["loadeddata", on("loadeddata")],
      ["canplay", on("canplay")],
      ["canplaythrough", on("canplaythrough")],
      ["play", on("play")],
      ["playing", on("playing")],
      ["pause", on("pause")],
      ["ended", on("ended")],
      ["stalled", on("stalled")],
      ["waiting", on("waiting")],
      ["suspend", on("suspend")],
      ["abort", on("abort")],
      ["emptied", on("emptied")],
      ["error", on("error")],
      ["timeupdate", () => {
        // не спамим: лог раз в ~10 секунд
        if (Math.floor(m.currentTime) % 10 === 0) dumpMedia(m, "timeupdate@10s");
      }],
    ];

    handlers.forEach(([ev, fn]) => m.addEventListener(ev, fn));
    pushLog("log", "media:src", { src });

    return () => {
      handlers.forEach(([ev, fn]) => m.removeEventListener(ev, fn));
    };
  }, [mediaRef, src]);

  // watchdog: если playing, а currentTime не двигается — логируем + пробуем мягко “пнуть”
  useEffect(() => {
    const t = window.setInterval(() => {
      const m = mediaRef.current;
      if (!m) return;

      const isActuallyPlaying = !m.paused && !m.ended && m.readyState >= 2;
      const ct = m.currentTime || 0;

      if (isActuallyPlaying) {
        const prev = lastCtRef.current;
        const moved = ct > prev + 0.01;

        if (!moved) {
          if (stuckSinceRef.current == null) stuckSinceRef.current = Date.now();
          const stuckMs = Date.now() - stuckSinceRef.current;

          // через 8 секунд “залипа” — лог
          if (stuckMs > 8000 && stuckMs < 9000) {
            dumpMedia(m, "watchdog_stuck");
          }

          // через 15 секунд — пробуем play() ещё раз (иногда помогает WebView)
          if (stuckMs > 15000 && stuckMs < 16000) {
            pushLog("warn", "media:watchdog", "Trying to resume playback...");
            m.play().catch((e) => pushLog("error", "media:play_failed", e));
          }
        } else {
          stuckSinceRef.current = null;
        }
      } else {
        stuckSinceRef.current = null;
      }

      lastCtRef.current = ct;
    }, 1000);

    return () => window.clearInterval(t);
  }, [mediaRef]);
}