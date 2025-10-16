import "./store.scss";
import {useState} from "react";

import Title from "../../shared/ui/title/Title";
import TopBar from "../../widgets/topbar/topbar.tsx";
import Footer from "../../widgets/footer/footer.tsx";
import BurgerMenu from "../../widgets/menuBurger/burger.tsx";
import FeatureTile from "../../widgets/tiles/FeatureTile";

import Bg1 from "../../assets/icons/bg1.svg";
import Card5 from "../../assets/icons/products/card5.svg";
import {useNavigate} from "react-router-dom";

export default function Index() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="app" style={{["--gbutton-h" as any]: "60px"}}>
          <TopBar onMenu={() => setMenuOpen(true)} />

          <main className="screen">
                <div className="supportPage">
                    <Title>Магазин</Title>

                    <div className="supportPage__cards">
                        <FeatureTile
                            title="Практики"
                            description=""
                            bgImageUrl={Bg1}
                            rightImageUrl={Card5}
                            enabled
                            onOpen={undefined}
                            to="/practice"
                        />
                        <FeatureTile
                            title="Товары"
                            description="..."
                            bgImageUrl={Bg1}
                            enabled={false}
                        />
                        <FeatureTile
                            title="Услуги"
                            description="..."
                            bgImageUrl={Bg1}
                            enabled={false}
                        />
                    </div>
                </div>
            </main>
            <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)}/>
            <Footer/>
        </div>
    );
}
