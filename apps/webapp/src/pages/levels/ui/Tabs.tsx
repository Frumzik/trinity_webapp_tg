import lockImg from "../../../assets/icons/lock.svg"

type Opt<T extends string | number> = { label: string; value: T };

type Props<T extends string | number> = {
  value: T;
  options: Opt<T>[];
  onChange: (v: T) => void;
};

export default function Tabs<T extends string | number>({
                                                          value,
                                                          options,
                                                          onChange,
                                                        }: Props<T>) {
  return (
    <div className="tabs">
      {options.map((o, index) => {
        const isLocked = index !== 0; // всё, что не первый таб — залочено

        return (
          <button
            key={String(o.value)}
            className={`tabs__btn ${o.value === value ? 'is-active' : ''} ${
              isLocked ? 'is-locked' : ''
            }`}
            onClick={() => {
              if (!isLocked) onChange(o.value);
            }}
            disabled={isLocked}
          >
            {isLocked ? <img src={lockImg} alt="" style={{width: 15}}/> : o.label}
          </button>
        );
      })}
    </div>
  );
}