import type { ReactNode } from "react";
import clsx from "clsx";
import HeroHeading, { type HeroHeaderData } from "./HeroHeading";

type Props = {
  imageSrc: string;
  header?: HeroHeaderData;
  title?: string;
  children?: ReactNode;
  className?: string;
};

export default function Hero({
  imageSrc,
  header,
  title,
  children,
  className,
}: Props) {
  return (
    <section className={clsx("hero", className)}>
      <img className="hero__img" src={imageSrc} alt="" />
      <div className="hero__shade" />
      <div className="hero__content">
        {header ? (
          <HeroHeading {...header} />
        ) : title ? (
          <h1 className="hero__legacyTitle">{title}</h1>
        ) : null}
        {children}
      </div>
    </section>
  );
}
