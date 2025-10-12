import './events.scss'
import {useState} from "react";

import Title from '../../shared/ui/title/Title'
import TopBar from "../../widgets/topbar/topbar.tsx";
import Footer from "../../widgets/footer/footer.tsx";
import BurgerMenu from "../../widgets/menuBurger/burger.tsx";
import FeatureTile from "../../widgets/tiles/FeatureTile";


import Bg1 from "../../assets/icons/bg1.svg";
import Card1 from "../../assets/icons/products/Card7.png";
import Card2 from "../../assets/icons/products/Card8.svg";
import Bgblue from "../../assets/icons/bgblue.svg"
import GradientButton from "../../shared/ui/gradient-button";
import {useNavigate} from "react-router-dom";

export default function Index() {
    const [menuOpen, setMenuOpen] = useState(false)
    const navigate = useNavigate()
    return (
        <div className="app" style={{['--gbutton-h' as any]: '60px'}}>
            <TopBar onMenu={() => setMenuOpen(true)}/>

            <main className="screen">
                <div className="supportPage">
                    <Title>Экран событий / школы</Title>

                    <div className="supportPage__cards">
                        <FeatureTile
                            title="Онлайн курсы"
                            description="Пройдено 1/40"
                            bgImageUrl={Bg1}
                            enabled
                            rightImageUrl={Card1}
                            onOpen={() => {}}
                            className='featureTile-events'
                        />
                        <FeatureTile
                        title="Живые встречи"
                        description="Посещение 1/40"
                        bgImageUrl={Bgblue}
                        enabled
                        rightImageUrl={Card2}
                        onOpen={() => {}}
                    />
                    </div>
                </div>
            </main>
            <div className="gbtn-bar">
                <div className="gbtn-bar__inner">
                    <GradientButton onClick={() => navigate(-1)}>Назад</GradientButton>
                </div>
            </div>
            <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)}/>
            <Footer/>
        </div>
    )
}
