import { useNavigate } from 'react-router-dom'
import TopBar from '../../../widgets/topbarTextpage'
import SubscriptionBanner from './ui/SubscriptionBanner'
import SettingsRow from './ui/SettingsRow'
import './index.scss'
import Footer from "../../../widgets/footer/footer.tsx";

export default function BillingSettingsPage() {
    const nav = useNavigate()

    return (
        <div className="settings">
            <TopBar title="Настройки" />

            <div className="settings__body">
                <SubscriptionBanner
                    planLabel="Подписка"
                    planName="Бесплатно"
                    cta="Обновить"
                    onCta={() => nav('/billing/upgrade')}
                />

                <div className="settings__group">
                    <SettingsRow label="Мой аккаунт" onClick={() => nav('/profile')} />
                    <SettingsRow label="Уведомления" onClick={() => nav('/settings/notifications')} />
                    <SettingsRow label="Управление подпиской" onClick={() => nav('/billing/subscription')} />
                </div>

                <div className="settings__caption">FAQ</div>

                <div className="settings__group">
                    <SettingsRow label="Частые вопросы" onClick={() => nav('/support/faq')} />
                    <SettingsRow label="Политика конфиденциальности" onClick={() => nav('/legal/privacy')} />
                    <SettingsRow label="Условия использования" onClick={() => nav('/legal/terms')} />
                </div>

                <button className="settings__logout" onClick={() => nav('/logout')}>Выйти</button>
            </div>
                <Footer />
        </div>
    )
}