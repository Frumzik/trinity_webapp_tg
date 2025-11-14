import { useState } from 'react'
import TopBar from '../../../widgets/topbarTextpage'
import GradientButton from '../../../shared/ui/gradient-button'
import TextField from '../../../shared/ui/forms/TextField'
import './change-pin.scss'
import { useUpdatePinMutation } from '../../../shared/api/user.api'

const onlyDigits = (s: string) => s.replace(/\D+/g, '').slice(0, 6)

export default function ChangePinPage(){
  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [error, setError] = useState<string>('')

  const [updatePin, { isLoading }] = useUpdatePinMutation()

  const onChangePin1 = (v: string) => { setPin1(onlyDigits(v)) }
  const onChangePin2 = (v: string) => { setPin2(onlyDigits(v)) }

  const onSave = async () => {
    setError('')
    if (pin1.length < 3) { setError('PIN должен быть не короче 3 цифр'); return }
    if (pin1 !== pin2) { setError('PIN не совпадают'); return }
    await updatePin({ pin: pin1 }).unwrap()
    setPin1('')
    setPin2('')
    setError('')
    alert('PIN обновлён')
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