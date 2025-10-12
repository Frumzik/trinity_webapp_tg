import { useNavigate } from 'react-router-dom'
import { useFooterTab } from '../../app/footer-tab'
import FavoritesIcon from '../../assets/icons/music-library-2.svg'
import DevelopmentIcon from '../../assets/icons/icon.svg'
import HomeIcon from '../../assets/icons/Black.svg'
import ProfileIcon from '../../assets/icons/medal-star.svg'
import StoreIcon from '../../assets/icons/setting-3.svg'
import './footer.scss'

export default function Footer() {
    const nav = useNavigate()
    const { tab, setTab } = useFooterTab()

    const go = (path: string, t: typeof tab) => {
        setTab(t)
        nav(path)
    }

    return (
        <nav className="footer">
            <div className="footer__bar">
                <button type="button" className={`footer__item${tab === 'favorites' ? ' is-active' : ''}`} onClick={() => go('/favorites', 'favorites')}>
                    <span className="icon"><img src={FavoritesIcon} alt="" /></span>
                    <span>Избранное</span>
                </button>

                <button type="button" className={`footer__item${tab === 'development' ? ' is-active' : ''}`} onClick={() => go('/development', 'development')}>
                    <span className="icon"><img src={DevelopmentIcon} alt="" /></span>
                    <span>Развитие</span>
                </button>

                <button type="button" className={`footer__item${tab === 'home' ? ' is-active' : ''}`} onClick={() => go('/', 'home')}>
                    <span className="icon"><img src={HomeIcon} alt="" /></span>
                    <span>Главная</span>
                </button>

                <button type="button" className={`footer__item${tab === 'profile' ? ' is-active' : ''}`} onClick={() => go('/profile', 'profile')} style={{ fontSize: '8px' }}>
                    <span className="icon"><img src={ProfileIcon} alt="" /></span>
                    <span>Личный кабинет</span>
                </button>

                <button type="button" className={`footer__item${tab === 'store' ? ' is-active' : ''}`} onClick={() => go('/store', 'store')}>
                    <span className="icon"><img src={StoreIcon} alt="" /></span>
                    <span>Магазин</span>
                </button>
            </div>
        </nav>
    )
}
