import { useEffect, useRef, useState } from 'react'
import TopBar from '../../widgets/topbarTextpage'
import GradientButton from '../../shared/ui/gradient-button'
import Switch from '../../shared/ui/switch'
import './goals.scss'

function EditBtn({ onClick }: { onClick?: () => void }) {
    return (
        <button className="goals__edit" type="button" onClick={onClick} aria-label="Редактировать">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4.162 10.6667H12V12.0001H0V9.17139L6.6 2.57139L9.428 5.40072L4.16133 10.6667H4.162ZM7.542 1.62939L8.95667 0.214722C9.08169 0.0897416 9.25122 0.0195312 9.428 0.0195312C9.60478 0.0195312 9.77432 0.0897416 9.89933 0.214722L11.7853 2.10072C11.9103 2.22574 11.9805 2.39528 11.9805 2.57206C11.9805 2.74883 11.9103 2.91837 11.7853 3.04339L10.3707 4.45739L7.54267 1.62939H7.542Z" fill="#94A3B8"/>
            </svg>
        </button>
    )
}

function useClickAway<T extends Element>(
    ref: React.RefObject<T | null>,
    onAway: () => void
) {
    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (!ref.current) return
            if (!ref.current.contains(e.target as Node)) onAway()
        }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [ref, onAway])
}

type Editing =
    | { kind: 'mind'; minutes: number }
    | { kind: 'sleep'; hours: number; mins: number }
    | null

export default function GoalsPage() {
    const [bestSleep, setBestSleep] = useState(true)
    const [stress, setStress] = useState(false)
    const [freedom, setFreedom] = useState(false)

    const [mindMinutes, setMindMinutes] = useState(10)
    const [sleepHours, setSleepHours] = useState(8)
    const [sleepMins, setSleepMins] = useState(0)

    const [editing, setEditing] = useState<Editing>(null)

    const openMind = () => setEditing({ kind: 'mind', minutes: mindMinutes })
    const openSleep = () => setEditing({ kind: 'sleep', hours: sleepHours, mins: sleepMins })

    const closeEdit = () => setEditing(null)

    const onSave = () => {
        if (!editing) return
        if (editing.kind === 'mind') {
            setMindMinutes(Math.max(1, Math.min(180, Math.round(editing.minutes))))
        } else {
            const h = Math.max(0, Math.min(24, Math.round(editing.hours)))
            const m = Math.max(0, Math.min(59, Math.round(editing.mins)))
            setSleepHours(h)
            setSleepMins(m)
        }
        closeEdit()
    }

    return (
        <div className="goals">
            <TopBar title="Цели и программы" />

            <main className="goals__main">
                <section className="goals__section goals__section--goals">
                    <div className="goals__h2">Мои цели</div>

                    <div className="goals__goal">
                        <div className="goals__goal-left">
                            <span className="goals__badge goals__badge--green" aria-hidden />
                            <span className="goals__goal-name">Осознанность</span>
                        </div>
                        <div className="goals__goal-right">
              <span className="goals__goal-value">
                <span className="goals__goal-value--bold">{mindMinutes}</span> мин / день
              </span>
                            <EditBtn onClick={openMind} />
                        </div>
                    </div>

                    <div className="goals__goal">
                        <div className="goals__goal-left">
                            <span className="goals__badge goals__badge--violet" aria-hidden />
                            <span className="goals__goal-name">Сон</span>
                        </div>
                        <div className="goals__goal-right">
              <span className="goals__goal-value">
                <span className="goals__goal-value--bold">
                  {String(sleepHours).padStart(1, '0')}:{String(sleepMins).padStart(2, '0')}
                </span>{' '}
                  час / день
              </span>
                            <EditBtn onClick={openSleep} />
                        </div>
                    </div>

                    <hr className="goals__divider" />
                </section>

                <section className="goals__section">
                    <div className="goals__h2">Активная программа</div>

                    <div className="goals__row">
                        <span className="goals__avatar" aria-hidden />
                        <div className="goals__col">
                            <div className="goals__name">Лучший сон</div>
                            <div className="goals__desc">Ежедневный контент для улучшения сна.</div>
                        </div>
                        <Switch checked={bestSleep} onChange={setBestSleep} />
                    </div>

                    <div className="goals__row">
                        <span className="goals__avatar" aria-hidden />
                        <div className="goals__col">
                            <div className="goals__name">Снижение стресса</div>
                            <div className="goals__desc">Ежедневный контент для преодоления стресса.</div>
                        </div>
                        <Switch checked={stress} onChange={setStress} />
                    </div>

                    <div className="goals__row">
                        <span className="goals__avatar" aria-hidden />
                        <div className="goals__col">
                            <div className="goals__name">Освобождение ума</div>
                            <div className="goals__desc">Подборка медитаций с сопровождением и без.</div>
                        </div>
                        <Switch checked={freedom} onChange={setFreedom} />
                    </div>
                </section>
            </main>

            <div className="gbtn-bar egg">
                <div className="gbtn-bar__inner">
                    <GradientButton>Сохранить</GradientButton>
                </div>
            </div>

            <InlineEditor editing={editing} setEditing={setEditing} onSave={onSave} onClose={closeEdit} />
        </div>
    )
}

function InlineEditor({
                          editing,
                          setEditing,
                          onSave,
                          onClose,
                      }: {
    editing: Editing
    setEditing: (e: Editing) => void
    onSave: () => void
    onClose: () => void
}) {
    const ref = useRef<HTMLDivElement>(null)
    useClickAway(ref, onClose)
    if (!editing) return null

    return (
        <>
            <div className="goals__editor-backdrop" />
            <div className="goals__editor" ref={ref} role="dialog" aria-modal="true">
                {editing.kind === 'mind' ? (
                    <div className="goals__editor-row">
                        <label className="goals__editor-label">Минут в день</label>
                        <input
                            className="goals__editor-input"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={180}
                            value={editing.minutes}
                            onChange={(e) =>
                                setEditing({ kind: 'mind', minutes: Number(e.target.value.replace(/\D/g, '') || 0) })
                            }
                        />
                    </div>
                ) : (
                    <div className="goals__editor-row goals__editor-row--time">
                        <label className="goals__editor-label">Время сна</label>
                        <div className="goals__time">
                            <input
                                className="goals__editor-input goals__time-input"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={24}
                                value={editing.hours}
                                onChange={(e) =>
                                    setEditing({
                                        kind: 'sleep',
                                        hours: Number(e.target.value.replace(/\D/g, '') || 0),
                                        mins: editing.mins,
                                    })
                                }
                            />
                            <span className="goals__time-sep">:</span>
                            <input
                                className="goals__editor-input goals__time-input"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={59}
                                value={editing.mins}
                                onChange={(e) =>
                                    setEditing({
                                        kind: 'sleep',
                                        hours: editing.hours,
                                        mins: Number(e.target.value.replace(/\D/g, '') || 0),
                                    })
                                }
                            />
                        </div>
                    </div>
                )}
                <div className="goals__editor-actions">
                    <button className="goals__btn goals__btn--ghost" type="button" onClick={onClose}>
                        Отмена
                    </button>
                    <button className="goals__btn goals__btn--primary" type="button" onClick={onSave}>
                        Готово
                    </button>
                </div>
            </div>
        </>
    )
}