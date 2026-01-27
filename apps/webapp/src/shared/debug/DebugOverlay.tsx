import { useEffect, useMemo, useState } from "react";
import { clearLogs, getLogs, installConsoleHijack, type LogItem } from "./inAppLogger";

function fmt(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString();
}

export default function DebugOverlay() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);

  useEffect(() => {
    installConsoleHijack();
    setLogs(getLogs());

    const handler = () => setLogs(getLogs());
    const onEvt = () => setLogs(getLogs());

    window.addEventListener("storage", handler);
    window.addEventListener("__inapp_log__" as any, onEvt);

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("__inapp_log__" as any, onEvt);
    };
  }, []);

  const text = useMemo(() => {
    return logs
      .map((l) => `${fmt(l.ts)} [${l.level}] ${l.tag ? `[${l.tag}] ` : ""}${l.msg}`)
      .join("\n");
  }, [logs]);

  return (
    <div style={{ position: "fixed", right: 8, bottom: 8, zIndex: 999999 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "8px 10px",
          borderRadius: 10,
          background: "#111",
          color: "#fff",
          border: "1px solid #333",
        }}
      >
        LOG
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            left: 8,
            right: 8,
            bottom: 56,
            height: "45vh",
            background: "#000",
            color: "#0f0",
            border: "1px solid #333",
            borderRadius: 12,
            overflow: "auto",
            padding: 10,
            whiteSpace: "pre-wrap",
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={() => { clearLogs(); setLogs([]); }} style={{ padding: "6px 8px" }}>
              Clear
            </button>
            <button
              onClick={() => {
                try {
                  navigator.clipboard.writeText(text);
                } catch { /* empty */ }
              }}
              style={{ padding: "6px 8px" }}
            >
              Copy
            </button>
          </div>
          {text || "no logs"}
        </div>
      )}
    </div>
  );
}