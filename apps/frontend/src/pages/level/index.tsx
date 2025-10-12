import {useNavigate} from 'react-router-dom'
import Hero from './ui/Hero'
import TopActions from './ui/TopActions'
import Sheet from './ui/Sheet'
import './level.scss'
import PracticeSlider from "../../widgets/practise-card-slider";
import SectionHeader from "./ui/Sectionheader.tsx";

import Card1 from "../../assets/image/level/card1.png";
import Card2 from "../../assets/image/level/card2.svg";
import Card4 from "../../assets/image/level/card4.svg";
import Card5 from "../../assets/image/level/card5.svg";
import Card6 from "../../assets/image/level/card6.svg";
import Card7 from "../../assets/image/level/card7.svg";
import Card8 from "../../assets/image/level/card8.svg";


const films = [
    {id: 1, title: 'Практики', subtitle: '12 min',  imageUrl: Card1},
    {id: 2, title: 'Анонсы', subtitle: '12 min', imageUrl: Card2},
    {id: 3, title: 'Акции', subtitle: '12 min', imageUrl: Card5},
    {id: 4, title: 'Подборки', subtitle: '12 min', imageUrl: Card4},
    {id: 5, title: 'Новое', subtitle: '12 min', imageUrl: Card5},
    {id: 6, title: 'Хит', subtitle: '12 min', imageUrl: Card6}
]

const music = [
    {id: 11, title: 'Lo-Fi', subtitle: '12 min', imageUrl: Card4},
    {id: 12, title: 'Ambient', subtitle: '12 min', imageUrl: Card5},
    {id: 13, title: 'Focus', subtitle: '12 min', imageUrl: Card1}
]

const meditations = [
    {id: 21, title: 'Сон', subtitle: '10 мин', imageUrl: Card1},
    {id: 22, title: 'Антистресс', subtitle: '7 мин', imageUrl: Card7},
    {id: 22, title: 'Антистресс', subtitle: '7 мин', imageUrl: Card8}
]

export default function Index() {
    const navigate = useNavigate()

    return (
        <div className="preview">
            <TopActions
                onBack={() => navigate(-1)}
                onMenu={() => {
                }}
            />
            <Hero imageSrc={Card1}
                  header={{
                      title: 'Уровень 1',
                      subtitle: 'Основы дыхания и концентрации',
                      practicesCount: 36,
                      progress: {current: 10, total: 36}
                  }}>
            </Hero>

            <Sheet>
                <SectionHeader title="Rain and Storm Sounds" count={films.length} />
                <PracticeSlider items={films}/>
                <SectionHeader title="Wandering in Nature" count={music.length} />
                <PracticeSlider items={music}/>
                <SectionHeader title="Wandering in Nature" count={music.length} />
                <PracticeSlider items={meditations}/>

            </Sheet>
        </div>
    )
}
