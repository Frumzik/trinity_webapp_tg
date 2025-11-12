// pages/training/index.tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../../widgets/topbar/topbar'
import Footer from '../../widgets/footer/footer'
import BurgerMenu from '../../widgets/menuBurger/burger'
import Title from '../../shared/ui/title/Title'
import ScrollPanel from '../../shared/ui/scroll-panel/scroll-panel'
import FeatureTile from '../../widgets/tiles/FeatureTile'
import GradientButton from '../../shared/ui/gradient-button'
import { useGetUserTrainingByIdQuery } from '../../shared/api/learning.api'
import Bg1 from '../../assets/icons/bg1.svg'
import OrangeBg from '../../assets/image/Differentbg/orangeBg.svg'
import Bgblue from '../../assets/icons/bgblue.svg'
import './training.scss'

export default function Index() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data, isLoading, isError, refetch } = useGetUserTrainingByIdQuery({ id: Number(id) })

  const node = data?.data
  const children = useMemo(() => node?.childrens ?? [], [node])
  const lessons = useMemo(() => node?.lessons ?? [], [node])

  useEffect(() => {
    if (node && lessons.length && children.length === 0) {
      navigate(`/level/${node.trainingId}`, {
        replace: true,
        state: { returnTo: `/trainings/${node.trainingId}` }, // ← важное
      });
    }
  }, [node, lessons, children, navigate]);

  const pickBg = (t?: string) => (t === 'stages_spirit' ? Bg1 : t === 'course' ? OrangeBg : Bgblue)

  if (isLoading) {
    return (
      <div className="app">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <main className="screen"><div className="supportPage"><Title>Загрузка…</Title></div></main>
        <Footer />
      </div>
    )
  }

  if (isError || !node) {
    return (
      <div className="app">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <main className="screen">
          <div className="supportPage">
            <Title>Ошибка</Title>
            <button onClick={() => refetch()}>Повторить</button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="app" style={{ ['--gbutton-h' as any]: '60px' }}>
      <TopBar onMenu={() => setMenuOpen(true)} />
      <main className="screen">
        <div className="supportPage">
          <Title>{node.title}</Title>

          {!!children.length && (
            <div className="supportPage__cards" style={{ marginBottom: 16 }}>
              <ScrollPanel
                maxHeight="62dvh"
                vars={{ railRight: '-15px', railTop: '4px', railBottom: '4px', railWidth: '3px', railColor: '#E8E8E8', thumbColor: '#C7C7C7', zIndex: 20 }}
              >
                {children.map((t: any) => (
                  <FeatureTile
                    key={t._id}
                    title={t.title}
                    description={t.shortDescription || ''}
                    bgImageUrl={pickBg(t.type)}
                    rightImageUrl={t.iconUrl || Bg1}
                    enabled={t.accessStatus === 'available'}
                    onClick={() => navigate(`/trainings/${t.trainingId}`)}
                  />
                ))}
              </ScrollPanel>
            </div>
          )}
        </div>
      </main>

      <div className="gbtn-bar">
        <div className="gbtn-bar__inner">
          <GradientButton onClick={() => navigate(-1)}>Назад</GradientButton>
        </div>
      </div>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Footer />
    </div>
  )
}