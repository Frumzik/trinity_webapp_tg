import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import App from './App'
import { FooterTabProvider } from './footer-tab'
import { useAppSelector } from './store'
import AuthGate from './AuthGate'

import HomePage from '../pages/home'
import ProgressPage from '../pages/progress'
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
import ViewPage from '../pages/profile/view/index'
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
import ExitConfirm from '../pages/session/ExitConfirm'
import SessionComplete from '../pages/session/SessionComplete'
import GoalsPage from '../pages/goals'
import NotificationsPage from '../pages/notifications'
import SubscriptionPage from '../pages/billing/subscription'
import FaqPage from '../pages/faq'
import HealthLabPage from '../pages/healthLab'
import PinCreatePage from '../pages/pin/create'
import PinLoginPage from '../pages/pin/login'
import TrainingPage from '../pages/training'
import LessonTextPage from "../pages/level/text-level"
import EntryPage from "../pages/entry"
import TrainingLevelsIndex from '../pages/training-levels';
import TransfersPage from '../pages/billing/transfer/index';

const wrap = (node: React.ReactNode) => <FooterTabProvider>{node}</FooterTabProvider>

function PrivateRoute() {
  const token = useAppSelector(s => s.session.token)
  return token ? <Outlet /> : <Navigate to="/pin/login" replace />
}

export const router = createBrowserRouter([
  {
    element: <AuthGate />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, element: wrap(<EntryPage />) },
          { path: 'pin/create', element: wrap(<PinCreatePage />) },
          { path: 'pin/login', element: wrap(<PinLoginPage />) },

          {
            element: <PrivateRoute />,
            children: [
              { path: 'home', element: wrap(<HomePage />) },
              { path: 'films', element: wrap(<FilmsPage />) },
              { path: 'policy', element: wrap(<PolicyPage />) },
              { path: 'practice', element: wrap(<PracticePage />) },
              { path: 'academy', element: wrap(<AcademyPage />) },
              { path: 'workshop', element: wrap(<WorkshopPage />) },
              { path: 'store', element: wrap(<StorePage />) },
              { path: 'billing', element: wrap(<BillingHistoryPage />) },
              { path: 'wallet', element: wrap(<WalletPage />) },
              { path: 'withdraw', element: wrap(<WithdrawPage />) },
              { path: 'transfers', element: wrap(<TransfersPage />) },
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
              { path: 'lesson/:trainingId/:lessonId', element: wrap(<LessonTextPage />) },
              { path: 'marketing', element: wrap(<MarketingPage />) },
              { path: 'detailing', element: wrap(<DetailingPage />) },
              { path: 'materials', element: wrap(<MaterialsPage />) },
              { path: 'preview', element: wrap(<PreviewPage />) },
              { path: 'levels', element: wrap(<LevelsPage />) },
              { path: 'levels/:id', element: wrap(<LevelsPage />) },
              { path: 'levels/:id/:stageId', element: wrap(<LevelsPage />) },
              { path: 'trainings/:id', element: wrap(<TrainingPage />) },
              { path: 'level', element: wrap(<LevelPage />) },
              { path: 'level/:id', element: wrap(<LevelPage />) },
              { path: 'player', element: wrap(<PlayerScreen />) },
              { path: 'player/exit', element: wrap(<ExitConfirm />) },
              { path: 'player/complete', element: wrap(<SessionComplete />) },
              { path: 'player/:trackId', element: wrap(<PlayerScreen />) },
              { path: 'goals', element: wrap(<GoalsPage />) },
              { path: 'notifications', element: wrap(<NotificationsPage />) },
              { path: 'subscription', element: wrap(<SubscriptionPage />) },
              { path: 'faq', element: wrap(<FaqPage />) },
              { path: 'health-lab', element: wrap(<HealthLabPage />) },
              { path: 'progress', element: wrap(<ProgressPage />) },
              { path: 'training-levels', element: wrap(<TrainingLevelsIndex />) },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])