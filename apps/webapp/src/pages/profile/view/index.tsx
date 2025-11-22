import { useMemo, useState, useEffect } from 'react'
import TopBar from '../../../widgets/topbarTextpage'
import './view.scss'
import arrowRight from "../../../assets/image/level/chevron-right-black.svg"
import GradientButton from "../../../shared/ui/gradient-button"
import { useGetUserQuery, useUpdateFinPasswordMutation } from '../../../shared/api/user.api'
import { useNavigate } from 'react-router-dom'
import TextField from '../../../shared/ui/forms/TextField'
import SettingsIcon from "../../../assets/icons/edit.svg";

function fmtDate(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

function fmtGender(g: unknown) {
  if (g === 1 || g === 'Female' || g === 'female' || g === 'FEMALE' || g === 'f') return 'Женский'
  if (g === 0 || g === 'Male' || g === 'male' || g === 'MALE' || g === 'm') return 'Мужской'
  return ''
}

function splitFullName(full?: string | null) {
  if (!full) return { firstName: '', lastName: '', middleName: '' }
  const parts = full.trim().split(/\s+/)
  return {
    lastName: parts[0] ?? '',
    firstName: parts[1] ?? '',
    middleName: parts[2] ?? '',
  }
}

export default function ProfileViewPage() {
  const { data, refetch, isFetching } = useGetUserQuery({ populate: true })
  const u = data?.data
  const nav = useNavigate()

  const nameParts = useMemo(() => splitFullName(u?.name), [u?.name])

  const rows = useMemo(() => {
    return [
      ['Имя', nameParts.firstName],
      ['Фамилия', nameParts.lastName],
      ['Отчество', nameParts.middleName],
      ['Электронная почта', u?.email ?? ''],
      ['Дата рождения', fmtDate(u?.birthDate)],
      ['Рост', u?.height != null ? `${u.height} см` : ''],
      ['Вес', u?.weight != null ? `${u.weight} кг` : ''],
      ['Пол', fmtGender(u?.gender)],
    ] as [string, string][]
  }, [u, nameParts])

  const hasFin = !!u?.finPasswordHash
  const [showFinForm, setShowFinForm] = useState(false)
  const [fin1, setFin1] = useState('')
  const [fin2, setFin2] = useState('')
  const [updateFinPassword, { isLoading: savingFin }] = useUpdateFinPasswordMutation()

  const [language, setLanguage] = useState<'ru'>('ru')
  const [country, setCountry] = useState<'ru'>('ru')

  useEffect(() => {
    setShowFinForm(!hasFin)
  }, [hasFin])

  const canSaveFin = fin1.length > 0 && fin1 === fin2

  const onSave = async () => {
    if (!canSaveFin) return
    await updateFinPassword({ finPassword: fin1 }).unwrap()
    setFin1('')
    setFin2('')
    setShowFinForm(false)
    await refetch()
  }

  const isCreating = !hasFin
  const finTitle = isCreating ? 'Создать защитный пароль' : 'Сменить защитный пароль'

  return (
    <div className="pv">
      <TopBar
        title="Профиль"
        rightIconUrl={SettingsIcon}
        onRightClick={() => nav("/account")}

      />

      <main className="pv__main">
        <div className="pv__card">
          {rows.map(([k, v]) => (
            <div key={k} className="pv__row">
              <span className="pv__key">{k}</span>
              <span className="pv__val">{v}</span>
            </div>
          ))}
        </div>

        <section className="acc__card acc__group">
          <div className="acc__group-title">Безопасность</div>

          {hasFin && (
            <button
              className="acc__row"
            >
              <span>Защитный пароль</span>
              <span className="acc__chev acc__chev-password">..........</span>
            </button>
          )}

          <button className="acc__row">
            <span>PIN-код</span>
            <span className="acc__chev acc__chev-password">
              ....
            </span>
          </button>
        </section>

        {showFinForm && (
          <section className="acc__card card2-nth">
            <div className="acc__title">{finTitle}</div>

            <TextField
              label="Введите"
              type="password"
              value={fin1}
              onChange={setFin1}
              maxLength={32}
            />
            <TextField
              label="Повторить"
              type="password"
              value={fin2}
              onChange={setFin2}
              maxLength={32}
            />

            <div className="acc__fin-actions">
              <GradientButton
                onClick={onSave}
                disabled={!canSaveFin || savingFin || isFetching}
              >
                Сохранить
              </GradientButton>
            </div>
          </section>
        )}

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
    </div>
  )
}