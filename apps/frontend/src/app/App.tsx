import { useEffect } from 'react'
import { RouterProvider, Outlet, createBrowserRouter } from 'react-router-dom';
import { router } from './router'
import { FooterTabProvider } from './footer-tab'
import { initTelegram } from '../shared/telegram/init'
import "../shared/styles/main.scss"
function AppLayout() {
  return (
    <FooterTabProvider>
      <Outlet />
    </FooterTabProvider>
  )
}

export default function App() {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      initTelegram()
    }
  }, [])

  return <RouterProvider router={routerWithLayout} />
}
console.log('initData:', (window as any)?.Telegram?.WebApp?.initData);
console.log('tgUser:', (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user);
const routerWithLayout = createBrowserRouter([
  {
    element: <AppLayout />,
    children: router.routes[0].children!,
  },
])