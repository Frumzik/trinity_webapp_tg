import { useEffect, useState } from 'react'
import TopBar from '../../widgets/topbarTextpage'
import GradientButton from '../../shared/ui/gradient-button'
import Switch from '../../shared/ui/switch'
import TimePicker, { type TimeValue } from '../../shared/ui/time-picker'
import { useGetUserQuery, useUpdateNotificationsMutation } from '../../shared/api/user.api'
import './notifications.scss'
import { sessionActions } from '../../entities/session/model/session.slice';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/store';

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
  const navigate = useNavigate();
  const dispatch = useAppDispatch()
  const [reminderOn, setReminderOn] = useState(true)
  const [contentOn, setContentOn] = useState(true)
  const [promoOn, setPromoOn] = useState(false)
  const [time, setTime] = useState<TimeValue>({ hours: 10, minutes: 0 })

  const clearAccessTokenOnly = () => {
    dispatch(sessionActions.setToken(null))
    navigate('/pin/login', { replace: true })
  }

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
              <div className="notif__title">Получать напоминания о <br />прохождении практик</div>
            </div>
            <Switch
              checked={reminderOn}
              onChange={setReminderOn}
            />
          </div>
          <GradientButton variant="alt" onClick={clearAccessTokenOnly}>
            Очистить access_token
          </GradientButton>
          {reminderOn && (
            <div className="notif__time">
              <TimePicker value={time} onChange={setTime} is24h />
            </div>
          )}
        </div>

        <div className="notif__block">
          <div className="notif__row">
            <div className="notif__col">
              <div className="notif__title">Получать сообщения с посланиями света</div>
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
              <div className="notif__title">Получать уведомления о полезных <br/>материалах и предложениях</div>
              {/*<div className="notif__sub">Уведомлять о специальных ценностях</div>*/}
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