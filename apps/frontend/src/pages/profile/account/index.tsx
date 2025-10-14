import {useState} from 'react'
import TopBar from '../../../widgets/topbarTextpage'
import GradientButton from '../../../shared/ui/gradient-button'
import TextField from '../../../shared/ui/forms/TextField'
import Segmented from '../../../shared/ui/forms/Segmented'
import arrowRight from "../../../assets/image/level/chevron-right-black.svg"
import femalePng from "../../../assets/image/level/women.svg"
import malePng from "../../../assets/image/level/men.svg"

import './account.scss'

export default function AccountPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [birth, setBirth] = useState('')
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [gender, setGender] = useState<'m' | 'f'>('m')

    const [finPass1, setFinPass1] = useState('')
    const [finPass2, setFinPass2] = useState('')

    // const canSave = name.trim() && email.trim()

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
                        onChange={setEmail}
                        placeholder="email@example.com"
                    />
                    <TextField  label="Дата рождения*" type="date" value={birth} onChange={setBirth} placeholder="дд.мм.гггг"/>

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
                            { label: 'Мужской', value: 'm', icon: <img src={malePng} alt="" /> },
                            { label: 'Женский', value: 'f', icon: <img src={femalePng} alt="" /> },
                        ]}
                    />
                </section>

                <section className="acc__card card2-nth">
                    <div className="acc__title">Создать фин.пароль</div>
                    <TextField label="Введите" type="password" value={finPass1} onChange={setFinPass1} maxLength={32}/>
                    <TextField label="Повторить" type="password" value={finPass2} onChange={setFinPass2}
                               maxLength={32}/>
                </section>

                <section className="acc__card acc__group">
                    <div className="acc__group-title">Безопасность</div>
                    <button className="acc__row" onClick={() => location.assign('/security/change-pin')}>
                        <span>Сменить PIN-код</span><span className="acc__chev">Изменить <img src={arrowRight} alt=""/></span>
                    </button>
                    <button className="acc__row" onClick={() => location.assign('/security/reset-pin-request')}>
                        <span>Сбросить PIN-код</span><span className="acc__chev">Изменить <img src={arrowRight} alt=""/></span>
                    </button>
                    <button className="acc__row" onClick={() => location.assign('/security/verify-email-request')}>
                        <span>Подтвердить почту</span><span className="acc__chev">Запросить код <img src={arrowRight}
                                                                                                     alt=""/></span>
                    </button>
                </section>
                <section className="acc__card acc__group">
                    <div className="acc__group-title">Настройки приложения</div>
                    <button className="acc__row" onClick={() => location.assign('/security/change-pin')}>
                        <span>Язык</span><span className="acc__chev">Изменить <img src={arrowRight} alt=""/></span>
                    </button>
                    <button className="acc__row" onClick={() => location.assign('/security/reset-pin-request')}>
                        <span>Страна</span><span className="acc__chev">Изменить <img src={arrowRight} alt=""/></span>
                    </button>
                </section>

            </main>

            <div className="gbtn-bar egg">
                <div className="gbtn-bar__inner ">
                    <GradientButton>Сохранить</GradientButton>
                </div>
            </div>
        </div>
    )
}