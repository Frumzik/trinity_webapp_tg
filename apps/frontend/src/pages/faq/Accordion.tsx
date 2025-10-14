import { useEffect, useRef, useState } from 'react'

type Props = {
    title: string
    children: React.ReactNode
    defaultOpen?: boolean
    onToggle?: (open: boolean) => void
    chevronDownUrl?: string
    chevronUpUrl?: string
}

export default function Accordion({
                                      title,
                                      children,
                                      defaultOpen = false,
                                      onToggle,
                                      chevronDownUrl,
                                      chevronUpUrl,
                                  }: Props) {
    const [open, setOpen] = useState(defaultOpen)
    const [h, setH] = useState(0)
    const wrapRef = useRef<HTMLDivElement>(null)
    const animRef = useRef<number | null>(null)

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        setH(open ? el.scrollHeight : 0)
        const ro = new ResizeObserver(() => open && setH(el.scrollHeight))
        ro.observe(el)
        return () => ro.disconnect()
    }, [open])

    const toggle = () => {
        setOpen((prev) => {
            const next = !prev
            onToggle?.(next)
            const el = wrapRef.current
            if (el) {
                if (next) setH(el.scrollHeight)
                else {
                    if (animRef.current) cancelAnimationFrame(animRef.current)
                    animRef.current = requestAnimationFrame(() => setH(el.clientHeight))
                    animRef.current = requestAnimationFrame(() => setH(0))
                }
            }
            return next
        })
    }

    return (
        <li className={'faq__item' + (open ? ' is-open' : '')}>
            <button className="faq__btn" onClick={toggle} aria-expanded={open}>
                <span className="faq__q">{title}</span>
                <span
                    className={'faq__chev' + (!chevronDownUrl ? ' is-rotating' : '')}
                    style={
                        chevronDownUrl
                            ? {
                                ['--chev-down' as any]: `url(${chevronDownUrl})`,
                                ['--chev-up' as any]: `url(${chevronUpUrl ?? chevronDownUrl})`,
                            }
                            : undefined
                    }
                    aria-hidden
                />
            </button>

            <div
                className="faq__panel"
                style={{ height: h }}
                aria-hidden={!open}
            >
                <div ref={wrapRef} className="faq__panel-inner">
                    {children}
                </div>
            </div>
        </li>
    )
}