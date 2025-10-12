import { useLocation, useNavigate } from 'react-router-dom'
import GradientButton from '../../shared/ui/gradient-button'
import './session.scss'

export default function ExitConfirm() {
    const nav = useNavigate()
    const { state } = useLocation() as { state: { track: any, currentSec: number, durationSec: number } }
    const minutes = Math.max(1, Math.round((state?.currentSec ?? 0) / 60))
    const t = state?.track

    const onSave = async () => {
        // TODO: вызов API сохранения прогресса
        nav(-1) // или на нужный список
    }

    const onExitNoSave = () => {
        nav(-1)
    }

    return (
        <div className="session session--blur" style={{ backgroundImage: `url(${t?.artworkUrl})` }}>
            <div className="session__shade" />
            <div className="session__center">
                <div className="session__title" style={{color: "#FFF"}}>{t?.title}</div>
                {t?.subtitle && <div className="session__subtitle" style={{color: "#FFF"}}>{t.subtitle}</div>}
                <div className="session__chip" style={{
                    border: '1px solid rgba(255, 255, 255, 0.10)',
                    background: 'rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 4px 20px 0 rgba(15, 23, 42, 0.04)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    color: "#FFF"
                }}><span style={{fontWeight: "700"}}>{minutes}</span> минут прослушано</div>
            </div>

            <div className="session__actions">
                <GradientButton onClick={onSave}>Сохранить</GradientButton>
                <button className="session__link" onClick={onExitNoSave}>Закончить сессию без сохранения</button>
            </div>
        </div>
    )
}