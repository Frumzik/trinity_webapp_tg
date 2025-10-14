type Props = {
  showFav?: boolean; // ← управляет показом звезды
  isFav?: boolean;
  onBack: () => void;
  onToggleFav?: () => void; // можно не передавать, если showFav=false
  onMenu: () => void;
};

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M15.0489 8.92705C15.3483 8.00574 16.6517 8.00574 16.9511 8.92705L18.0206 12.2188C18.1545 12.6309 18.5385 12.9098 18.9717 12.9098H22.4329C23.4016 12.9098 23.8044 14.1494 23.0207 14.7188L20.2205 16.7533C19.87 17.0079 19.7234 17.4593 19.8572 17.8713L20.9268 21.1631C21.2261 22.0844 20.1717 22.8506 19.388 22.2812L16.5878 20.2467C16.2373 19.9921 15.7627 19.9921 15.4122 20.2467L12.612 22.2812C11.8283 22.8506 10.7739 22.0844 11.0732 21.1631L12.1428 17.8713C12.2766 17.4593 12.13 17.0079 11.7795 16.7533L8.97933 14.7188C8.19562 14.1494 8.59839 12.9098 9.56712 12.9098H13.0283C13.4615 12.9098 13.8455 12.6309 13.9794 12.2188L15.0489 8.92705Z"
        fill="white"
      />
    </svg>
  ) : (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        opacity="0.23"
        d="M15.0489 8.92705C15.3483 8.00574 16.6517 8.00574 16.9511 8.92705L18.0206 12.2188C18.1545 12.6309 18.5385 12.9098 18.9717 12.9098H22.4329C23.4016 12.9098 23.8044 14.1494 23.0207 14.7188L20.2205 16.7533C19.87 17.0079 19.7234 17.4593 19.8572 17.8713L20.9268 21.1631C21.2261 22.0844 20.1717 22.8506 19.388 22.2812L16.5878 20.2467C16.2373 19.9921 15.7627 19.9921 15.4122 20.2467L12.612 22.2812C11.8283 22.8506 10.7739 22.0844 11.0732 21.1631L12.1428 17.8713C12.2766 17.4593 12.13 17.0079 11.7795 16.7533L8.97933 14.7188C8.19562 14.1494 8.59839 12.9098 9.56712 12.9098H13.0283C13.4615 12.9098 13.8455 12.6309 13.9794 12.2188L15.0489 8.92705Z"
        fill="white"
      />
    </svg>
  );
}

function KebabIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 10.833C10.4602 10.833 10.8333 10.4599 10.8333 9.99967C10.8333 9.53943 10.4602 9.16634 10 9.16634C9.53976 9.16634 9.16667 9.53943 9.16667 9.99967C9.16667 10.4599 9.53976 10.833 10 10.833Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 16.6667C10.4602 16.6667 10.8333 16.2936 10.8333 15.8333C10.8333 15.3731 10.4602 15 10 15C9.53976 15 9.16667 15.3731 9.16667 15.8333C9.16667 16.2936 9.53976 16.6667 10 16.6667Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 5C10.4602 5 10.8333 4.62691 10.8333 4.16667C10.8333 3.70643 10.4602 3.33334 10 3.33334C9.53976 3.33334 9.16667 3.70643 9.16667 4.16667C9.16667 4.62691 9.53976 5 10 5Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TopActions({
  showFav = false,
  isFav = false,
  onBack,
  onToggleFav,
  onMenu,
}: Props) {
  return (
    <div className="preview__topbar">
      <button className="icon-btn" onClick={onBack} aria-label="Назад">
        <BackIcon />
      </button>

      <div className="spacer" />

      {showFav && (
        <button
          className="icon-btn"
          onClick={onToggleFav}
          aria-label={isFav ? "Убрать из избранного" : "В избранное"}
        >
          <StarIcon filled={isFav} />
        </button>
      )}

      <button className="icon-btn" onClick={onMenu} aria-label="Меню">
        <KebabIcon />
      </button>
    </div>
  );
}
