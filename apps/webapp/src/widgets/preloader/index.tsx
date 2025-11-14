import './preloader.scss';

type PreloaderProps = {
  hidden?: boolean;
};

export default function Preloader({ hidden }: PreloaderProps) {
  return (
    <div className={`preloader ${hidden ? 'preloader--hidden' : ''}`}>
      <div className="preloader__spinner">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="preloader__dot" />
        ))}
      </div>
      <div className="preloader__text">Загрузка..</div>
    </div>
  );
}