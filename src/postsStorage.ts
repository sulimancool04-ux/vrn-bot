import { AUTHOR_SELF } from './authors'
import type { FeedItem } from './mockData'

const POSTS_KEY = 'vrn_user_posts_v1'

/** Старые записи без authorId */
type StoredFeedItem = Omit<FeedItem, 'authorId'> & { authorId?: string }

export function loadUserPosts(): FeedItem[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return []
    return arr.filter(isStoredPost).map(normalizePost)
  } catch {
    return []
  }
}

function isStoredPost(x: unknown): x is StoredFeedItem {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (
    typeof o.id !== 'string' ||
    typeof o.author !== 'string' ||
    typeof o.title !== 'string' ||
    typeof o.excerpt !== 'string' ||
    typeof o.gradient !== 'string' ||
    !Array.isArray(o.tags)
  ) {
    return false
  }
  if (o.authorId !== undefined && typeof o.authorId !== 'string') return false
  if (o.createdAt !== undefined && typeof o.createdAt !== 'number') return false
  if (o.isUserPost !== undefined && typeof o.isUserPost !== 'boolean') return false
  return true
}

function normalizePost(p: StoredFeedItem): FeedItem {
  if (typeof p.authorId === 'string') return p as FeedItem
  return { ...p, authorId: AUTHOR_SELF }
}

export function saveUserPosts(posts: FeedItem[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

export function clearUserPosts() {
  localStorage.removeItem(POSTS_KEY)
}
