import { useState} from "react";

import MiniCardSlider from "../../widgets/card-slider-homePage";
import TopBar from "../../widgets/topbarlk/topbarlk.tsx";
import Footer from "../../widgets/footer/footer.tsx";
import BurgerMenu from "../../widgets/menuBurger/burger.tsx"
import IncomeTile from '../../widgets/tiles/MoneyTile/Income.tsx'
import FeatureTile from '../../widgets/tiles/FeatureTile'


import Bg2 from '../../assets/icons/bgblue.svg'
import HimicalImg from '../../assets/icons/himical.svg'
import WhiteImg from '../../assets/icons/WhiteImg.svg'
import Card1 from "../../assets/image/image_1.svg"
import Card4 from "../../assets/image/image_4.svg"

import './home.scss'
import ReferralsCard from "../../widgets/tiles/FriendsTile/FriendsTile.tsx";


export default function SupportPage() {
    const [menuOpen, setMenuOpen] = useState(false)
    return (
        <div className="app" style={{['--gbutton-h' as any]: '60px'}}>
            <TopBar onMenu={() => setMenuOpen(true)}/>

            <main className="screen" style={{padding: "5px 16px 0px 16px"}}>
                <MiniCardSlider />
                <div className="supportPage">


                    <div className="supportPage__cards" style={{gap: "10px"}}>
                        <IncomeTile
                            title="Академия духа"
                            showIncome={false}
                            imageUrl={Card1}
                        />
                        <FeatureTile
                            className="featureTile--noBtn"
                            title="Практики"
                            description=""
                            bgImageUrl={Bg2}
                            enabled
                            rightImageUrl={WhiteImg}
                            onOpen={() => {}}
                        />

                        <div className="refcardhome" style={{display: "flex", gap: "11px"}}>
                        <ReferralsCard
                            imageUrl={Card4}
                            titleTop="Пройти практику"
                            labelBottom="2 ступень"
                            count={4}
                            href="/practice"
                            className="refCard--imgRight refCard--166x123"
                        />
                        <ReferralsCard
                            imageUrl={Card4}
                            titleTop="Пройти практику"
                            labelBottom="2 ступень"
                            count={4}
                            href="/practice"
                            className="refCard--imgRight refCard--166x123"
                        />
                        </div>
                        <FeatureTile
                            title="Практики"
                            description=""
                            bgImageUrl={Bg2}
                            enabled
                            rightImageUrl={HimicalImg}
                            onOpen={() => {}}
                        />
                    </div>
                </div>
            </main>
            <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)}/>
            <Footer/>
        </div>
    )
}
