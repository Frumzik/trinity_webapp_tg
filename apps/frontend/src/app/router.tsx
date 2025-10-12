import { createBrowserRouter } from 'react-router-dom'
import { FooterTabProvider } from './footer-tab'
import ProfilePage from '../pages/profile'
import PracticePage from '../pages/practice'
import StorePage from '../pages/store'
import BillingHistoryPage from '../pages/billing/history'
import WalletPage from '../pages/billing/wallet'
import WithdrawPage from '../pages/billing/withdraw'
import BillingSettingsPage from '../pages/billing/settings'
import ReferralsPage from '../pages/referrals'
import HomePage from '../pages/home'
import SupportPage from '../pages/support'
import ProductsPage from "../pages/products"
import EventsPage from "../pages/events"
import {Index as FavoritesPage} from "../pages/favorites"
import {Index as GiftsPage} from "../pages/gifts"
import AboutPage from "../pages/about"
import MarketingPage from "../pages/marketing"
import DetailingPage from "../pages/detailing"
import MaterialsPage from "../pages/materials"
import PreviewPage from "../pages/preview"
import LevelsPage from "../pages/levels"
import LevelPage from "../pages/level"
import PlayerScreen from "../pages/practisePlayer"
import ExitConfirm from "../pages/session/ExitConfirm.tsx"
import SessionComplete from "../pages/session/SessionComplete.tsx"
import type {JSX} from "react";

const wrap = (node: JSX.Element) => <FooterTabProvider>{node}</FooterTabProvider>


export const router = createBrowserRouter([
    { path: '/', element: wrap(<HomePage />) },
    { path: '/practice', element: wrap(<PracticePage />) },
    { path: '/store', element: wrap(<StorePage />) },
    { path: '/billing', element: wrap(<BillingHistoryPage />) },
    { path: '/billing/wallet', element: wrap(<WalletPage />) },
    { path: '/billing/withdraw', element: wrap(<WithdrawPage /> )},
    { path: '/billing/settings', element: wrap(<BillingSettingsPage />) },
    { path: '/referrals', element: wrap(<ReferralsPage />) },
    { path: '/profile', element: wrap(<ProfilePage />) },
    { path: '/support', element: wrap(<SupportPage />) },
    { path: '/products', element: wrap(<ProductsPage />) },
    { path: '/events', element: wrap(<EventsPage />) },
    { path: '/favorites', element: wrap(<FavoritesPage />) },
    { path: '/gifts', element: wrap(<GiftsPage />) },
    { path: '/about', element: wrap(<AboutPage />) },
    { path: '/marketing', element: wrap(<MarketingPage />) },
    { path: '/detailing', element: wrap(<DetailingPage />) },
    { path: '/materials', element: wrap(<MaterialsPage />) },
    { path: '/preview', element: wrap(<PreviewPage />) },
    { path: '/levels', element: wrap(<LevelsPage />) },
    { path: '/level', element: wrap(<LevelPage />) },
    { path: '/player', element: wrap(<PlayerScreen />) },
    { path: '/player/:trackId', element: wrap(<PlayerScreen />) },
    { path: '/player/exit', element: wrap(<ExitConfirm />) },
    { path: '/player/complete', element: wrap(<SessionComplete />) },
])
