import './index.scss';
import TopBar from '../../../widgets/topbarTextpage';
import WithdrawForm from './ui/WithdrawForm';
import { useGetUserQuery } from '../../../shared/api/user.api';
import { useWithdrawMutation } from '../../../shared/api/acquiring.api';
import { useAppNavigate } from '../../../shared/lib/hooks/useAppNavigate';
import { useEffect, useState } from 'react';
import FlexibleModal from '../../../widgets/flexible-modal';

export default function WithdrawPage() {
  const navigate = useAppNavigate();
  const { data } = useGetUserQuery({ populate: false });
  const balance = data?.data?.balance ?? 0;

  const [withdraw, { isLoading }] = useWithdrawMutation();

  const [resultOpen, setResultOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState<string | undefined>();
  const [resultDesc, setResultDesc] = useState<string | undefined>();
  const [resultCta, setResultCta] = useState<string | undefined>();
  const [resultOnCta, setResultOnCta] = useState<(() => void) | undefined>();

  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const THRESHOLD = 150;

    let baseHeight =
      window.visualViewport?.height ?? window.innerHeight;

    const handleResize = () => {
      const currentHeight =
        window.visualViewport?.height ?? window.innerHeight;

      const diff = baseHeight - currentHeight;

      if (diff > THRESHOLD) {
        setKeyboardOpen(true);
      } else if (diff < THRESHOLD / 2) {
        setKeyboardOpen(false);
        baseHeight = currentHeight;
      }
    };

    const vv = window.visualViewport;

    if (vv) {
      vv.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (vv) {
        vv.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return (
    <div className={`withdraw ${keyboardOpen ? 'withdraw--kb-open' : ''}`}>
      <TopBar title="Кошелек" />
      <WithdrawForm
        title="Вывести ОМ"
        subtitle=""
        balance={balance}
        loading={isLoading}
        hideSubmit={keyboardOpen}
        submit={async (value, address) => {
          try {
            await withdraw({
              address: address.trim(),
              amount: String(value),
            }).unwrap();

            setResultTitle('Заявка на вывод отправлена');
            setResultDesc(
              'Мы приняли вашу заявку на вывод средств. Обычно обработка занимает некоторое время.'
            );
            setResultCta(undefined);
            setResultOnCta(undefined);
            setResultOpen(true);
          } catch (e: any) {
            const raw =
              e?.data?.message ??
              e?.error ??
              'Не удалось выполнить вывод средств';
            const msg = Array.isArray(raw) ? raw[0] : String(raw);

            setResultTitle(msg);
            setResultDesc('');
            setResultCta('Поддержка');
            setResultOnCta(() => () => {
              setResultOpen(false);
              navigate('/support');
            });
            setResultOpen(true);
          }
        }}
      />
      <FlexibleModal
        open={resultOpen}
        title={resultTitle}
        description={resultDesc}
        ctaLabel={resultCta}
        onCta={resultOnCta}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}