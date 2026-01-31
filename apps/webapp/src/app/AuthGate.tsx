import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useRef } from 'react'
import { useAppSelector } from './store'
import { useLazyCheckPinQuery, useLazyCheckTgQuery } from '../shared/api/auth.api'
import { useAppNavigate } from '../shared/lib/hooks/useAppNavigate'

export default function AuthGate() {
  const navigate = useAppNavigate()
  const { pathname } = useLocation()
  const token = useAppSelector(s => s.session.token)

  const tgUser = useMemo(() => {
    const u = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user
    return u ? { id: Number(u.id), username: u.username } : null
  }, [])

  const isPinRoute = pathname.startsWith('/pin/')
  const didRun = useRef(false)

  const [checkTg] = useLazyCheckTgQuery()
  const [checkPin] = useLazyCheckPinQuery()

  useEffect(() => {
    if (token) return
    if (isPinRoute) return
    if (didRun.current) return
    didRun.current = true

    if (!tgUser?.id) {
      navigate('/pin/login', { replace: true })
      return
    }

    checkTg(tgUser.id, true)
      .unwrap()
      .then(async (res: any) => {
        const exists = typeof res === 'boolean' ? res : !!(res?.exists ?? res?.data)
        if (!exists) {
          navigate('/pin/create', { replace: true })
          return
        }

        const pinRes: any = await checkPin(tgUser.id, true).unwrap()
        const hasPin = typeof pinRes === 'boolean' ? pinRes : !!(pinRes?.hasPin ?? pinRes?.data)

        navigate(hasPin ? '/pin/login' : '/pin/change', { replace: true })
      })
      .catch(() => navigate('/pin/login', { replace: true }))
  }, [token, isPinRoute, tgUser?.id, checkTg, checkPin, navigate])

  return <Outlet />
}