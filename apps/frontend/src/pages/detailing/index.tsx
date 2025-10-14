import {useState} from "react";
import Footer from "../../widgets/footer/footer.tsx";
import TopBar from "../../widgets/topbar/topbar.tsx";
import BurgerMenu from "../../widgets/menuBurger/burger.tsx";
import Title from "../../shared/ui/title/Title.tsx";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel.tsx";
import GradientButton from "../../shared/ui/gradient-button/index.tsx";

import "./detailing.scss";
import {useNavigate} from "react-router-dom";

const Index = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const nav = useNavigate()
    return (
        <div className="app">
            <TopBar onMenu={() => nav("/settings")}/>

            <main className="screen">
                <Title right={<button className="icon-btn"></button>}>
                    <div style={{fontSize: "27px"}}>Детализация</div>
                </Title>

                <section className="scrollBox stack" style={{marginTop: "20px"}}>
                    <div className="list__referals-det">
                        <div className="list__referals-title-det">
                            <div className="list__referals-title-up-det">Поколения</div>
                            <div className="list__referals-title-balance-det">1</div>
                        </div>
                    </div>
                    <ScrollPanel
                        maxHeight="200px"
                        vars={{
                            railRight: "0px",
                            railTop: "0px",
                            railBottom: "6px",
                            railWidth: "3px",
                            railColor: "#ededed",
                            thumbColor: "#b0b0b0",
                            zIndex: 999,
                        }}
                    >
                        <div className="list">
                            {Array.from({length: 90}).map((_, i) => (
                                <div className="row" key={i}>
                                    <span className="row__num">{i + 1}</span>
                                    <span className="row__count">35 OM</span>
                                </div>
                            ))}
                        </div>
                    </ScrollPanel>
                </section>
                <div className="screen__spacer"/>
            </main>
            <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)}/>
            <div className="gbtn-bar">
                <div className="gbtn-bar__inner">
                    <GradientButton href="https://t.me/share/url?url=..." target="_blank">
                        Пригласительная ссылка
                    </GradientButton>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default Index;
