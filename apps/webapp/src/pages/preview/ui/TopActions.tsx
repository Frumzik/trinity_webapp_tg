import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type Props = {
  isFav: boolean;
  onBack: () => void;
  onToggleFav: () => void;
  onMenu: () => void;
  showFav?: boolean;
  pending?: boolean;

  avatarSrc?: string;
  avatarTo?: string;
  onAvatarClick?: () => void;
};

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ filled, dimmed }: { filled?: boolean; dimmed?: boolean }) {
  const opacity = dimmed ? 0.4 : 1;
  return filled ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity }}>
      <path d="M15.0489 8.92705C15.3483 8.00574 16.6517 8.00574 16.9511 8.92705L18.0206 12.2188C18.1545 12.6309 18.5385 12.9098 18.9717 12.9098H22.4329C23.4016 12.9098 23.8044 14.1494 23.0207 14.7188L20.2205 16.7533C19.87 17.0079 19.7234 17.4593 19.8572 17.8713L20.9268 21.1631C21.2261 22.0844 20.1717 22.8506 19.388 22.2812L16.5878 20.2467C16.2373 19.9921 15.7627 19.9921 15.4122 20.2467L12.612 22.2812C11.8283 22.8506 10.7739 22.0844 11.0732 21.1631L12.1428 17.8713C12.2766 17.4593 12.13 17.0079 11.7795 16.7533L8.97933 14.7188C8.19562 14.1494 8.59839 12.9098 9.56712 12.9098H13.0283C13.4615 12.9098 13.8455 12.6309 13.9794 12.2188L15.0489 8.92705Z" fill="white" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity }}>
      <path opacity="0.23" d="M15.0489 8.92705C15.3483 8.00574 16.6517 8.00574 16.9511 8.92705L18.0206 12.2188C18.1545 12.6309 18.5385 12.9098 18.9717 12.9098H22.4329C23.4016 12.9098 23.8044 14.1494 23.0207 14.7188L20.2205 16.7533C19.87 17.0079 19.7234 17.4593 19.8572 17.8713L20.9268 21.1631C21.2261 22.0844 20.1717 22.8506 19.388 22.2812L16.5878 20.2467C16.2373 19.9921 15.7627 19.9921 15.4122 20.2467L12.612 22.2812C11.8283 22.8506 10.7739 22.0844 11.0732 21.1631L12.1428 17.8713C12.2766 17.4593 12.13 17.0079 11.7795 16.7533L8.97933 14.7188C8.19562 14.1494 8.59839 12.9098 9.56712 12.9098H13.0283C13.4615 12.9098 13.8455 12.6309 13.9794 12.2188L15.0489 8.92705Z" fill="white" />
    </svg>
  );
}

export default function TopActions({
                                     isFav,
                                     onBack,
                                     onToggleFav,
                                     onMenu,
                                     showFav = true,
                                     pending = false,
                                     avatarSrc,
                                     avatarTo = "/view",
                                     onAvatarClick,
                                   }: Props) {
  const Avatar = avatarSrc ? (
    <NavLink
      to={avatarTo}
      className="preview__avatar"
      onClick={(e) => {
        e.stopPropagation();
        onAvatarClick?.();
      }}
      aria-label="Профиль"
    >
      <img src={avatarSrc} alt="Аватар" width={47} height={47} style={{ borderRadius: "50%" }} />
      <span className="preview__status" aria-hidden="true" />
    </NavLink>
  ) : null;

  return (
    <div className="preview__topbar">
      <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onBack(); }} aria-label="Назад">
        <BackIcon />
      </button>

      <div className="spacer" />

      {showFav && (
        <button
          className="icon-btn"
          onClick={!pending ? onToggleFav : undefined}
          aria-label="В избранное"
          disabled={pending}
          style={pending ? { opacity: 0.6, pointerEvents: "none" } : undefined}
        >
          <StarIcon filled={isFav} dimmed={pending} />
        </button>
      )}

      {Avatar}
    </div>
  );
}