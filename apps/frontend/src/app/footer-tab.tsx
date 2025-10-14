import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

type Tab = "home" | "favorites" | "development" | "profile" | "store";

const FooterTabCtx = createContext<{
  tab: Tab;
  setTab: (t: Tab) => void;
} | null>(null);

function detectInitialTab(pathname: string): Tab {
  if (pathname.startsWith("/favorites")) return "favorites";
  if (pathname.startsWith("/development")) return "development";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/store")) return "store";
  return "home";
}

export function FooterTabProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [tab, setTab] = useState<Tab>(() => detectInitialTab(pathname));
  return (
    <FooterTabCtx.Provider value={useMemo(() => ({ tab, setTab }), [tab])}>
      {children}
    </FooterTabCtx.Provider>
  );
}

export function useFooterTab() {
  const ctx = useContext(FooterTabCtx);
  if (!ctx)
    throw new Error("useFooterTab must be used within FooterTabProvider");
  return ctx;
}
