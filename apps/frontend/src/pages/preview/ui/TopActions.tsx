type Props = {
  isFav: boolean;
  onBack: () => void;
  onToggleFav: () => void;
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M15.0489 8.92705C15.3483 8.00574 16.6517 8.00574 16.9511 8.92705L18.0206 12.2188C18.1545 12.6309 18.5385 12.9098 18.9717 12.9098H22.4329C23.4016 12.9098 23.8044 14.1494 23.0207 14.7188L20.2205 16.7533C19.87 17.0079 19.7234 17.4593 19.8572 17.8713L20.9268 21.1631C21.2261 22.0844 20.1717 22.8506 19.388 22.2812L16.5878 20.2467C16.2373 19.9921 15.7627 19.9921 15.4122 20.2467L12.612 22.2812C11.8283 22.8506 10.7739 22.0844 11.0732 21.1631L12.1428 17.8713C12.2766 17.4593 12.13 17.0079 11.7795 16.7533L8.97933 14.7188C8.19562 14.1494 8.59839 12.9098 9.56712 12.9098H13.0283C13.4615 12.9098 13.8455 12.6309 13.9794 12.2188L15.0489 8.92705Z"
        fill="white"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
    >
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M9.99935 10.8327C10.4596 10.8327 10.8327 10.4596 10.8327 9.99935C10.8327 9.53911 10.4596 9.16602 9.99935 9.16602C9.53911 9.16602 9.16602 9.53911 9.16602 9.99935C9.16602 10.4596 9.53911 10.8327 9.99935 10.8327Z"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9.99935 16.6667C10.4596 16.6667 10.8327 16.2936 10.8327 15.8333C10.8327 15.3731 10.4596 15 9.99935 15C9.53911 15 9.16602 15.3731 9.16602 15.8333C9.16602 16.2936 9.53911 16.6667 9.99935 16.6667Z"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9.99935 4.99967C10.4596 4.99967 10.8327 4.62658 10.8327 4.16634C10.8327 3.7061 10.4596 3.33301 9.99935 3.33301C9.53911 3.33301 9.16602 3.7061 9.16602 4.16634C9.16602 4.62658 9.53911 4.99967 9.99935 4.99967Z"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export default function TopActions({
  isFav,
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
      <button
        className="icon-btn"
        onClick={onToggleFav}
        aria-label="В избранное"
      >
        <StarIcon filled={isFav} />
      </button>
      <button className="icon-btn" onClick={onMenu} aria-label="Меню">
        <KebabIcon />
      </button>
    </div>
  );
}
