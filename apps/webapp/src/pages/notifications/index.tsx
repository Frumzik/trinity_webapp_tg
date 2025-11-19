import { useEffect, useState } from 'react'
import TopBar from '../../widgets/topbarTextpage'
import GradientButton from '../../shared/ui/gradient-button'
import Switch from '../../shared/ui/switch'
import TimePicker, { type TimeValue } from '../../shared/ui/time-picker'
import { useGetUserQuery, useUpdateNotificationsMutation } from '../../shared/api/user.api'
import './notifications.scss'

const pad2 = (n: number) => String(n).padStart(2, '0')
const parseTime = (s: string | null | undefined): TimeValue | null => {
  if (!s) return null
  const [h, m] = s.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return { hours: h, minutes: m }
}
const formatTime = (t: TimeValue): string =>
  `${pad2(t.hours)}:${pad2(t.minutes)}`

export default function NotificationsPage() {
  const { data, isLoading: isUserLoading } = useGetUserQuery()
  const [updateNotifications, { isLoading: isSaving }] = useUpdateNotificationsMutation()

  const [reminderOn, setReminderOn] = useState(true)
  const [contentOn, setContentOn] = useState(true)
  const [promoOn, setPromoOn] = useState(false)
  const [time, setTime] = useState<TimeValue>({ hours: 10, minutes: 0 })

  useEffect(() => {
    const user = data?.data
    if (!user) return

    const parsed = parseTime(user.meditationNotifications ?? null)

    setReminderOn(Boolean(user.meditationNotifications))
    setTime(parsed ?? { hours: 10, minutes: 0 })

    if (typeof user.contentNotifications === 'boolean') {
      setContentOn(user.contentNotifications)
    }
    if (typeof user.promoNotifications === 'boolean') {
      setPromoOn(user.promoNotifications)
    }
  }, [data])

  const handleSave = async () => {
    const body = {
      meditationNotifications: reminderOn ? formatTime(time) : '',
      contentNotifications: contentOn,
      promoNotifications: promoOn,
    }

    try {
      await updateNotifications(body).unwrap()
    } catch (e) {
      console.error(e)
    }
  }

  const disabled = isUserLoading || isSaving

  return (
    <div className="notif">
      <TopBar title="Уведомления" />

      <main className="notif__main">
        <div className="notif__block">
          <div className="notif__row">
            <div className="notif__col">
              <div className="notif__title">Напоминания о медитациях</div>
              <div className="notif__sub">Ежедневное напоминание</div>
            </div>
            <Switch
              checked={reminderOn}
              onChange={setReminderOn}
            />
          </div>

          {reminderOn && (
            <div className="notif__time">
              <TimePicker value={time} onChange={setTime} is24h />
            </div>
          )}
        </div>

        <div className="notif__block">
          <div className="notif__row">
            <div className="notif__col">
              <div className="notif__title">Уведомления о контенте</div>
              <div className="notif__sub">Получать ежедневный контент</div>
            </div>
            <Switch
              checked={contentOn}
              onChange={setContentOn}
            />
          </div>
        </div>

        <div className="notif__block">
          <div className="notif__row">
            <div className="notif__col">
              <div className="notif__title">Промо-предложения</div>
              <div className="notif__sub">Уведомлять о специальных ценах</div>
            </div>
            <Switch
              checked={promoOn}
              onChange={setPromoOn}
            />
          </div>
        </div>
      </main>

      <div className="gbtn-bar egg">
        <div className="gbtn-bar__inner">
          <GradientButton onClick={handleSave} disabled={disabled}>
            {isSaving ? 'Сохраняем…' : 'Сохранить'}
          </GradientButton>
        </div>
      </div>
    </div>
  )
}