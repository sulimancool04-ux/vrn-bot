import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useId, useRef, useState } from 'react'
import { POST_GRADIENTS, gradientById } from '../gradients'
import { fileToAvatarDataUrl } from '../imageUtils'
import type { HeaderStyle, InterestId } from '../types'

const TAGS: { id: InterestId; label: string }[] = [
  { id: 'affiche', label: 'Афиша' },
  { id: 'news', label: 'Новости' },
  { id: 'work', label: 'Работа' },
]

const HEADER_STYLES: { id: HeaderStyle; label: string; preview: string }[] = [
  { id: 'default', label: 'Обычный', preview: 'Стандартный' },
  { id: 'bold', label: 'Жирный', preview: 'Стандартный' },
  { id: 'elegant', label: 'Элегантный', preview: 'Стандартный' },
  { id: 'modern', label: 'Современный', preview: 'Стандартный' },
]

export type PublishPayload = {
  title: string
  excerpt: string
  tags: InterestId[]
  gradientId: string
  imageDataUrl?: string
  headerStyle?: HeaderStyle
}

type Props = {
  open: boolean
  authorName: string
  onClose: () => void
  onPublish: (payload: PublishPayload) => void
}

export function PostComposer({ open, authorName, onClose, onPublish }: Props) {
  const titleId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [picked, setPicked] = useState<Set<InterestId>>(() => new Set(['news']))
  const [gradientId, setGradientId] = useState(POST_GRADIENTS[0].id)
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined)
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>('default')
  const [coverType, setCoverType] = useState<'gradient' | 'image'>('gradient')

  const toggle = useCallback((id: InterestId) => {
    setPicked((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }, [])

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await fileToAvatarDataUrl(file, 800, 0.85)
      setImageDataUrl(dataUrl)
    } catch (err) {
      console.error('Image load failed:', err)
    }
  }, [])

  const removeImage = useCallback(() => {
    setImageDataUrl(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const submit = useCallback(() => {
    const tags = [...picked]
    if (!title.trim() || !excerpt.trim() || tags.length === 0) return
    onPublish({
      title: title.trim(),
      excerpt: excerpt.trim(),
      tags,
      gradientId,
      imageDataUrl: coverType === 'image' ? imageDataUrl : undefined,
      headerStyle: headerStyle !== 'default' ? headerStyle : undefined,
    })
    onClose()
  }, [excerpt, gradientId, onClose, onPublish, picked, title, imageDataUrl, headerStyle, coverType])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            key="post-backdrop"
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
            key="post-sheet"
            className="vrn-sheet vrn-sheet-tall"
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
              Новый пост
            </h2>
            <p className="vrn-composer-author">от {authorName}</p>

            <label className="vrn-label" htmlFor="post-title">
              Заголовок
            </label>
            <input
              id="post-title"
              className="vrn-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="О чём пост?"
              maxLength={120}
            />

            <label className="vrn-label" htmlFor="post-body">
              Текст
            </label>
            <textarea
              id="post-body"
              className="vrn-textarea"
              rows={4}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Расскажите подробнее — это увидят в ленте."
              maxLength={600}
            />

            <p className="vrn-label">Темы (для фильтра ленты)</p>
            <div className="vrn-tag-row">
              {TAGS.map((t) => {
                const active = picked.has(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`vrn-mini-tag ${active ? 'vrn-mini-tag-on' : ''}`}
                    onClick={() => toggle(t.id)}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            <p className="vrn-label">Обложка</p>
            <div className="vrn-cover-tabs">
              <button
                type="button"
                className={`vrn-cover-tab ${coverType === 'gradient' ? 'vrn-cover-tab-on' : ''}`}
                onClick={() => setCoverType('gradient')}
              >
                Градиент
              </button>
              <button
                type="button"
                className={`vrn-cover-tab ${coverType === 'image' ? 'vrn-cover-tab-on' : ''}`}
                onClick={() => setCoverType('image')}
              >
                Фото
              </button>
            </div>

            {coverType === 'gradient' && (
              <>
                <div className="vrn-gradient-pick">
                  {POST_GRADIENTS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`vrn-gradient-swatch ${gradientId === g.id ? 'vrn-gradient-swatch-on' : ''}`}
                      style={{ background: g.css }}
                      title={g.label}
                      onClick={() => setGradientId(g.id)}
                    />
                  ))}
                </div>
                <div
                  className="vrn-preview-strip"
                  style={{ background: gradientById(gradientId) }}
                />
              </>
            )}

            {coverType === 'image' && (
              <div className="vrn-image-upload">
                {imageDataUrl ? (
                  <div className="vrn-image-preview">
                    <img src={imageDataUrl} alt="Обложка" className="vrn-image-preview-img" />
                    <button
                      type="button"
                      className="vrn-image-remove"
                      onClick={removeImage}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="vrn-image-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="vrn-image-btn-icon">📷</span>
                    <span className="vrn-image-btn-text">Загрузить фото</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="vrn-sr-only"
                  onChange={handleImageSelect}
                />
              </div>
            )}

            <p className="vrn-label">Стиль заголовка</p>
            <div className="vrn-header-style-pick">
              {HEADER_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`vrn-header-style-btn ${headerStyle === s.id ? 'vrn-header-style-btn-on' : ''}`}
                  onClick={() => setHeaderStyle(s.id)}
                  style={{
                    fontFamily: s.id === 'bold' ? 'inherit' : s.id === 'elegant' ? 'Georgia, serif' : s.id === 'modern' ? '"SF Pro Display", system-ui, sans-serif' : 'inherit',
                    fontWeight: s.id === 'bold' ? '800' : '700',
                    fontStyle: s.id === 'elegant' ? 'italic' : 'normal',
                  }}
                >
                  {s.preview}
                </button>
              ))}
            </div>

            <div className="vrn-row">
              <button type="button" className="vrn-btn vrn-btn-ghost" onClick={onClose}>
                Отмена
              </button>
              <button
                type="button"
                className="vrn-btn vrn-btn-primary"
                disabled={!title.trim() || !excerpt.trim() || picked.size === 0}
                onClick={submit}
              >
                Опубликовать
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
