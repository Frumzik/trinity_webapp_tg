import { useState } from 'react'
import TopBar from '../../../widgets/topbarTextpage'
import GradientButton from '../../../shared/ui/gradient-button'
import TextField from '../../../shared/ui/forms/TextField'
import './change-pin.scss'
import { useUpdatePinMutation } from '../../../shared/api/user.api'

// оставляем только цифры и максимум 4 символа
const onlyDigits = (s: string) => s.replace(/\D+/g, '').slice(0, 4)

export default function ChangePinPage() {
  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [error, setError] = useState<string>('')

  const [updatePin, { isLoading }] = useUpdatePinMutation()

  const onChangePin1 = (v: string) => {
    setPin1(onlyDigits(v))
    setError('')
  }
  const onChangePin2 = (v: string) => {
    setPin2(onlyDigits(v))
    setError('')
  }

  const onSave = async () => {
    setError('')

    // 1) оба поля должны быть заполнены и ровно по 4 цифры
    if (pin1.length !== 4 || pin2.length !== 4) {
      setError('PIN должен содержать ровно 4 цифры')
      return
    }

    // 2) PIN’ы должны совпадать
    if (pin1 !== pin2) {
      setError('PIN-коды не совпадают')
      return
    }

    try {
      await updatePin({ pin: pin1 }).unwrap()
      setPin1('')
      setPin2('')
      setError('')
      alert('PIN обновлён')
    } catch (e) {
      setError('Не удалось обновить PIN. Попробуйте ещё раз')
    }
  }

  return (
    <div className="sp">
      <TopBar title="Безопасность" />
      <main className="sp__main">
        <TextField
          label="Новый PIN-код"
          value={pin1}
          onChange={onChangePin1}
          inputMode="numeric"
          type="password"
        />
        <TextField
          label="Повторите PIN-код"
          value={pin2}
          onChange={onChangePin2}
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