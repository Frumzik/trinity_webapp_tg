import { useMemo, useState } from 'react'
import TopBar from '../../widgets/topbarTextpage'
import Accordion from './Accordion'

import SearchIcon from "../../assets/image/level/Search.svg"

import './faq.scss'

type FaqItem = { id: string; q: string; a: string }

const DATA: FaqItem[] = [
    { id: '1', q: 'Как отменить подписку?', a: 'Зайдите в «Управление подпиской» → «Детали» и следуйте инструкциям магазина.' },
    { id: '2', q: 'Как получить код скидки?', a: 'Промокоды приходят по e-mail и появляются в разделе «Маркетинг».' },
    { id: '3', q: 'Что такое с сопровождением?', a: 'Практики с голосовыми подсказками по дыханию и ритму.' },
    { id: '4', q: 'Как добавить личные медитации?', a: 'Откройте «Материалы» → «Мои файлы» и загрузите mp3/m4a.' },
    { id: '5', q: 'Где посмотреть историю?', a: 'В разделе «История транзакций» или в профиле → «Активность».' },
]

export default function FaqPage() {
    const [query, setQuery] = useState('')
    const [openId, setOpenId] = useState<string | null>('4')

    const list = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return DATA
        return DATA.filter(i => (i.q + ' ' + i.a).toLowerCase().includes(q))
    }, [query])

    return (
        <div className="faq">
            <TopBar title="Частые вопросы" />

            <main className="faq__main">
                <label className="faq__search">
                    <span className="faq__search-ico" aria-hidden ><img src={SearchIcon} alt=""/></span>
                    <input
                        className="faq__search-input"
                        placeholder="Найти…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        type="search"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </label>

                <ul className="faq__list">
                    {list.map(i => (
                        <Accordion
                            key={i.id}
                            title={i.q}
                            defaultOpen={openId === i.id}
                            onToggle={(o) => setOpenId(o ? i.id : null)}

                        >
                            <p className="faq__a">{i.a}</p>
                        </Accordion>
                    ))}
                </ul>
            </main>
        </div>
    )
}