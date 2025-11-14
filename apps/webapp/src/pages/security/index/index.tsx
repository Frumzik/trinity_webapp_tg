import TopBar from '../../../widgets/topbarTextpage'
import './security-list.scss'

export default function SecurityList(){
    return (
        <div className="sl">
            <TopBar title="Безопасность" />
            <main className="sl__main">
                <button className="sl__row" onClick={()=>location.assign('/security/change-pin')}>Сменить PIN-код <span>›</span></button>
                <button className="sl__row" onClick={()=>location.assign('/security/reset-pin-request')}>Сбросить PIN-код <span>›</span></button>
                <button className="sl__row" onClick={()=>location.assign('/security/verify-email-request')}>Подтвердить почту <span>›</span></button>
            </main>
        </div>
    )
}