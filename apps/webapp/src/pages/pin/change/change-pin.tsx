import { useMemo, useState } from 'react'
import TopBar from '../../../widgets/topbarTextpage'
import GradientButton from '../../../shared/ui/gradient-button'
import TextField from '../../../shared/ui/forms/TextField'
import './change-pin.scss'
import { useUpdatePinMutation } from '../../../shared/api/user.api'
import { usePromoSetPinMutation } from '../../../shared/api/auth.api'
import { useAppSelector, useAppDispatch } from '../../../app/store'
import { useAppNavigate } from '../../../shared/lib/hooks/useAppNavigate'
import { sessionActions } from '../../../entities/session/model/session.slice'

const onlyDigits = (s: string) => s.replace(/\D+/g, '').slice(0, 4)

export default function ChangePinPage() {
  const navigate = useAppNavigate()
  const dispatch = useAppDispatch() // ✅
  const token = useAppSelector(s => s.session.token)

  const tgUser = useMemo(() => {
    const u = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user
    return u ? { id: Number(u.id), username: u.username } : null
  }, [])

  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [error, setError] = useState('')

  const [updatePin, upd] = useUpdatePinMutation()
  const [promoSetPin, promo] = usePromoSetPinMutation()
  const pickToken = (x: any): string | null =>
    x?.access_token ||
    x?.accessToken ||
    x?.token ||
    x?.data?.access_token ||
    x?.data?.accessToken ||
    x?.data?.token ||
    null;
  const isLoading = upd.isLoading || promo.isLoading

  const onSave = async () => {
    setError('')

    if (pin1.length !== 4 || pin2.length !== 4) {
      setError('PIN должен содержать ровно 4 цифры')
      return
    }

    if (pin1 !== pin2) {
      setError('PIN-коды не совпадают')
      return
    }

    try {
      // 1) Пользователь уже в системе (есть токен) -> просто обновляем PIN
      if (token) {
        await updatePin({ pin: pin1 }).unwrap()
        setPin1('')
        setPin2('')
        alert('PIN обновлён')
        navigate(-1)
        return
      }

      // 2) Пользователь без токена -> создаём PIN через PROMO_TG и сразу логиним
      if (!tgUser?.id) {
        navigate('/pin/login', { replace: true })
        return
      }

      const res: any = await promoSetPin({ type: 'PROMO_TG', tgId: tgUser.id, pin: pin1 }).unwrap();
      const newToken = pickToken(res);

      if (!newToken) {
        setError('Сервер не вернул токен после установки PIN');
        return;
      }
      dispatch(sessionActions.setToken(newToken));
      dispatch(sessionActions.setTgUser({ id: tgUser.id, username: tgUser.username }));

      localStorage.setItem('access_token', newToken);
      localStorage.setItem('tgId', String(tgUser.id));

      setPin1('');
      setPin2('');

      navigate('/', { replace: true });
    } catch {
      setError('Не удалось обновить PIN. Попробуйте ещё раз')
    }
  }

  return (
    <div className="sp">
      <TopBar title={token ? 'Безопасность' : 'Придумайте PIN'} hideBackButton/>
      <main className="sp__main">
        <TextField
          label="Новый PIN-код"
          value={pin1}
          onChange={(v) => { setPin1(onlyDigits(v)); setError('') }}
          inputMode="numeric"
          type="password"
        />
        <TextField
          label="Повторите PIN-код"
          value={pin2}
          onChange={(v) => { setPin2(onlyDigits(v)); setError('') }}
          inputMode="numeric"
          type="password"
        />
        {error && <div className="sp__error">{error}</div>}
      </main>

      <div className="gbtn-bar egg">
        <div className="gbtn-bar__inner">
          <GradientButton onClick={onSave} disabled={isLoading}>
            {isLoading ? 'Сохраняю…' : 'Сохранить'}
          </GradientButton>
        </div>
      </div>
    </div>
  )
}