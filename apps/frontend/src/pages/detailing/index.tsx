// src/pages/detailing/index.tsx
import {useMemo, useState} from "react";
import Footer from "../../widgets/footer/footer";
import TopBar from "../../widgets/topbar/topbar";
import BurgerMenu from "../../widgets/menuBurger/burger";
import Title from "../../shared/ui/title/Title";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import GradientButton from "../../shared/ui/gradient-button";
import "./detailing.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetReferralsLevelsQuery } from "../../shared/api/referrals.api";

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate()
  const location = useLocation()
  const levelFromState = (location.state as any)?.level as number | undefined

  const { data, isLoading, isError, refetch } = useGetReferralsLevelsQuery()
  const level = levelFromState ?? 1

  const current = useMemo(() => {
    const list = data ?? []
    return list.find((x) => x.level === level) || { level, totalEarn: 0, referrals: [] as any[] }
  }, [data, level])

  return (
    <div className="app">
      <TopBar onMenu={() => setMenuOpen(true)} />

      <main className="screen">
        <Title right={<button className="icon-btn" onClick={() => refetch()}></button>}>
          <div style={{fontSize: "27px"}}>Детализация</div>
        </Title>

        <section className="scrollBox stack" style={{marginTop: "20px"}}>
          <div className="list__referals-det">
            <div className="list__referals-title-det">
              <div className="list__referals-title-up-det">Поколения</div>
              <div className="list__referals-title-balance-det">{level}</div>
            </div>
          </div>

          {isLoading && <div style={{padding:16}}>Загрузка…</div>}
          {isError && <div style={{padding:16}}>Не удалось загрузить. <button onClick={() => refetch()}>Повторить</button></div>}

          {!isLoading && !isError && (
            <ScrollPanel
              maxHeight="200px"
              vars={{ railRight: "0px", railTop: "0px", railBottom: "6px", railWidth: "3px", railColor: "#ededed", thumbColor: "#b0b0b0", zIndex: 999 }}
            >
              <div className="list">
                {current.referrals.length === 0 && (
                  <div style={{padding:16, opacity:.7}}>Пока пусто</div>
                )}
                {current.referrals.map((r, i) => (
                  <div className="row" key={r.id ?? i}>
                    <span className="row__num">{i + 1}</span>
                    <span className="row__count">{r.amount ?? 0} OM</span>
                  </div>
                ))}
              </div>
            </ScrollPanel>
          )}
        </section>

        <div className="screen__spacer"/>
      </main>

      <div className="gbtn-bar">
        <div className="gbtn-bar__inner">
          <GradientButton onClick={() => nav(-1)}>Назад</GradientButton>
        </div>
      </div>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer/>
    </div>
  );
};

export default Index;