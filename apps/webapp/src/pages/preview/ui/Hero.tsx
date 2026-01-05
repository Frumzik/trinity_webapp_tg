import type { ReactNode } from "react";

type Props = {
  imageSrc: string;
  title: string | ReactNode;
  subtitle?: string | ReactNode;   // ← новый проп
  children?: ReactNode;
};

export default function Hero({ imageSrc, title, subtitle, children }: Props) {
  return (
    <div className="preview__hero">
      <img className="preview__img" src={imageSrc} alt="" />
      <div className="preview__content">
        {children}
        <h1 className="preview__title">{title}</h1>
        {subtitle && subtitle !== "TEXT" && (
          <p className="preview__subtitle">{subtitle}</p>
        )}
      </div>
    </div>
  );
}