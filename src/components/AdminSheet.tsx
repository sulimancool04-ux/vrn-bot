import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { FeedItem } from '../mockData'

type Props = {
  open: boolean
  allPosts: FeedItem[]
  onClose: () => void
  onDeletePost: (id: string) => void
  onCreateGlobalNews: (title: string, content: string) => void
}

export function AdminSheet({ open, allPosts, onClose, onDeletePost, onCreateGlobalNews }: Props) {
  const [activeTab, setActiveTab] = useState<'posts' | 'global'>('posts')
  const [globalTitle, setGlobalTitle] = useState('')
  const [globalContent, setGlobalContent] = useState('')

  const handleCreateGlobal = () => {
    if (globalTitle.trim() && globalContent.trim()) {
      onCreateGlobalNews(globalTitle.trim(), globalContent.trim())
      setGlobalTitle('')
      setGlobalContent('')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            key="admin-backdrop"
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
            key="admin-sheet"
            className="vrn-sheet vrn-sheet-tall"
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%', opacity: 0.98 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="vrn-sheet-handle" aria-hidden />
            <h2 className="vrn-sheet-title">Админ-панель</h2>
            <p className="vrn-composer-author">Чокобой</p>

            <div className="vrn-admin-tabs">
              <button
                type="button"
                className={`vrn-admin-tab ${activeTab === 'posts' ? 'vrn-admin-tab-on' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                Посты
              </button>
              <button
                type="button"
                className={`vrn-admin-tab ${activeTab === 'global' ? 'vrn-admin-tab-on' : ''}`}
                onClick={() => setActiveTab('global')}
              >
                Глобальная новость
              </button>
            </div>

            {activeTab === 'posts' && (
              <div className="vrn-admin-posts">
                {allPosts.length === 0 ? (
                  <p className="vrn-empty">Нет постов</p>
                ) : (
                  allPosts.map((post) => (
                    <div key={post.id} className="vrn-admin-post-item">
                      <div className="vrn-admin-post-info">
                        <span className="vrn-admin-post-author">{post.author}</span>
                        <span className="vrn-admin-post-title">{post.title}</span>
                      </div>
                      <button
                        type="button"
                        className="vrn-admin-delete"
                        onClick={() => onDeletePost(post.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'global' && (
              <div className="vrn-admin-global">
                <label className="vrn-label" htmlFor="global-title">
                  Заголовок
                </label>
                <input
                  id="global-title"
                  className="vrn-input"
                  value={globalTitle}
                  onChange={(e) => setGlobalTitle(e.target.value)}
                  placeholder="Важная новость"
                  maxLength={100}
                />

                <label className="vrn-label" htmlFor="global-content">
                  Содержание
                </label>
                <textarea
                  id="global-content"
                  className="vrn-textarea"
                  rows={4}
                  value={globalContent}
                  onChange={(e) => setGlobalContent(e.target.value)}
                  placeholder="Текст новости..."
                  maxLength={500}
                />

                <button
                  type="button"
                  className="vrn-btn vrn-btn-primary"
                  disabled={!globalTitle.trim() || !globalContent.trim()}
                  onClick={handleCreateGlobal}
                >
                  Опубликовать
                </button>
              </div>
            )}

            <div className="vrn-row">
              <button type="button" className="vrn-btn vrn-btn-ghost" onClick={onClose}>
                Закрыть
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
