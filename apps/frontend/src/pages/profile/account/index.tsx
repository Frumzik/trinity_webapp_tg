import {useEffect, useMemo, useState} from 'react'
import TopBar from '../../../widgets/topbarTextpage'
import GradientButton from '../../../shared/ui/gradient-button'
import TextField from '../../../shared/ui/forms/TextField'
import Segmented from '../../../shared/ui/forms/Segmented'
import arrowRight from "../../../assets/image/level/chevron-right-black.svg"
import femalePng from "../../../assets/image/level/women.svg"
import malePng from "../../../assets/image/level/men.svg"
import './account.scss'
import { useGetUserQuery, useUpdateFinPasswordMutation, useUpdateProfileMutation } from '../../../shared/api/user.api'

const GENDER_OUT: Record<'m'|'f','Male'|'Female'> = { m: 'Male', f: 'Female' }

function toMF(g: unknown): 'm'|'f' {
  if (g === 1 || g === 'Female' || g === 'FEMALE' || g === 'female' || g === 'f') return 'f'
  return 'm'
}

export default function AccountPage() {
  const { data } = useGetUserQuery({ populate: true })
  const user = data?.data

  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation()
  const [updateFinPassword, { isLoading: savingFin }] = useUpdateFinPasswordMutation()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailDirty, setEmailDirty] = useState(false)
  const [birth, setBirth] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [gender, setGender] = useState<'m' | 'f'>('m')

  const [finPass1, setFinPass1] = useState('')
  const [finPass2, setFinPass2] = useState('')

  const hasFinPassword = !!user?.finPasswordHash
  const [showFinForm, setShowFinForm] = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name ?? '')
    if (!emailDirty) setEmail(user.email ?? '')
    setBirth(user.birthDate ? user.birthDate.slice(0,10) : '')
    setHeight(user.height != null ? String(user.height) : '')
    setWeight(user.weight != null ? String(user.weight) : '')
    setGender(toMF(user.gender as any))
    setShowFinForm(!user.finPasswordHash)
  }, [user, emailDirty])

  const canSaveProfile = useMemo(() => {
    const hOk = !height || (+height >= 40 && +height <= 250)
    const wOk = !weight || (+weight >= 20 && +weight <= 250)
    const finOk = !showFinForm || !finPass1 || finPass1 === finPass2
    return hOk && wOk && finOk
  }, [height, weight, showFinForm, finPass1, finPass2])

  const onSave = async () => {
    const body: any = {}
    if (name.trim()) body.name = name.trim()
    if (birth) body.birthDate = new Date(birth).toISOString()
    if (height) body.height = Number(height)
    if (weight) body.weight = Number(weight)
    body.gender = GENDER_OUT[gender]
    await updateProfile(body).unwrap()

    if (showFinForm && finPass1 && finPass1 === finPass2) {
      await updateFinPassword({ finPassword: finPass1 }).unwrap()
      setFinPass1('')
      setFinPass2('')
      setShowFinForm(false)
    }
    alert('Сохранено')
  }

  return (
    <div className="acc">
      <TopBar title="Мой аккаунт"/>
      <main className="acc__main">
        <section className="acc__card">
          <TextField label="ФИО" value={name} onChange={setName} placeholder="Введите ФИО"/>
          <TextField
            label="Электронная почта*"
            type="email"
            name="profileEmail"
            autoComplete="off"
            value={email}
            onChange={(v) => { setEmail(v); setEmailDirty(true) }}
            placeholder="email@example.com"
          />
          <TextField label="Дата рождения*" type="date" value={birth} onChange={setBirth} placeholder="01.01.2000"/>
          <div className="acc__grid2">
            <TextField label="Рост (cm)" value={height} onChange={setHeight} type="number" placeholder="175" spinner step={1} min={40} max={250}/>
            <TextField label="Вес (kg)" value={weight} onChange={setWeight} type="number" placeholder="65" spinner step={1} min={20} max={250}/>
          </div>
          <Segmented
            label="Пол"
            value={gender}
            onChange={(v) => setGender(v as 'm' | 'f')}
            options={[
              { label: 'Мужской', value: 'm', icon: <img src={malePng} alt="" /> },
              { label: 'Женский', value: 'f', icon: <img src={femalePng} alt="" /> },
            ]}
          />
        </section>

        {showFinForm && (
          <section className="acc__card card2-nth">
            <div className="acc__title">{hasFinPassword ? 'Сменить фин.пароль' : 'Создать фин.пароль'}</div>
            <TextField label="Введите" type="password" value={finPass1} onChange={setFinPass1} maxLength={32}/>
            <TextField label="Повторить" type="password" value={finPass2} onChange={setFinPass2} maxLength={32}/>
          </section>
        )}

        <section className="acc__card acc__group">
          <div className="acc__group-title">Безопасность</div>
          <button className="acc__row" onClick={() => { setShowFinForm(true); setFinPass1(''); setFinPass2(''); }}>
            <span>Сменить фин.пароль</span><span className="acc__chev">Изменить <img src={arrowRight} alt=""/></span>
          </button>
          <button className="acc__row" onClick={() => location.assign('/security/reset-pin-request')}>
            <span>Сменить PIN-код</span><span className="acc__cheв">Изменить <img src={arrowRight} alt=""/></span>
          </button>
          <button className="acc__row" onClick={() => location.assign('/security/verify-email-request')}>
            <span>Подтвердить почту</span><span className="acc__cheв">Запросить код <img src={arrowRight} alt=""/></span>
          </button>
        </section>
      </main>

      <div className="gbtn-bar egg">
        <div className="gbtn-bar__inner ">
          <GradientButton onClick={onSave} disabled={!canSaveProfile || savingProfile || savingFin}>Сохранить</GradientButton>
        </div>
      </div>
    </div>
  )
}