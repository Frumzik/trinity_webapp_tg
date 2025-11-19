import { useEffect, useMemo, useRef } from 'react'
import clsx from 'clsx'
import './time-picker.scss'

export type TimeValue = { hours: number; minutes: number }

type Props = {
  value: TimeValue
  onChange: (v: TimeValue) => void
  className?: string
  is24h?: boolean
}

const ITEM_H = 44
const SPACER_H = ITEM_H * 2 // 🔧 по 2 айтема сверху и снизу

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export default function TimePicker({ value, onChange, className, is24h = true }: Props) {
  const hRef = useRef<HTMLDivElement | null>(null)
  const mRef = useRef<HTMLDivElement | null>(null)

  const hours = useMemo(() => {
    const max = is24h ? 23 : 12
    const min = is24h ? 0 : 1
    return Array.from({ length: max - min + 1 }, (_, i) => i + min)
  }, [is24h])

  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), [])

  const scrollToValue = (
    el: HTMLDivElement | null,
    list: number[],
    value: number,
  ) => {
    if (!el) return
    const idx = Math.max(0, list.indexOf(value))
    const centerOffset = (el.clientHeight - ITEM_H) / 2
    el.scrollTop = SPACER_H + idx * ITEM_H - centerOffset
  }

  const getIndexFromScroll = (el: HTMLDivElement, list: number[]) => {
    const centerOffset = (el.clientHeight - ITEM_H) / 2
    const approxIdx = Math.round(
      (el.scrollTop + centerOffset - SPACER_H) / ITEM_H,
    )
    return Math.max(0, Math.min(list.length - 1, approxIdx))
  }

  useEffect(() => {
    scrollToValue(hRef.current, hours, value.hours)
    scrollToValue(mRef.current, minutes, value.minutes)
  }, [value.hours, value.minutes, hours, minutes])

  const onWheel = (kind: 'h' | 'm') => (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const el = e.currentTarget
    const list = kind === 'h' ? hours : minutes

    const curIdx = getIndexFromScroll(el, list)
    const step = Math.sign(e.deltaY) || 1
    const nextIdx = Math.max(0, Math.min(list.length - 1, curIdx + step))

    scrollToValue(el, list, list[nextIdx])

    const nextVal = list[nextIdx]
    const nv =
      kind === 'h'
        ? { hours: nextVal, minutes: value.minutes }
        : { hours: value.hours, minutes: nextVal }

    if (nv.hours !== value.hours || nv.minutes !== value.minutes) onChange(nv)
  }

  const timers = useRef<{ h?: number; m?: number }>({})

  const onScrollCol = (kind: 'h' | 'm') => (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const key = kind
    if (timers.current[key]) window.clearTimeout(timers.current[key])

    timers.current[key] = window.setTimeout(() => {
      const list = kind === 'h' ? hours : minutes
      const idx = getIndexFromScroll(el, list)

      scrollToValue(el, list, list[idx])

      const nextVal = list[idx]
      const next =
        kind === 'h'
          ? { hours: nextVal, minutes: value.minutes }
          : { hours: value.hours, minutes: nextVal }

      if (next.hours !== value.hours || next.minutes !== value.minutes) {
        onChange(next)
      }
    }, 80)
  }

  return (
    <div className={clsx('tp', className)}>
      <div className="tp__vline tp__vline--left" aria-hidden />
      <div className="tp__vline tp__vline--right" aria-hidden />

      <div className="tp__focus" aria-hidden />

      <div className="tp__fade tp__fade--top" aria-hidden />
      <div className="tp__fade tp__fade--bottom" aria-hidden />

      <div className="tp__cols">
        <div
          ref={hRef}
          className="tp__col"
          onScroll={onScrollCol('h')}
          onWheel={onWheel('h')}
          role="listbox"
          aria-label="Часы"
        >
          <div style={{ height: SPACER_H }} />
          {hours.map((h) => (
            <div
              key={h}
              className={clsx('tp__item', h === value.hours && 'is-active')}
            >
              <span className="tp__num">{is24h ? pad2(h) : String(h)}</span>
            </div>
          ))}
          <div style={{ height: SPACER_H }} />
        </div>

        <div
          ref={mRef}
          className="tp__col"
          onScroll={onScrollCol('m')}
          onWheel={onWheel('m')}
          role="listbox"
          aria-label="Минуты"
        >
          <div style={{ height: SPACER_H }} />
          {minutes.map((m) => (
            <div
              key={m}
              className={clsx('tp__item', m === value.minutes && 'is-active')}
            >
              <span className="tp__num">{pad2(m)}</span>
            </div>
          ))}
          <div style={{ height: SPACER_H }} />
        </div>
      </div>
    </div>
  )
}