import { useState } from 'react'
import TopBar from '../../widgets/topbarTextpage'
import GradientButton from '../../shared/ui/gradient-button'
import Switch from '../../shared/ui/switch'
import TimePicker, { type TimeValue } from '../../shared/ui/time-picker'
import './notifications.scss'

export default function NotificationsPage() {
    const [reminderOn, setReminderOn] = useState(true)
    const [contentOn, setContentOn] = useState(true)
    const [promoOn, setPromoOn] = useState(false)
    const [time, setTime] = useState<TimeValue>({ hours: 10, minutes: 0 })
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
                        <Switch checked={reminderOn} onChange={setReminderOn} />
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
                        <Switch checked={contentOn} onChange={setContentOn} />
                    </div>
                </div>

                <div className="notif__block">
                    <div className="notif__row">
                        <div className="notif__col">
                            <div className="notif__title">Промо-предложения</div>
                            <div className="notif__sub">Уведомлять о специальных ценах</div>
                        </div>
                        <Switch checked={promoOn} onChange={setPromoOn} />
                    </div>
                </div>
            </main>

            <div className="gbtn-bar egg">
                <div className="gbtn-bar__inner">
                    <GradientButton>Сохранить</GradientButton>
                </div>
            </div>
        </div>
    )
}