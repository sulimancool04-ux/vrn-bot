export type InterestId = 'affiche' | 'news' | 'work'

export type MainTab = 'feed' | 'news' | 'affiche'

export type HeaderStyle = 'default' | 'bold' | 'elegant' | 'modern'

export interface UserProfile {
  id: string
  name: string
  username?: string
  telegramId?: number
  interests: InterestId[]
  avatarDataUrl?: string | null
  bio?: string
  isChokoboy?: boolean
  isDeveloper?: boolean
}

export type OnboardingStep = 'welcome' | 'login' | 'name' | 'interests' | 'main'
