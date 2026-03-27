import { AnimatePresence, motion } from 'framer-motion'
import { useId, useMemo } from 'react'
import { resolveAuthorView, type ResolvedAuthorView } from '../authors'
import type { UserProfile } from '../types'

type Props = {
  open: boolean
  authorId: string | null
  selfProfile: UserProfile
  onClose: () => void
  /** Только для своего профиля */
  onEditSelf?: () => void
}

export function AuthorProfileSheet({
  open,
  authorId,
  selfProfile,
  onClose,
  onEditSelf,
}: Props) {
  const titleId = useId()
  const data: ResolvedAuthorView | null = useMemo(() => {
    if (!authorId) return null
    return resolveAuthorView(authorId, selfProfile)
  }, [authorId, selfProfile])

  const letter = data?.name?.trim().slice(0, 1).toUpperCase() ?? '?'

  return (
    <AnimatePresence>
      {open && data && (
        <>
          <motion.button
            key="author-backdrop"
            type="button"
            className="vrn-overlay"
            aria-label="Закрыть"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="author-sheet"
            className="vrn-sheet vrn-sheet-author"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ y: '100%', opacity: 0.98 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="vrn-sheet-handle" aria-hidden />
            <h2 id={titleId} className="vrn-sheet-title">
              Профиль
            </h2>

            <div className="vrn-author-hero">
              <div
                className="vrn-author-avatar-xl"
                style={{
                  background: data.avatarDataUrl ? undefined : data.avatarGradient,
                }}
              >
                {data.avatarDataUrl ? (
                  <img src={data.avatarDataUrl} alt="" className="vrn-author-avatar-xl-img" />
                ) : (
                  <span className="vrn-author-avatar-xl-ph">{letter}</span>
                )}
              </div>
              <p className="vrn-author-name">{data.name}</p>
              {data.bio && <p className="vrn-author-bio">{data.bio}</p>}
            </div>

            {data.interests.length > 0 && (
              <div className="vrn-author-tags">
                <p className="vrn-label">В ленту</p>
                <div className="vrn-author-tag-row">
                  {data.interests.map((t) => (
                    <span key={t.id} className="vrn-author-pill">
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="vrn-row">
              {data.isSelf && onEditSelf ? (
                <>
                  <button type="button" className="vrn-btn vrn-btn-ghost" onClick={onClose}>
                    Закрыть
                  </button>
                  <button
                    type="button"
                    className="vrn-btn vrn-btn-primary"
                    onClick={() => {
                      onClose()
                      onEditSelf()
                    }}
                  >
                    Редактировать
                  </button>
                </>
              ) : (
                <button type="button" className="vrn-btn vrn-btn-primary" onClick={onClose}>
                  Закрыть
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
