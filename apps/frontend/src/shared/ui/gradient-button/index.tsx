import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./gradient-button.scss";

type Props = {
  children: ReactNode;
  to?: string;
  href?: string;
  target?: "_self" | "_blank";
  className?: string;
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

export default function GradientButton({
                                         children,
                                         to,
                                         href,
                                         target = "_self",
                                         className,
                                         fullWidth = true,
                                         onClick,
                                         disabled = false,
                                       }: Props) {
  const cls = ["gbtn", fullWidth ? "gbtn--full" : "", disabled ? "gbtn--disabled" : "", className]
    .filter(Boolean)
    .join(" ");

  if (disabled) {
    return (
      <button className={cls} type="button" disabled aria-disabled="true">
        {children}
      </button>
    );
  }

  if (to)
    return (
      <Link className={cls} to={to}>
        {children}
      </Link>
    );

  if (href)
    return (
      <a
        className={cls}
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );

  return (
    <button className={cls} type="button" onClick={onClick}>
      {children}
    </button>
  );
}