import WebApp from "@twa-dev/sdk";
import { bootstrapDevTelegram } from './dev-tg';
bootstrapDevTelegram();
export function initTelegram() {
  WebApp.ready();

  setTimeout(() => {
    try {
      WebApp.expand();
    } catch (e) {
      console.warn("Telegram expand failed:", e);
    }
  }, 100);

  return {
    initData: WebApp.initData || "",
    user: WebApp.initDataUnsafe?.user || null,
    colorScheme: WebApp.colorScheme,
  };
}