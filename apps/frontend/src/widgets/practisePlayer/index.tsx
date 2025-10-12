import {useEffect, useRef, useState} from 'react'
import clsx from 'clsx'
import TopActions from '../../pages/level/ui/TopActions.tsx'
import rigthArrow from '../../assets/image/level/arrow-right.svg'
import leftArrow from '../../assets/image/level/arrow-left.svg'
import '../../pages/practisePlayer/player.scss'

export type MediaTrack = {
    id: string | number
    title: string
    subtitle?: string
    mediaUrl: string
    artworkUrl: string
    isFavorite?: boolean
}

export type PlayerPayload = {
    track: MediaTrack
    current: number
    duration: number
    progressPct: number
    completed: boolean
}

type Props = {
    track: MediaTrack
    onBack: () => void
    onPrev?: () => void
    onNext?: () => void
    onMenu?: () => void
    onToggleFav?: (next: boolean) => void
    onExit?: (p: PlayerPayload) => void
    onCompleted?: (p: PlayerPayload) => void
    showFav?: boolean
    className?: string
}

function formatTime(sec: number) {
    if (!Number.isFinite(sec)) return '00:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function PlayerPage({
                                       track,
                                       onBack,
                                       onPrev,
                                       onNext,
                                       onMenu,
                                       onToggleFav,
                                       onExit,
                                       onCompleted,
                                       showFav = true,
                                       className,
                                   }: Props) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [ready, setReady] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [current, setCurrent] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFav, setFav] = useState(!!track.isFavorite)
    const [scrub, setScrub] = useState(false)

    useEffect(() => {
        const a = audioRef.current
        if (!a) return
        setReady(false)
        setPlaying(false)
        setCurrent(0)
        setDuration(0)
        a.src = track.mediaUrl
        a.load()
    }, [track.mediaUrl])

    useEffect(() => {
        const a = audioRef.current
        if (!a) return
        const onLoaded = () => {
            setDuration(isFinite(a.duration) ? a.duration : 0)
            setReady(true)
        }
        const onTime = () => {
            if (!scrub) setCurrent(a.currentTime)
        }
        const onEnded = () => {
            setPlaying(false)
            const payload: PlayerPayload = {
                track,
                current: a.currentTime,
                duration: a.duration || 0,
                progressPct: (a.currentTime / (a.duration || 1)) * 100,
                completed: true,
            }
            onCompleted?.(payload)
            onNext?.()
        }
        a.addEventListener('loadedmetadata', onLoaded)
        a.addEventListener('timeupdate', onTime)
        a.addEventListener('ended', onEnded)
        return () => {
            a.removeEventListener('loadedmetadata', onLoaded)
            a.removeEventListener('timeupdate', onTime)
            a.removeEventListener('ended', onEnded)
        }
    }, [onNext, onCompleted, scrub, track])

    const togglePlay = async () => {
        const a = audioRef.current
        if (!a || !ready) return
        if (playing) {
            a.pause()
            setPlaying(false)
        } else {
            try {
                await a.play()
                setPlaying(true)
            } catch {
            }
        }
    }

    const pct = duration > 0 ? (current / duration) * 100 : 0
    const onScrubStart = () => setScrub(true)
    const onScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => setCurrent(Number(e.target.value))
    const onScrubEnd = () => {
        const a = audioRef.current
        if (!a) return
        a.currentTime = current
        setScrub(false)
    }
    const toggleFav = () => {
        const next = !isFav
        setFav(next)
        onToggleFav?.(next)
    }

    const backWithPayload = () => {
        const a = audioRef.current
        const payload: PlayerPayload | undefined = a
            ? {
                track,
                current: a.currentTime,
                duration: a.duration || 0,
                progressPct: (a.currentTime / (a.duration || 1)) * 100,
                completed: false,
            }
            : undefined

        if (onExit && payload) {
            onExit(payload)
        } else {
            onBack()
        }
    }

    return (
        <div className={clsx('player', className)}>
            <img className="player__bg" src={track.artworkUrl} alt=""/>
            <div className="player__shade"/>

            <div className="player__top">
                <TopActions onBack={backWithPayload} onMenu={onMenu ?? (() => {
                })} showFav={showFav} isFav={isFav} onToggleFav={toggleFav}/>
            </div>

            {onPrev && (
                <button className="player__nav player__nav--prev" onClick={onPrev} aria-label="Prev">
                    <img src={leftArrow} alt=""/>
                </button>
            )}
            {onNext && (
                <button className="player__nav player__nav--next" onClick={onNext} aria-label="Next">
                    <img src={rigthArrow} alt=""/>
                </button>
            )}

            <button className="player__play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                  <span className={clsx('player__knob', playing && 'is-playing')}>
                    <span className="player__play-icon">
                      <svg width="80" height="80" viewBox="0 0 28 28" fill="none">
                      <path d="M10 7 L10 21 L20 14 Z" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    </span>
                  </span>
            </button>

            <div className="player__panel">
                <div className="player__title">{track.title}</div>
                {track.subtitle && <div className="player__subtitle">{track.subtitle}</div>}

                <div className="player__seek" style={{['--pct' as any]: `${pct}%`}}>
                    <span className="player__time">{formatTime(current)}</span>
                    <input
                        type="range"
                        min={0}
                        max={Math.max(1, Math.floor(duration))}
                        step={1}
                        value={Math.floor(current)}
                        onMouseDown={onScrubStart}
                        onTouchStart={onScrubStart}
                        onChange={onScrubChange}
                        onMouseUp={onScrubEnd}
                        onTouchEnd={onScrubEnd}
                        className="player__range"
                        aria-label="Seek"
                    />
                    <span className="player__time">{formatTime(duration)}</span>
                </div>
            </div>

            <audio ref={audioRef} preload="metadata"/>
        </div>
    )
}