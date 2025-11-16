import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../../widgets/topbarTextpage';
import SubscriptionBanner from './ui/SubscriptionBanner';
import SettingsRow from './ui/SettingsRow';
import Footer from '../../../widgets/footer/footer';
import './index.scss';
import { useGetUserQuery } from '../../../shared/api/user.api';

export default function BillingSettingsPage() {
  const nav = useNavigate();

  const { data } = useGetUserQuery({ populate: true });
  const u = (data as any)?.data ?? (data as any);

  const { planLabel, planName, ctaLabel } = useMemo(() => {
    const sub = (u as any)?.subscription;

    if (!sub) {
      return {
        planLabel: 'Доступ',
        planName: 'Не активен',
        ctaLabel: 'Обновить',
      };
    }

    const type = sub.type ?? 'paid';

    if (type === 'free') {
      return {
        planLabel: 'Доступ',
        planName: 'Не активен',
        ctaLabel: 'Обновить',
      };
    }

    return {
      planLabel: 'Доступ',
      planName: 'Активен',
      ctaLabel: 'Обновить',
    };
  }, [u]);

  return (
    <>
      <div className="settings">
        <TopBar title="Настройки" />

        <div className="settings__body">
          <SubscriptionBanner
            planLabel={planLabel}
            planName={planName}
            cta={ctaLabel}
            onCta={() => nav('/subscription')}
          />

          <div className="settings__group">
            <SettingsRow label="Мой аккаунт" onClick={() => nav('/account')} />
            <SettingsRow
              label="Уведомления"
              onClick={() => nav('/notifications')}
            />
            <SettingsRow
              label="Управление подпиской"
              onClick={() => nav('/subscription')}
            />
          </div>

          <div className="settings__caption">FAQ</div>

          <div className="settings__group">
            <SettingsRow label="Частые вопросы" onClick={() => nav('/faq')} />
            <SettingsRow
              label="Политика конфиденциальности"
              onClick={() => nav('/policy')}
            />
            <SettingsRow
              label="Пользовательское соглашение"
              onClick={() => {
                const tg = (window as any).Telegram?.WebApp;
                tg?.openLink
                  ? tg.openLink('https://telegram.org/tos/mini-apps')
                  : window.open('https://telegram.org/tos/mini-apps', '_blank');
              }}
            />
          </div>
          {/*<button className="settings__logout" onClick={() => nav("/logout")}>*/}
          {/*  Выйти*/}
          {/*</button>*/}
        </div>

      </div>
  <Footer />
  </>
  );
}
