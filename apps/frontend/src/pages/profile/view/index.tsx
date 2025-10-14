import TopBar from '../../../widgets/topbarTextpage'
import './view.scss'
import arrowRight from "../../../assets/image/level/chevron-right-black.svg";
import GradientButton from "../../../shared/ui/gradient-button";

export default function ProfileViewPage() {
    const user = {
        firstName: 'Иван', lastName: 'Иванов', middle: 'Иванович',
        email: 'ivanovivan@gmail.com', birth: '01.01.1995',
        height: '190 см', weight: '100 кг', gender: 'Мужской'
    }
    // const canSave = name.trim() && email.trim()

    return (
        <div className="pv">
            <TopBar title="Профиль"/>
            <main className="pv__main">
                <div className="pv__card">
                    {[
                        ['Имя', user.firstName],
                        ['Фамилия', user.lastName],
                        ['Отчество', user.middle],
                        ['Электронная почта', user.email],
                        ['Дата рождения', user.birth],
                        ['Рост', user.height],
                        ['Вес', user.weight],
                        ['Пол', user.gender],
                    ].map(([k, v]) => (
                        <div key={k} className="pv__row">
                            <span className="pv__key">{k}</span>
                            <span className="pv__val">{v}</span>
                        </div>
                    ))}
                </div>

                <section className="acc__card acc__group">
                    <div className="acc__group-title">Безопасность</div>
                    <button className="acc__row" onClick={() => location.assign('/security/change-pin')}>
                        <span>Сменить PIN-код</span><span className="acc__chev">Изменить <img src={arrowRight} alt=""/></span>
                    </button>
                    <button className="acc__row" onClick={() => location.assign('/security/reset-pin-request')}>
                        <span>Сбросить PIN-код</span><span className="acc__chev">Изменить <img src={arrowRight} alt=""/></span>
                    </button>
                    <button className="acc__row" onClick={() => location.assign('/security/verify-email-request')}>
                        <span>Подтвердить почту</span><span className="acc__chev">Запросить код <img src={arrowRight} alt=""/></span>
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
                    <GradientButton  >Сохранить</GradientButton>
                </div>
            </div>
        </div>
    )
}