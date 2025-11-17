
import {useMemo, useState} from 'react'
import TopBar from '../../../widgets/topbarTextpage'
import GradientButton from '../../../shared/ui/gradient-button'
import ChekImg from "../../../assets/image/level/check.svg"
import './subscription.scss'
import { useGetUserQuery } from '../../../shared/api/user.api'


type Props = {
  priceYearUSD?: number
  priceMonthUSD?: number
}

function Pill({tone, label, right}: { tone: 'dark' | 'grad', label: string, right?: string }) {
  return (
    <div className={`sub__pill ${tone === 'grad' ? 'sub__pill--grad' : ''}`}>
      <div className="sub__pill-left">Доступ</div>
      <div className="sub__pill-right">{right ?? label}</div>
    </div>
  )
}

function Bullet({children}: { children: string }) {
  return (
    <li className="sub__li">
      <span className="sub__dot">
        <img src={ChekImg} alt=""/>
      </span>
      <span>{children}</span>
    </li>
  )
}

export default function SubscriptionManagePage({
                                                 priceYearUSD = 69.99,
                                                 priceMonthUSD = 6.49,
                                               }: Props) {

  const { data, isLoading, isError } = useGetUserQuery({ populate: true })
  const [selectedPlan, setSelectedPlan] = useState<'year' | 'month'>('year')

  const status: 'free' | 'premium' = useMemo(() => {
    const t = data?.data?.subscription?.type
    // маппинг типов, если на бэке есть 'pro'
    if (t === 'premium') return 'premium'
    return 'free'
  }, [data])

  const endDateISO = data?.data?.subscription?.endDate ?? undefined

  const endDate = useMemo(() => {
    if (!endDateISO) return ''
    try {
      const d = new Date(endDateISO)
      const fmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
      return fmt.format(d)
    } catch {
      return ''
    }
  }, [endDateISO])

  if (isLoading) {
    return (
      <div className="sub">
        <TopBar title="Управление доступом"/>
        <main className="sub__main"><div className="sub__loading">Загрузка…</div></main>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="sub">
        <TopBar title="Управление доступом"/>
        <main className="sub__main"><div className="sub__error">Не удалось получить данные пользователя</div></main>
      </div>
    )
  }

  if (status === 'premium') {
    return (
      <div className="sub">
        <TopBar title="Управление доступом"/>
        <main className="sub__main">
          <section className="sub__section">
            <Pill tone="grad" label="Premium" right="Premium"/>
          </section>

          <section className="sub__details">
            <div className="sub__row">
              <span className="sub__label">Дата окончания:</span>
              <span className="sub__value">{endDate || '—'}</span>
            </div>

            <div className="sub__row">
              <span className="sub__label">Управлять подпиской</span>
              <button
                className="sub__link"
                onClick={() => location.assign('/billing/subscription/details')}
              >
                Детали
              </button>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="sub">
      <TopBar title="Управление доступом"/>
      <main className="sub__main">
        <section className="sub__section">
          <Pill tone="dark" label="Неактивен" right="Неактивен"/>
        </section>

        <section className="sub__pitch">
          <h2 className="sub__h2">Станьте Premium</h2>
          <ul className="sub__ul">
            <Bullet>100+ звуков, шумов и музыки</Bullet>
            <Bullet>500+ медитаций с голосовым сопровождением</Bullet>
            <Bullet>Запись сна</Bullet>
            <Bullet>Советы и инсайты по отслеживанию сна</Bullet>
          </ul>
        </section>
      </main>

      <section className="sub__offer">
        <div className="abc">
          <div
            className={`sub__offer-card ${selectedPlan === 'year' ? 'sub__offer-card--active' : ''}`}
            onClick={() => setSelectedPlan('year')}
          >
            <div className="sub__offer-title">Оформить на год</div>
            <div className="sub__offer-price">
              ${priceYearUSD.toFixed(2)} <span className="sub__offer-note">/ год</span>
            </div>
            <div className="sub__offer-sub">(${(priceYearUSD / 12).toFixed(2)} / месяц)</div>
          </div>

          <div
            className={`sub__offer-card sub__offer-card-month ${selectedPlan === 'month' ? 'sub__offer-card--active' : ''}`}
            onClick={() => setSelectedPlan('month')}
          >
            <div className="sub__offer-title">Оформить на месяц</div>
            <div className="sub__offer-price">
              ${priceMonthUSD.toFixed(2)} <span className="sub__offer-note">/ месяц</span>
            </div>
            <div className="sub__offer-sub">({(priceMonthUSD * 12).toFixed(2)} / год)</div>
          </div>

          <div className="gbtn-bar sub__cta egg">
            <div className="gbtn-bar__inner ">
              <GradientButton
                onClick={() => {
                  const plan = selectedPlan === 'year' ? 'premium_year' : 'premium_month'
                  location.assign(`/billing/checkout?plan=${plan}`)
                }}
              >
                Активировать
              </GradientButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}