import type { ReactNode } from "react";

type Props = {
  head?: string;
  children: ReactNode;
};

export default function Sheet({ head, children }: Props) {
  return (
    <div className="preview__sheet">
      <div className="preview__sheet-head">{head}</div>
      {children}
    </div>
  );
}
