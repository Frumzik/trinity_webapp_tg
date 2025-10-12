import { useEffect, useRef } from 'react'

type Options = {
    friction?: number
    minVelocity?: number
    axis?: 'x' | 'y'
    wheelToAxis?: 'x' | 'y' | 'auto'
}

export function useInertiaDragScroll<T extends HTMLElement>(
    ref: React.RefObject<T>,
    { friction = 0.93, minVelocity = 0.25, axis = 'x', wheelToAxis = 'auto' }: Options = {}
) {
    const s = useRef({ active: false, start: 0, startPos: 0, v: 0, raf: 0 })

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

    const onPointerDown = (e: React.PointerEvent) => {
        const el = ref.current
        if (!el) return
        el.setPointerCapture(e.pointerId)
        s.current.active = true
        s.current.start = axis === 'x' ? e.clientX : e.clientY
        s.current.startPos = axis === 'x' ? el.scrollLeft : el.scrollTop
        s.current.v = 0
        cancelAnimationFrame(s.current.raf)
    }

    const onPointerMove = (e: React.PointerEvent) => {
        const el = ref.current
        if (!el || !s.current.active) return
        const cur = axis === 'x' ? e.clientX : e.clientY
        const dx = cur - s.current.start
        const next = s.current.startPos - dx
        if (axis === 'x') {
            const max = Math.max(0, el.scrollWidth - el.clientWidth)
            const val = clamp(next, 0, max)
            s.current.v = val - el.scrollLeft
            el.scrollLeft = val
        } else {
            const max = Math.max(0, el.scrollHeight - el.clientHeight)
            const val = clamp(next, 0, max)
            s.current.v = val - el.scrollTop
            el.scrollTop = val
        }
    }

    const onPointerUp = (e: React.PointerEvent) => {
        const el = ref.current
        if (!el) return
        s.current.active = false
        el.releasePointerCapture(e.pointerId)
        const step = () => {
            if (Math.abs(s.current.v) < minVelocity) return
            s.current.v *= friction
            if (axis === 'x') {
                const max = Math.max(0, el.scrollWidth - el.clientWidth)
                el.scrollLeft = clamp(el.scrollLeft + s.current.v, 0, max)
            } else {
                const max = Math.max(0, el.scrollHeight - el.clientHeight)
                el.scrollTop = clamp(el.scrollTop + s.current.v, 0, max)
            }
            s.current.raf = requestAnimationFrame(step)
        }
        s.current.raf = requestAnimationFrame(step)
    }

    const onWheel = (e: React.WheelEvent) => {
        const el = ref.current
        if (!el) return
        const dir = wheelToAxis === 'auto' ? (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? 'y' : 'x') : wheelToAxis
        if (axis === 'x' && dir === 'y') el.scrollLeft += e.deltaY
        else if (axis === 'x' && dir === 'x') el.scrollLeft += e.deltaX
        else if (axis === 'y' && dir === 'y') el.scrollTop += e.deltaY
        else if (axis === 'y' && dir === 'x') el.scrollTop += e.deltaX
    }

    useEffect(() => () => cancelAnimationFrame(s.current.raf), [])

    return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onWheel }
}
