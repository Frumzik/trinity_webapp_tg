import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../../widgets/topbarTextpage';
import GradientButton from '../../../shared/ui/gradient-button';
import ChekImg from '../../../assets/image/level/check.svg';
import './subscription.scss';
import { useGetUserQuery } from '../../../shared/api/user.api';
import { useAddPurchaseMutation } from '../../../shared/api/purchase.api';
import FlexibleModal from '../../../widgets/flexible-modal';
import helpIcon from '../../../assets/icons/helpIcon.svg';

type Props = {
  priceYearUSD?: number;
  priceMonthUSD?: number;
};

function Pill({
  tone,
  label,
  right,
  active,
}: {
  tone: 'dark' | 'grad';
  label: string;
  right?: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "sub__pill",
        tone === "grad" ? "sub__pill--grad" : "",
        active ? "sub__pill--active" : "",
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="sub__pill-left">Доступ</div>
      <div className="sub__pill-right">{right ?? label}</div>
    </div>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <li className="sub__li">
      <span className="sub__dot">
        <img src={ChekImg} alt="" />
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function SubscriptionManagePage({
  priceYearUSD = 69.99,
  priceMonthUSD = 6.49,
}: Props) {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetUserQuery({
    populate: true,
  });
  const [addPurchase, { isLoading: isBuying }] = useAddPurchaseMutation();

  const [selectedPlan, setSelectedPlan] = useState<'year' | 'month'>('year');

  // состояние для FlexibleModal
  const [resultOpen, setResultOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState<string | undefined>();
  const [resultItems, setResultItems] = useState<string[] | undefined>();
  const [resultDesc, setResultDesc] = useState<string | undefined>();
  const [resultCta, setResultCta] = useState<string | undefined>();
  const [resultOnCta, setResultOnCta] = useState<(() => void) | undefined>();

  const status: 'free' | 'premium' = useMemo(() => {
    const t = data?.data?.subscription?.type;
    if (t === 'premium') return 'premium';
    return 'free';
  }, [data]);

  const endDateISO = data?.data?.subscription?.endDate ?? undefined;

  const endDate = useMemo(() => {
    if (!endDateISO) return '';
    try {
      const d = new Date(endDateISO);
      const fmt = new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      return fmt.format(d);
    } catch {
      return '';
    }
  }, [endDateISO]);

  const balance = data?.data?.balance ?? 0;

  const currentPrice = selectedPlan === 'year' ? priceYearUSD : priceMonthUSD;
  const currentDays = selectedPlan === 'year' ? 365 : 30;

  const openSuccessModal = () => {
    setResultTitle('Доступ активен');
    setResultItems(undefined);
    setResultCta('В главное меню');
    setResultOnCta(() => () => {
      setResultOpen(false);
      navigate('/home');
    });
    setResultOpen(true);
  };

  const openErrorModal = (
    message?: string | string[],
    isInsufficient?: boolean
  ) => {
    const msg = Array.isArray(message) ? message.join('\n') : message;

    setResultTitle(
      msg || (isInsufficient ? 'Недостаточно баланса' : 'Произошла ошибка')
    );
    setResultItems(undefined);
    setResultDesc(undefined);

    setResultCta(isInsufficient ? 'Пополнить баланс' : 'Продолжить');

    setResultOnCta(() => () => {
      if (isInsufficient) {
        navigate('/wallet');
        setResultOpen(false);
      } else {
        setResultOpen(false);
      }
    });

    setResultOpen(true);
  };

  const handleActivate = async () => {
    // локальная проверка по балансу
    if (balance < currentPrice) {
      openErrorModal('Недостаточно баланса', true);
      return;
    }

    try {
      await addPurchase({
        type: 'Subscription',
        subscriptionDays: currentDays,
        subscriptionSum: currentPrice,
      }).unwrap();

      await refetch();
      openSuccessModal();
    } catch (e: any) {
      const raw = e?.data?.message ?? e?.error ?? 'Ошибка покупки';
      const msg = Array.isArray(raw) ? raw[0] : raw;

      const isInsufficient =
        typeof msg === 'string' && msg.toLowerCase().includes('баланс');

      openErrorModal(msg, isInsufficient);
    }
  };

  if (isLoading) {
    return (
      <div className="sub">
        <TopBar title="Управление доступом" />
        <main className="sub__main">
          <div className="sub__loading">Загрузка…</div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="sub">
        <TopBar title="Управление доступом" />
        <main className="sub__main">
          <div className="sub__error">
            Не удалось получить данные пользователя
          </div>
        </main>
      </div>
    );
  }

  if (status === 'premium') {
    return (
      <div className="sub">
        <TopBar title="Управление доступом" />
        <main className="sub__main">
          <section className="sub__section">
            <Pill tone="grad" label="Доступ" right="Активен" active={status === "premium"}/>
          </section>

          <section className="sub__details">
            <div className="sub__row">
              <span className="sub__label" style={{ color: '#fff' }}>
                Дата окончания:
              </span>
              <span className="sub__value" style={{ color: '#fff' }}>
                {endDate || '—'}
              </span>
            </div>
            <div className="sub__row">
              <span className="sub__label" style={{ color: '#fff' }}>
                Управлять доступом:
              </span>
              <span
                className="sub__value"
                style={{ color: '#fff', borderBottom: '1px solid #fff' }}
              >
                {'Детали'}
              </span>
            </div>
          </section>
        </main>

        <FlexibleModal
          open={resultOpen}
          title={resultTitle}
          items={resultItems}
          description={resultDesc}
          ctaLabel={resultCta}
          onCta={resultOnCta}
          closeIconUrl={helpIcon}
          onClose={() => setResultOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="sub">
      <TopBar title="Управление доступом" />
      <main className="sub__main">
        <section className="sub__section">
          <Pill tone="dark" label="Неактивен" right="Неактивен" />
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
            className={`sub__offer-card ${
              selectedPlan === 'year' ? 'sub__offer-card--active' : ''
            }`}
            onClick={() => !isBuying && setSelectedPlan('year')}
          >
            <div className="sub__offer-title">Оформить на год</div>
            <div className="sub__offer-price">
              ${priceYearUSD.toFixed(2)}{' '}
              <span className="sub__offer-note">/ год</span>
            </div>
            <div className="sub__offer-sub">
              (${(priceYearUSD / 12).toFixed(2)} / месяц)
            </div>
          </div>

          <div
            className={`sub__offer-card sub__offer-card-month ${
              selectedPlan === 'month' ? 'sub__offer-card--active' : ''
            }`}
            onClick={() => !isBuying && setSelectedPlan('month')}
          >
            <div className="sub__offer-title">Оформить на месяц</div>
            <div className="sub__offer-price">
              ${priceMonthUSD.toFixed(2)}{' '}
              <span className="sub__offer-note">/ месяц</span>
            </div>
            <div className="sub__offer-sub">
              ({(priceMonthUSD * 12).toFixed(2)} / год)
            </div>
          </div>

          <div className="gbtn-bar sub__cta egg">
            <div className="gbtn-bar__inner ">
              <GradientButton onClick={handleActivate} disabled={isBuying}>
                {isBuying ? 'Оформляем…' : 'Активировать'}
              </GradientButton>
            </div>
          </div>
        </div>
      </section>

      <FlexibleModal
        open={resultOpen}
        title={resultTitle}
        items={resultItems}
        description={resultDesc}
        ctaLabel={resultCta}
        onCta={resultOnCta}
        closeIconUrl={helpIcon}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}
