import CardA from '../../assets/image/bg.svg'
import CardB from '../../assets/icons/bgpink.svg'
import CardC from '../../assets/icons/bgbeach.svg'
import type { LevelItem } from './index'

export const levelsData: LevelItem[] = [
    {
        id: 'g1-lvl1',
        group: 1,
        badge: { text: 'Информация', tone: 'info' },
        title: 'Основы дыхания и концентрации',
        subtitle: 'Уровень 1',
        durationMin: 12,
        image: CardA,
        status: 'available',     // НЕ locked → модалка покажет «Куплено»
        priceUSDT: 10
    },
    {
        id: 'g1-lvl2',
        group: 1,
        badge: { text: 'Разблокируйте за X USDT', tone: 'warn' },
        title: 'Уровень 2',
        durationMin: 12,
        image: CardB,
        status: 'locked',
        priceUSDT: 10
    },
    {
        id: 'g1-lvl3',
        group: 1,
        badge: { text: 'Разблокируйте за X USDT', tone: 'warn' },
        title: 'Уровень 3',
        durationMin: 12,
        image: CardC,
        status: 'locked',
        priceUSDT: 10
    },
    {
        id: 'g1-lvl4',
        group: 1,
        badge: { text: 'Разблокируйте за X USDT', tone: 'warn' },
        title: 'Уровень 4',
        durationMin: 12,
        image: CardC,
        status: 'locked',
        priceUSDT: 10
    },
    {
        id: 'g1-lvl5',
        group: 1,
        badge: { text: 'Разблокируйте за X USDT', tone: 'warn' },
        title: 'Уровень 5',
        durationMin: 12,
        image: CardC,
        status: 'locked',
        priceUSDT: 10
    },
    {
        id: 'g1-lvl6',
        group: 1,
        badge: { text: 'Разблокируйте за X USDT', tone: 'warn' },
        title: 'Уровень 6',
        durationMin: 12,
        image: CardC,
        status: 'locked',
        priceUSDT: 10
    },
    {
        id: 'g1-lvl7',
        group: 1,
        badge: { text: 'Разблокируйте за X USDT', tone: 'warn' },
        title: 'Уровень 7',
        durationMin: 12,
        image: CardC,
        status: 'locked',
        priceUSDT: 10
    },
    {
        id: 'g1-lvl8',
        group: 1,
        badge: { text: 'Разблокируйте за X USDT', tone: 'warn' },
        title: 'Уровень 8',
        durationMin: 12,
        image: CardC,
        status: 'locked',
        priceUSDT: 10
    },
    {
        id: 'g1-lvl9',
        group: 1,
        badge: { text: 'Разблокируйте за X USDT', tone: 'warn' },
        title: 'Уровень 9',
        durationMin: 12,
        image: CardC,
        status: 'locked',
        priceUSDT: 10
    },
    {
        id: 'g2-lvl1',
        group: 2,
        badge: { text: 'Информация', tone: 'info' },
        title: 'Практики осознанности',
        durationMin: 14,
        image: CardB,
        status: 'available'
    },
    {
        id: 'g3-lvl1',
        group: 3,
        badge: { text: 'Информация', tone: 'info' },
        title: 'Глубокая релаксация',
        durationMin: 16,
        image: CardC,
        status: 'available'
    }
]