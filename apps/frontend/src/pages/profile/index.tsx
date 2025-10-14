import {useState} from "react";
import Footer from "../../widgets/footer/footer.tsx";
import TopBar from "../../widgets/topbarlk/topbarlk.tsx";
import Title from "../../shared/ui/title/Title.tsx";
import ProfileHeader from "../../widgets/profile-header";
import IncomeTile from "../../widgets/tiles/MoneyTile/Income.tsx";
import LevelTile from "../../widgets/tiles/LevelTile/levelTile.tsx";
import GreyTile from "../../widgets/tiles/GreyTile/GreyTile.tsx";
import ReferralsTile from "../../widgets/tiles/FriendsTile/FriendsTile.tsx";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel.tsx";
import GradientButton from "../../shared/ui/gradient-button/index.tsx";
import PresentationSentModal from "../../widgets/presentation-sent-modal";

import PopupIcon from "../../assets/icons/popup.svg";
import AvatarIcon from "../../assets/icons/Ellipse 2.png";
import Card1 from "../../assets/image/image_1.svg";
import Card2 from "../../assets/image/image_2.svg";
import Card3 from "../../assets/image/About-ptoject.svg";
import Card4 from "../../assets/image/image_4.svg";

import EditIcon from "../../assets/icons/edit.svg";
import "./profile.scss";
import {useNavigate} from "react-router-dom";

const Index = () => {
    const [openModal, setOpenModal] = useState(false);
    const onDownload = (e?: React.MouseEvent) => {
        e?.preventDefault();
        setOpenModal(true);
    }
    const nav = useNavigate()
    return (
        <div className="app">
            <TopBar onMenu={() => nav("/settings")}/>

            <main className="screen">
                <Title
                    right={
                        <button className="icon-btn">
                            <img src={EditIcon} alt=""/>
                        </button>
                    }
                >
                    Личный кабинет
                </Title>
                <ProfileHeader
                    avatarUrl={AvatarIcon}
                    name="Name"
                    username="logintelegram"
                    premium
                    balance="300 OM"
                    onStatusClick={() => nav('/subscription')}
                />
                <section className="scrollBox stack">
                    <ScrollPanel
                        maxHeight="57dvh"
                        vars={{
                            railRight: "-15px",
                            railTop: "4px",
                            railBottom: "4px",
                            railWidth: "3px",
                            railColor: "#E8E8E8",
                            thumbColor: "#C7C7C7",
                            zIndex: 20,
                        }}
                    >
                        <div className="tiles">
                            <IncomeTile
                                title="Общий доход"
                                amountOM={40}
                                showIncome
                                imageUrl={Card1}
                                onWithdraw={undefined}
                                to="/withdraw"
                            />
                            <LevelTile level={2} completed={20} total={40} imageUrl={Card2}/>
                            <GreyTile
                                title="О проекте"
                                imageUrl={Card3}
                                buttonText={"Скачать презентацию"}
                                onClick={onDownload}
                            />
                            {/*<GreyTile title="Чат" imageUrl={Card3} href="#" />*/}
                            {/*<GreyTile title={<>Связаться<br/>с поддержкой</>} imageUrl={Card3} href="https://t.me/your_support" />*/}
                        </div>
                        <div className="scrollBox__title-cont">
                            <div className="scrollBox__title">Единомышленники</div>
                            <div className="scrollBox__icon">
                                <a href="#">
                                    <img src={PopupIcon} alt="help"/>
                                </a>
                            </div>
                        </div>

                        <ReferralsTile
                            imageUrl={Card4}
                            referrals={[{id: 1}, {id: 2}, {id: 3}, {id: 4}]}
                            href="/referrals"
                        />
                        <div className="list__referals">
                            <div className="list__referals-title">
                                <div className="list__referals-title-up">Доход</div>
                                <div className="list__referals-title-balance">140 080 OM</div>
                            </div>
                            <div className="list__referals-subtitle">
                                <div className="list__referals-title-levels">Уровни</div>
                                <div className="list__referals-title-levels-count">9</div>
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
                                {Array.from({ length: 90 }).map((_, i) => {
                                    const level = i + 1;
                                    return (
                                        <div
                                            key={level}
                                            className="row is-clickable"
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => nav('/detailing', { state: { level } })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    nav('/detailing', { state: { level } });
                                                }
                                            }}
                                        >
                                            <span className="row__num">{level}</span>
                                            <span className="row__count">35 OM</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollPanel>
                    </ScrollPanel>
                </section>
                <div className="screen__spacer"/>
            </main>
            <div className="gbtn-bar">
                <div className="gbtn-bar__inner">
                    <GradientButton href="https://t.me/share/url?url=..." target="_blank">
                        Пригласить друга
                    </GradientButton>
                </div>
            </div>
            <PresentationSentModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                fileName="Trinity.pdf"
                fileSizeText="9.1 MB"
                durationText="00:00"
            />
            <Footer/>
        </div>
    );
};

export default Index;
