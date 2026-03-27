import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { fileToAvatarDataUrl } from '../imageUtils'
import type { InterestId, UserProfile } from '../types'

const INTERESTS: { id: InterestId; label: string; hint: string }[] = [
  { id: 'affiche', label: 'Афиши', hint: 'События и мероприятия' },
  { id: 'news', label: 'Новости', hint: 'Город и регион' },
  { id: 'work', label: 'Работа', hint: 'Вакансии и подборки' },
]

type Props = {
  open: boolean
  profile: UserProfile
  onClose: () => void
  onSave: (next: UserProfile) => void
}

export function ProfileSheet({ open, profile, onClose, onSave }: Props) {
  const titleId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatar, setAvatar] = useState<string | null>(profile.avatarDataUrl ?? null)
  const [picked, setPicked] = useState<Set<InterestId>>(() => new Set(profile.interests))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(profile.name)
    setBio(profile.bio ?? '')
    setAvatar(profile.avatarDataUrl ?? null)
    setPicked(new Set(profile.interests))
  }, [open, profile])

  const toggle = useCallback((id: InterestId) => {
    setPicked((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }, [])

  const onPickFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !f.type.startsWith('image/')) return
    setBusy(true)
    try {
      const dataUrl = await fileToAvatarDataUrl(f)
      setAvatar(dataUrl)
    } catch {
      /* ignore */
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }, [])

  const handleSave = useCallback(() => {
    const interests = [...picked]
    if (!name.trim() || interests.length === 0) return
    onSave({
      id: profile.id,
      name: name.trim(),
      username: profile.username,
      telegramId: profile.telegramId,
      interests,
      avatarDataUrl: avatar,
      bio: bio.trim() || undefined,
      isChokoboy: profile.isChokoboy,
      isDeveloper: profile.isDeveloper,
    })
    onClose()
  }, [avatar, bio, name, onClose, onSave, picked, profile])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            key="profile-backdrop"
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
            key="profile-sheet"
            className="vrn-sheet"
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

            <div className="vrn-avatar-block">
              <button
                type="button"
                className="vrn-avatar-btn"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
              >
                {avatar ? (
                  <img src={avatar} alt="" className="vrn-avatar-img" />
                ) : (
                  <span className="vrn-avatar-placeholder" aria-hidden>
                    {name.trim().slice(0, 1).toUpperCase() || '?'}
                  </span>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="vrn-sr-only"
                onChange={onPickFile}
              />
              <div className="vrn-avatar-actions">
                <button type="button" className="vrn-text-btn" onClick={() => fileRef.current?.click()}>
                  {avatar ? 'Сменить фото' : 'Загрузить фото'}
                </button>
                {avatar && (
                  <button type="button" className="vrn-text-btn vrn-text-danger" onClick={() => setAvatar(null)}>
                    Убрать
                  </button>
                )}
              </div>
            </div>

            <label className="vrn-label" htmlFor="profile-name">
              Имя
            </label>
            <input
              id="profile-name"
              className="vrn-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={64}
              autoComplete="name"
            />

            <label className="vrn-label" htmlFor="profile-bio">
              О себе
            </label>
            <textarea
              id="profile-bio"
              className="vrn-textarea"
              rows={3}
              placeholder="Например: люблю концерты и кофе в центре"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
            />

            <p className="vrn-label" style={{ marginTop: '0.25rem' }}>
              Интересы в ленте
            </p>
            <div className="vrn-chips">
              {INTERESTS.map((it) => {
                const active = picked.has(it.id)
                return (
                  <button
                    key={it.id}
                    type="button"
                    className={`vrn-chip ${active ? 'vrn-chip-active' : ''}`}
                    onClick={() => toggle(it.id)}
                  >
                    <span className="vrn-chip-label">{it.label}</span>
                    <span className="vrn-chip-hint">{it.hint}</span>
                  </button>
                )
              })}
            </div>

            <div className="vrn-settings-section">
              <p className="vrn-label">Настройки</p>
              <div className="vrn-settings-row">
                <span>Тёмная тема</span>
                <button
                  type="button"
                  className="vrn-toggle"
                  onClick={() => {
                    document.documentElement.classList.toggle('dark')
                    localStorage.setItem('vrn_dark_theme', document.documentElement.classList.contains('dark').toString())
                  }}
                >
                  <span className="vrn-toggle-knob" />
                </button>
              </div>
            </div>

            <div className="vrn-row">
              <button type="button" className="vrn-btn vrn-btn-ghost" onClick={onClose}>
                Отмена
              </button>
              <button
                type="button"
                className="vrn-btn vrn-btn-primary"
                disabled={!name.trim() || picked.size === 0}
                onClick={handleSave}
              >
                Сохранить
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
