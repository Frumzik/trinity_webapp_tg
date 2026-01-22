type LogLevel = "log" | "warn" | "error";

export type LogItem = {
  ts: number;
  level: LogLevel;
  tag?: string;
  msg: string;
};

const STORE_KEY = "__inapp_logs__";
const MAX = 400;

function safeStr(x: any) {
  try {
    if (typeof x === "string") return x;
    return JSON.stringify(x);
  } catch {
    return String(x);
  }
}

export function pushLog(level: LogLevel, tag: string, ...args: any[]) {
  const item: LogItem = {
    ts: Date.now(),
    level,
    tag,
    msg: args.map(safeStr).join(" "),
  };

  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr: LogItem[] = raw ? JSON.parse(raw) : [];
    arr.push(item);
    localStorage.setItem(STORE_KEY, JSON.stringify(arr.slice(-MAX)));
    // событие для подписчиков (оверлей)
    window.dispatchEvent(new CustomEvent("__inapp_log__", { detail: item }));
  } catch {}
}

export function getLogs(): LogItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearLogs() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {}
}

export function installConsoleHijack() {
  const w = window as any;
  if (w.__inapp_console_installed) return;
  w.__inapp_console_installed = true;

  (["log", "warn", "error"] as const).forEach((lvl) => {
    const orig = console[lvl];
    console[lvl] = (...args: any[]) => {
      pushLog(lvl, "console", ...args);
      orig.apply(console, args);
    };
  });

  window.addEventListener("error", (e) => {
    pushLog("error", "window.error", e.message, { file: e.filename, line: e.lineno, col: e.colno });
  });

  window.addEventListener("unhandledrejection", (e: any) => {
    pushLog("error", "unhandledrejection", e?.reason);
  });
}