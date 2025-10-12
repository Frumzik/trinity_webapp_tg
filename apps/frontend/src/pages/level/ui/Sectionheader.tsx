type Props = {
    title: string
    count?: number // обычно items.length
    className?: string
}

export default function SectionHeader({ title, count, className }: Props) {
    return (
        <div className={['sectionHead', className].filter(Boolean).join(' ')}>
            <h3 className="sectionHead__title">{title}</h3>
            {typeof count === 'number' && (
                <span className="sectionHead__count">{count} практики</span>
            )}
        </div>
    )
}
