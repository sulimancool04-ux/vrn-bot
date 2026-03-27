import type { HeaderStyle, InterestId } from './types'

export interface FeedItem {
  id: string
  author: string
  authorId: string
  title: string
  excerpt: string
  gradient: string
  imageDataUrl?: string
  headerStyle?: HeaderStyle
  tags: InterestId[]
  createdAt?: number
  isUserPost?: boolean
  authorIsChokoboy?: boolean
  authorIsDeveloper?: boolean
}

export const FEED_ITEMS: FeedItem[] = []

export const NEWS_ITEMS: { id: string; source: string; time: string; title: string; lead: string }[] = []

export const AFFICHE_ITEMS: { id: string; date: string; place: string; title: string; note: string }[] = []
