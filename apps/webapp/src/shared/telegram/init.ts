import WebApp from "@twa-dev/sdk";
import { bootstrapDevTelegram } from './dev-tg';

let __tgInited = false;

bootstrapDevTelegram();

export function initTelegram() {
  if (__tgInited) return;
  __tgInited = true;

  try {
    WebApp.ready();
  } catch (e) { /* empty */ }

  setTimeout(() => {
    try {
      WebApp.expand();
    } catch (e) { /* empty */ }
  }, 100);

  return {
    initData: WebApp.initData || "",
    user: WebApp.initDataUnsafe?.user || null,
    colorScheme: WebApp.colorScheme,
  };


}