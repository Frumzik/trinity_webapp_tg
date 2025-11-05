import { sessionActions } from '../../entities/session/model/session.slice'

type Store = { dispatch: (a: any) => void }

export function bootstrapDevAuth(store: Store, hardcodedToken?: string) {
  const url = new URL(window.location.href)
  const qToken = url.searchParams.get('token')
  const qTgId = url.searchParams.get('tgId')
  const qUsername = url.searchParams.get('username') || 'dev'
  const qName = url.searchParams.get('name') || 'Dev'
  const clear = url.searchParams.get('clear')

  if (clear) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('dev_tg_user')
  }

  const token = qToken || hardcodedToken || null
  if (token) {
    localStorage.setItem('access_token', token)
    store.dispatch(sessionActions.setToken(token))
  }

  if (qTgId) {
    const u = { id: Number(qTgId), username: qUsername, name: qName }
    localStorage.setItem('dev_tg_user', JSON.stringify(u))
  }

  const saved = localStorage.getItem('dev_tg_user')
  if (!saved) return

  const u = JSON.parse(saved)
  const w: any = window as any
  w.Telegram = w.Telegram || {}
  w.Telegram.WebApp = w.Telegram.WebApp || {}
  const wa = w.Telegram.WebApp

  // initData — только getter у SDK. Не трогаем его.
  // Гарантируем, что есть объект initDataUnsafe и кладём туда user.
  if (!wa.initDataUnsafe || typeof wa.initDataUnsafe !== 'object') {
    Object.defineProperty(wa, 'initDataUnsafe', { value: {}, configurable: true })
  }
  try {
    wa.initDataUnsafe.user = u
  } catch {
    // если свойство read-only — переопределим его через defineProperty
    Object.defineProperty(wa.initDataUnsafe, 'user', { value: u, configurable: true, writable: true })
  }

  if (!wa.colorScheme) {
    try {
      Object.defineProperty(wa, 'colorScheme', { value: 'light', configurable: true })
    } catch {
      /* ignore */
    }
  }
}