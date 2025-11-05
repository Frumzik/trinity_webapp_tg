import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useNavigate,
} from 'react-router-dom';
import App from './App'
import { FooterTabProvider } from './footer-tab'

import HomePage from '../pages/home'
import FilmsPage from '../pages/films'
import PolicyPage from '../pages/policy'
import PracticePage from '../pages/practice'
import AcademyPage from '../pages/academy'
import WorkshopPage from '../pages/workshop'
import StorePage from '../pages/store'
import BillingHistoryPage from '../pages/billing/history'
import WalletPage from '../pages/billing/wallet'
import WithdrawPage from '../pages/billing/withdraw'
import BillingSettingsPage from '../pages/billing/settings'
import ProfilePage from '../pages/profile'
import SupportPage from '../pages/support'
import SecurityList from '../pages/security/index'
import ViewPage from '../pages/preview'
import AccountPage from '../pages/profile/account'
import ChangePinPage from '../pages/security/change-pin'
import ResetPinRequestPage from '../pages/security/reset-pin-request'
import ResetPinConfirmPage from '../pages/security/reset-pin-confirm'
import ProductsPage from '../pages/products'
import EventsPage from '../pages/events'
import { Index as FavoritesPage } from '../pages/favorites'
import { Index as GiftsPage } from '../pages/gifts'
import AboutPage from '../pages/about'
import MarketingPage from '../pages/marketing'
import DetailingPage from '../pages/detailing'
import MaterialsPage from '../pages/materials'
import PreviewPage from '../pages/preview'
import LevelsPage from '../pages/levels'
import LevelPage from '../pages/level'
import PlayerScreen from '../pages/practisePlayer'
import ExitConfirm from '../pages/practisePlayer'
import SessionComplete from '../pages/practisePlayer'
import GoalsPage from '../pages/goals'
import NotificationsPage from '../pages/notifications'
import SubscriptionPage from '../pages/billing/subscription'
import FaqPage from '../pages/faq'
import HealthLabPage from '../pages/healthLab'
import PinCreatePage from '../pages/pin/create'
import PinLoginPage from '../pages/pin/login'
import { useEffect } from 'react';

const wrap = (node: React.ReactNode) => <FooterTabProvider>{node}</FooterTabProvider>

function PrivateRoute() {
  const token = localStorage.getItem('access_token')
  return token ? <Outlet /> : <Navigate to="/pin" replace />
}

function PinGate() {
  const nav = useNavigate()
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user
    if (!tg?.id) {
      nav('/pin/login', { replace: true })
      return
    }
    ;(async () => {
      try {
        const base = process.env.API_URL || ''
        const r = await fetch(`${base}/auth/check-tg?tgId=${tg.id}`)
        const d = r.ok ? await r.json() : null
        const exists = typeof d === 'boolean' ? d : !!d?.exists
        nav(exists ? '/pin/login' : '/pin/create', { replace: true })
      } catch {
        nav('/pin/login', { replace: true })
      }
    })()
  }, [nav])
  return null
}
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'pin', element: wrap(<PinGate />) },
      { path: 'pin/create', element: wrap(<PinCreatePage />) },
      { path: 'pin/login', element: wrap(<PinLoginPage />) },
      {
        element: <PrivateRoute />,
        children: [
          { index: true, element: wrap(<HomePage />) },
          { path: 'films', element: wrap(<FilmsPage />) },
          { path: 'policy', element: wrap(<PolicyPage />) },
          { path: 'practice', element: wrap(<PracticePage />) },
          { path: 'academy', element: wrap(<AcademyPage />) },
          { path: 'workshop', element: wrap(<WorkshopPage />) },
          { path: 'store', element: wrap(<StorePage />) },
          { path: 'billing', element: wrap(<BillingHistoryPage />) },
          { path: 'wallet', element: wrap(<WalletPage />) },
          { path: 'withdraw', element: wrap(<WithdrawPage />) },
          { path: 'settings', element: wrap(<BillingSettingsPage />) },
          { path: 'profile', element: wrap(<ProfilePage />) },
          { path: 'support', element: wrap(<SupportPage />) },
          { path: 'security', element: wrap(<SecurityList />) },
          { path: 'view', element: wrap(<ViewPage />) },
          { path: 'account', element: wrap(<AccountPage />) },
          { path: 'security/change-pin', element: wrap(<ChangePinPage />) },
          { path: 'security/reset-pin-request', element: wrap(<ResetPinRequestPage />) },
          { path: 'security/reset-pin-confirm', element: wrap(<ResetPinConfirmPage />) },
          { path: 'products', element: wrap(<ProductsPage />) },
          { path: 'events', element: wrap(<EventsPage />) },
          { path: 'favorites', element: wrap(<FavoritesPage />) },
          { path: 'gifts', element: wrap(<GiftsPage />) },
          { path: 'about', element: wrap(<AboutPage />) },
          { path: 'marketing', element: wrap(<MarketingPage />) },
          { path: 'detailing', element: wrap(<DetailingPage />) },
          { path: 'materials', element: wrap(<MaterialsPage />) },
          { path: 'preview', element: wrap(<PreviewPage />) },
          { path: 'levels', element: wrap(<LevelsPage />) },
          { path: 'level', element: wrap(<LevelPage />) },
          { path: 'player', element: wrap(<PlayerScreen />) },
          { path: 'player/:trackId', element: wrap(<PlayerScreen />) },
          { path: 'player/exit', element: wrap(<ExitConfirm />) },
          { path: 'player/complete', element: wrap(<SessionComplete />) },
          { path: 'goals', element: wrap(<GoalsPage />) },
          { path: 'notifications', element: wrap(<NotificationsPage />) },
          { path: 'subscription', element: wrap(<SubscriptionPage />) },
          { path: 'faq', element: wrap(<FaqPage />) },
          { path: 'health-lab', element: wrap(<HealthLabPage />) },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])