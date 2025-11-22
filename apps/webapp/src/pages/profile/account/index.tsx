import {useEffect, useMemo, useRef, useState} from 'react'
import TopBar from '../../../widgets/topbarTextpage'
import GradientButton from '../../../shared/ui/gradient-button'
import TextField from '../../../shared/ui/forms/TextField'
import Segmented from '../../../shared/ui/forms/Segmented'
import arrowRight from "../../../assets/image/level/chevron-right-black.svg"
import Female from "../../../assets/image/level/women.svg"
import FemaleGrey  from "../../../assets/image/level/womengrey.svg"
import MaleGrey  from "../../../assets/image/level/mengrey.svg"
import Male  from "../../../assets/image/level/men.svg"
import './account.scss'

import {
  useGetUserQuery,
  useUpdateFinPasswordMutation,
  useUpdateProfileMutation,
  useUpdateEmailMutation
} from '../../../shared/api/user.api'
import { useNavigate } from 'react-router-dom';

const GENDER_OUT: Record<'m'|'f','Male'|'Female'> = { m: 'Male', f: 'Female' }
const toMF = (g: unknown): 'm'|'f' => (g === 1 || g === 'Female' || g === 'FEMALE' || g === 'female' || g === 'f') ? 'f' : 'm'
const toGenderStr = (g: unknown): 'Male'|'Female'|'' =>
  (g === 1 || g === 'Female' || g === 'female' || g === 'FEMALE')
    ? 'Female'
    : (g === 0 || g === 'Male' || g === 'male' || g === 'MALE')
      ? 'Male'
      : ''
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function AccountPage() {
  const nav = useNavigate();
  const { data } = useGetUserQuery({ populate: true })
  const user = data?.data

  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation()
  const [updateFinPassword, { isLoading: savingFin }] = useUpdateFinPasswordMutation()
  const [updateEmail] = useUpdateEmailMutation()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailDirty, setEmailDirty] = useState(false)
  const initialEmailRef = useRef<string>('')

  const [birth, setBirth] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [gender, setGender] = useState<'m' | 'f'>('m')

  const [finPass1, setFinPass1] = useState('')
  const [finPass2, setFinPass2] = useState('')

  const hasFinPassword = !!user?.finPasswordHash
  const [showFinForm, setShowFinForm] = useState(false)

  const [language, setLanguage] = useState<'ru'>('ru')
  const [country, setCountry] = useState<'ru'>('ru')

  useEffect(() => {
    if (!user) return
    setName(user.name ?? '')
    if (!emailDirty) {
      const fromDb = user.email ?? ''
      initialEmailRef.current = fromDb
      setEmail(fromDb)
    }
    setBirth(user.birthDate ? user.birthDate.slice(0,10) : '')
    setHeight(user.height != null ? String(user.height) : '')
    setWeight(user.weight != null ? String(user.weight) : '')
    setGender(toMF(user.gender as any))

    // если пароля ещё нет – сразу показываем форму создания
    setShowFinForm(!user.finPasswordHash)
  }, [user, emailDirty])

  // валидация только для профиля (рост/вес)
  const canSaveProfile = useMemo(() => {
    const hOk = !height || (+height >= 40 && +height <= 250)
    const wOk = !weight || (+weight >= 20 && +weight <= 250)
    return hOk && wOk
  }, [height, weight])

  const emailOk = useMemo(() => {
    if (!emailDirty) return true
    const v = email.trim()
    if (v === '') return true
    return isEmail(v)
  }, [emailDirty, email])

  const profileDirty = useMemo(() => {
    const n0 = (user?.name ?? '').trim()
    const n1 = name.trim()
    const b0 = user?.birthDate ? user.birthDate.slice(0,10) : ''
    const g0 = toGenderStr(user?.gender as any)
    const g1 = GENDER_OUT[gender]
    const h0 = user?.height != null ? String(user.height) : ''
    const w0 = user?.weight != null ? String(user.weight) : ''
    return n1 !== n0 || birth !== b0 || height !== h0 || weight !== w0 || g1 !== g0
  }, [user, name, birth, height, weight, gender])

  const emailDirtyChanged = emailDirty && email.trim() !== initialEmailRef.current

  // для кнопки под полями пароля
  const canSaveFin = finPass1.length > 0 && finPass1 === finPass2

  // нижняя большая кнопка — только профиль + email
  const dirty = (profileDirty || emailDirtyChanged) && emailOk

  const onSaveProfile = async () => {
    const body: any = {}
    if (name.trim()) body.name = name.trim()
    if (birth) body.birthDate = new Date(birth).toISOString()
    if (height) body.height = Number(height)
    if (weight) body.weight = Number(weight)
    body.gender = GENDER_OUT[gender]

    if (profileDirty) {
      await updateProfile(body).unwrap()
    }

    if (emailDirtyChanged && emailOk) {
      await updateEmail({ email: email.trim() }).unwrap()
      initialEmailRef.current = email.trim()
      setEmailDirty(false)
    }

    if (profileDirty || emailDirtyChanged) {
      alert('Сохранено')
    }
  }

  const onSaveFin = async () => {
    if (!canSaveFin) return
    await updateFinPassword({ finPassword: finPass1 }).unwrap()
    setFinPass1('')
    setFinPass2('')
    setShowFinForm(false)
  }

  return (
    <div className="acc">
      <TopBar title="Профиль"/>
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
          <TextField
            label="Дата рождения*"
            type="date"
            value={birth}
            onChange={setBirth}
            placeholder="01.01.2000"
          />

          <div className="acc__grid2">
            <TextField
              label="Рост (cm)"
              value={height}
              onChange={setHeight}
              type="number"
              placeholder="175"
              spinner
              step={1}
              min={40}
              max={250}
            />
            <TextField
              label="Вес (kg)"
              value={weight}
              onChange={setWeight}
              type="number"
              placeholder="65"
              spinner
              step={1}
              min={20}
              max={250}
            />
          </div>

          <Segmented
            label="Пол"
            value={gender}
            onChange={(v) => setGender(v as 'm' | 'f')}
            options={[
              {
                label: 'Мужской',
                value: 'm',
                icon: (active) => (
                  <img
                    src={active ? Male : MaleGrey}
                    alt=""
                    className="acc__gender-icon"
                  />
                ),
              },
              {
                label: 'Женский',
                value: 'f',
                icon: (active) => (
                  <img
                    src={active ? Female : FemaleGrey}
                    alt=""
                    className="acc__gender-icon"
                  />
                ),
              },
            ]}
          />
        </section>

        {/* форма создания/смены защитного пароля */}
        {showFinForm && (
          <section className="acc__card card2-nth">
            <div className="acc__title">
              {hasFinPassword ? 'Сменить защитный пароль' : 'Создать защитный пароль'}
            </div>
            <TextField
              label="Введите"
              type="password"
              value={finPass1}
              onChange={setFinPass1}
              maxLength={32}
            />
            <TextField
              label="Повторить"
              type="password"
              value={finPass2}
              onChange={setFinPass2}
              maxLength={32}
            />

            <div className="acc__fin-actions">
              <GradientButton
                onClick={onSaveFin}
                disabled={!canSaveFin || savingFin}
              >
                Сохранить
              </GradientButton>
            </div>
          </section>
        )}

        {/* Блок "Безопасность" */}
        <section className="acc__card acc__group">
          <div className="acc__group-title">Безопасность</div>

          {/* Пункт "Защитный пароль" — только если он уже создан */}
          {hasFinPassword && (
            <button
              className="acc__row"
              onClick={() => {
                setShowFinForm(true)
                setFinPass1('')
                setFinPass2('')
              }}
            >
              <span>Сменить защитный пароль</span>
              <span className="acc__chev">
              Изменить <img src={arrowRight} alt=""/>
            </span>
            </button>
          )}

          <button className="acc__row" onClick={() => nav('/security/change-pin')}>
            <span>Сменить PIN-код</span>
            <span className="acc__chev">
              Изменить <img src={arrowRight} alt=""/>
            </span>
          </button>
        </section>

        <section className="acc__card acc__group">
          <div className="acc__group-title">Настройки приложения</div>

          <div className="acc__row acc__row--select">
            <span>Язык</span>
            <select
              className="acc__select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'ru')}
            >
              <option value="ru">Русский</option>
            </select>
          </div>

          <div className="acc__row acc__row--select">
            <span>Страна</span>
            <select
              className="acc__select"
              value={country}
              onChange={(e) => setCountry(e.target.value as 'ru')}
            >
              <option value="ru">Россия</option>
            </select>
          </div>
        </section>
      </main>

      {/* нижняя большая кнопка — только профиль + email */}
      {dirty && (
        <div className="gbtn-bar egg">
          <div className="gbtn-bar__inner ">
            <GradientButton
              onClick={onSaveProfile}
              disabled={!canSaveProfile || !emailOk || savingProfile}
            >
              Сохранить
            </GradientButton>
          </div>
        </div>
      )}
    </div>
  )
}