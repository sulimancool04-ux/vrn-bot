import type { FeedItem } from './mockData'
import type { InterestId } from './types'

export function mergeFeedItems(
  mock: FeedItem[],
  userPosts: FeedItem[],
  interests: Set<InterestId>,
): FeedItem[] {
  const pick = (items: FeedItem[]) =>
    items.filter((item) => item.tags.some((t) => interests.has(t)))
  const merged = [...pick(mock), ...pick(userPosts)]
  merged.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
  return merged
}
