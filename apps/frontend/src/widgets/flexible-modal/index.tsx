import clsx from 'clsx'
import GradientButton from '../../shared/ui/gradient-button'
import './modal.scss'

type ModalProps = {
    open: boolean
    title?: string
    items?: string[]
    description?: string
    ctaLabel?: string
    onCta?: () => void
    closeIconUrl: string
    onClose: () => void
    className?: string
}

export default function FlexibleModal({
                                          open,
                                          title,
                                          items,
                                          description,
                                          ctaLabel,
                                          onCta,
                                          closeIconUrl,
                                          onClose,
                                          className
                                      }: ModalProps) {
    return (
        <div className={clsx('flexmodal', open && 'is-open', className)}>
            <div className="flexmodal__backdrop" onClick={onClose} />
            <div className="flexmodal__sheet">
                <div className="flexmodal__head">
                    {title && <div className="flexmodal__title">{title}</div>}
                    <button className="flexmodal__close" onClick={onClose} aria-label="close">
                        <img src={closeIconUrl} alt="Закрыть" />
                    </button>
                </div>

                {items && items.length > 0 && (
                    <ul className="flexmodal__list">
                        {items.map((item, i) => (
                            <li key={i} className="flexmodal__item">
                                <span className="flexmodal__check">✔</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {description && <p className="flexmodal__desc">{description}</p>}

                {ctaLabel && (
                    <div className="flexmodal__cta">
                        <GradientButton onClick={onCta}>{ctaLabel}</GradientButton>
                    </div>
                )}
            </div>
            {/*const [open, setOpen] = useState(true)*/}

            {/*return (*/}
            {/*<FlexibleModal*/}
            {/*    open={open}*/}
            {/*    title="Практика со специалистом"*/}
            {/*    items={[*/}
            {/*        '500+ медитаций с голосовым сопровождением',*/}
            {/*        'Запись сна',*/}
            {/*        'Советы и инсайты по отслеживанию сна',*/}
            {/*    ]}*/}
            {/*    ctaLabel="Подробнее"*/}
            {/*    closeIconUrl={CloseIcon}*/}
            {/*    onClose={() => setOpen(false)}*/}
            {/*    onCta={() => alert('Подробнее')}*/}
            {/*/>*/}
            {/*)*/}
        </div>
    )
}