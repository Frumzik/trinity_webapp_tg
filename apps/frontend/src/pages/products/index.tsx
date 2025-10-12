import Title from '../../shared/ui/title/Title'
import GradientButton from '../../shared/ui/gradient-button'
import TopBar from "../../widgets/topbar/topbar.tsx";
import Footer from "../../widgets/footer/footer.tsx";
import BurgerMenu from "../../widgets/menuBurger/burger.tsx";
import FeatureTile from "../../widgets/tiles/FeatureTile";

import {useState} from "react";
import {useNavigate} from 'react-router-dom'

import Bg1 from "../../assets/icons/bg1.svg";
import OrangeBg from "../../assets/image/Differentbg/orangeBg.svg"
import Bgblue from "../../assets/icons/bgblue.svg"
import Card1 from "../../assets/icons/products/card1.svg"
import Card2 from "../../assets/icons/products/card2.svg"
import Card3 from "../../assets/icons/products/card3.svg"
import Card4 from "../../assets/icons/products/card4.svg"
import Card5 from "../../assets/icons/products/card5.svg"
import Card6 from "../../assets/icons/himical.svg"


import "./products.scss"
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel.tsx";

export default function Index() {
    const [menuOpen, setMenuOpen] = useState(false)
    const navigate = useNavigate()
    return (
        <div className="app" style={{['--gbutton-h' as any]: '60px'}}>
            <TopBar onMenu={() => setMenuOpen(true)}/>

            <main className="screen">
                <div className="supportPage">
                    <Title>Все продукты</Title>

                    <div className="supportPage__cards">
                        <ScrollPanel maxHeight="62dvh" vars={{
                            railRight: '-15px',
                            railTop: '4px',
                            railBottom: '4px',
                            railWidth: '3px',
                            railColor: '#E8E8E8',
                            thumbColor: '#C7C7C7',
                            zIndex: 20
                        }}>
                        <FeatureTile
                            title="Ступени духа"
                            description="Пройдено 1/40"
                            bgImageUrl={Bg1}
                            rightImageUrl={Card1}
                            enabled
                        />
                        <FeatureTile
                            title="Полезные материалы"
                            description=""
                            bgImageUrl={Bg1}
                            rightImageUrl={Card2}
                            enabled
                        />
                        <FeatureTile
                            title="Мастерская знаний"
                            description=""
                            bgImageUrl={OrangeBg}
                            rightImageUrl={Card3}
                            enabled
                        />
                        <FeatureTile
                            title="Курс: Генные ключи"
                            description=""
                            bgImageUrl={Bg1}
                            rightImageUrl={Card4}
                            enabled
                        />
                            <FeatureTile
                                title="Практики"
                                description=""
                                bgImageUrl={Bg1}
                                rightImageUrl={Card5}
                                enabled
                            />
                            <FeatureTile
                                title="Лаборатория здоровья"
                                description=""
                                bgImageUrl={Bgblue}
                                rightImageUrl={Card6}
                                enabled
                            />
                            </ScrollPanel>
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
