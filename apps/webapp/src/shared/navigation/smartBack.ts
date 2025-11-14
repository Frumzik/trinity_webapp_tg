import type { To } from "react-router-dom";
import type { NavigateFunction } from "react-router-dom";

export function smartBack(navigate: NavigateFunction, fallback: To) {
  const idx = (window.history.state && (window.history.state as any).idx) ?? 0;
  if (idx > 0) {
    navigate(-1);
  } else {
    navigate(fallback, { replace: true });
  }
}