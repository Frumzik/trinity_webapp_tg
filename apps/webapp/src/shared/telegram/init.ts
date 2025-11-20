import WebApp from "@twa-dev/sdk";
import { bootstrapDevTelegram } from './dev-tg';

let __tgInited = false;

bootstrapDevTelegram();

export function initTelegram() {
  if (__tgInited) return;
  __tgInited = true;

  try {
    WebApp.ready();
  } catch {}

  requestAnimationFrame(() => {
    try {
      WebApp.expand();
      WebApp.requestFullscreen?.();
    } catch {}
  });

  setTimeout(() => {
    try {
      WebApp.expand();
      WebApp.requestFullscreen?.();
    } catch {}
  }, 300);

  setTimeout(() => {
    try {
      WebApp.expand();
      WebApp.requestFullscreen?.();
    } catch {}
  }, 1000);

  return {
    initData: WebApp.initData || "",
    user: WebApp.initDataUnsafe?.user || null,
    colorScheme: WebApp.colorScheme,
  };
}