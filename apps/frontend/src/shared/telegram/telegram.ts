export type TelegramUser = {
  id: number
  username?: string
  first_name?: string
  last_name?: string
  photo_url?: string
}

export function getTelegramUser(): TelegramUser | null {
  const w = window as any
  const u = w?.Telegram?.WebApp?.initDataUnsafe?.user
  return u ?? null
}