import type { InterestId, UserProfile } from './types'

/** id автора для постов текущего пользователя */
export const AUTHOR_SELF = 'me'

export type AuthorPublic = {
  id: string
  name: string
  bio: string
  /** Градиент для «заглушки» аватара без фото */
  avatarGradient: string
  interests: InterestId[]
  /** Галочка чокобой */
  isChokoboy?: boolean
  /** Разработчик vrn */
  isDeveloper?: boolean
}

export const MOCK_AUTHORS: Record<string, AuthorPublic> = {
  'author-maria': {
    id: 'author-maria',
    name: 'Мария К.',
    bio: 'Рассказываю про городские события и прогулки по набережной.',
    avatarGradient: 'linear-gradient(145deg, #3d3d3d 0%, #c8c8c8 100%)',
    interests: ['affiche', 'news'],
  },
  'author-vrn': {
    id: 'author-vrn',
    name: 'VRN News',
    bio: 'Коротко о дорогах, транспорте и обновлениях в регионе.',
    avatarGradient: 'linear-gradient(160deg, #0a0a0a 0%, #8a8a8a 100%)',
    interests: ['news'],
  },
  'author-hr': {
    id: 'author-hr',
    name: 'HR Воронеж',
    bio: 'Подборки вакансий и карьерные подсказки.',
    avatarGradient: 'linear-gradient(155deg, #1e1e1e 0%, #b5b5b5 100%)',
    interests: ['work'],
  },
  'author-anton': {
    id: 'author-anton',
    name: 'Антон',
    bio: 'Еда, фестивали и места, куда хочется вернуться.',
    avatarGradient: 'linear-gradient(170deg, #252525 0%, #ececec 100%)',
    interests: ['affiche'],
  },
}

const INTEREST_LABEL: Record<InterestId, string> = {
  affiche: 'Афиша',
  news: 'Новости',
  work: 'Работа',
}

export function interestLabels(ids: InterestId[]): { id: InterestId; label: string }[] {
  return ids.map((id) => ({ id, label: INTEREST_LABEL[id] }))
}

export type ResolvedAuthorView = {
  name: string
  bio?: string
  avatarDataUrl?: string | null
  avatarGradient: string
  interests: { id: InterestId; label: string }[]
  isSelf: boolean
  isChokoboy?: boolean
  isDeveloper?: boolean
}

export function resolveAuthorView(authorId: string, self: UserProfile): ResolvedAuthorView {
  if (authorId === AUTHOR_SELF) {
    return {
      name: self.name,
      bio: self.bio,
      avatarDataUrl: self.avatarDataUrl,
      avatarGradient: 'linear-gradient(145deg, #2a2a2a 0%, #6a6a6a 100%)',
      interests: interestLabels(self.interests),
      isSelf: true,
      isChokoboy: self.isChokoboy,
      isDeveloper: self.isDeveloper,
    }
  }
  const m = MOCK_AUTHORS[authorId]
  if (m) {
    return {
      name: m.name,
      bio: m.bio,
      avatarGradient: m.avatarGradient,
      interests: interestLabels(m.interests),
      isSelf: false,
      isChokoboy: m.isChokoboy,
      isDeveloper: m.isDeveloper,
    }
  }
  return {
    name: 'Пользователь',
    bio: undefined,
    avatarGradient: 'linear-gradient(145deg, #333, #111)',
    interests: [],
    isSelf: false,
    isChokoboy: false,
    isDeveloper: false,
  }
}
