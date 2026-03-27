export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  is_bot?: boolean
  is_premium?: boolean
  language_code?: string
}

export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  disableVerticalSwipes: () => void
  close: () => void
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: TelegramUser
    receiver?: TelegramUser
    chat?: { id: number; type: string }
    chat_instance?: string
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: string
  themeParams: Record<string, string>
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}

let tgUser: TelegramUser | null = null

export function initTelegramWebApp(): TelegramUser | null {
  const tg = window.Telegram?.WebApp
  if (!tg) return null
  try {
    tg.ready()
    tg.expand()
    tg.disableVerticalSwipes()
    tgUser = tg.initDataUnsafe.user ?? null
    return tgUser
  } catch {
    return null
  }
}

export function getTelegramUser(): TelegramUser | null {
  return tgUser
}

export function isDeveloper(username?: string): boolean {
  const devUsernames = ['pornochocoboy', 'pornochokoboy']
  return username ? devUsernames.includes(username.toLowerCase()) : false
}
