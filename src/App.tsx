import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { AUTHOR_SELF } from './authors'
import { AdminSheet } from './components/AdminSheet'
import { AuthorProfileSheet } from './components/AuthorProfileSheet'
import { PostComposer, type PublishPayload } from './components/PostComposer'
import { ProfileSheet } from './components/ProfileSheet'
import { mergeFeedItems } from './feedMerge'
import { gradientById } from './gradients'
import { initTelegramWebApp, isDeveloper } from './telegramInit'
import { FEED_ITEMS, NEWS_ITEMS, AFFICHE_ITEMS, type FeedItem } from './mockData'
import { clearUserPosts, loadUserPosts, saveUserPosts } from './postsStorage'
import type { InterestId, MainTab, OnboardingStep, UserProfile } from './types'

const STORAGE_KEY = 'vrn_profile_v1'
const DEV_PASSWORD = 'vrn2024'

const INTERESTS: { id: InterestId; label: string; hint: string }[] = [
  { id: 'affiche', label: 'Афиши', hint: 'События и мероприятия' },
  { id: 'news', label: 'Новости', hint: 'Город и регион' },
  { id: 'work', label: 'Работа', hint: 'Вакансии и подборки' },
]

function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as UserProfile & { avatarDataUrl?: unknown; bio?: unknown }
    if (
      typeof p?.id === 'string' &&
      typeof p?.name === 'string' &&
      Array.isArray(p.interests) &&
      p.name.trim().length > 0 &&
      p.interests.length > 0
    ) {
      return {
        id: p.id,
        name: p.name.trim(),
        username: p.username,
        telegramId: p.telegramId,
        interests: p.interests,
        avatarDataUrl: typeof p.avatarDataUrl === 'string' ? p.avatarDataUrl : undefined,
        bio: typeof p.bio === 'string' ? p.bio : undefined,
        isChokoboy: typeof p.isChokoboy === 'boolean' ? p.isChokoboy : undefined,
        isDeveloper: typeof p.isDeveloper === 'boolean' ? p.isDeveloper : undefined,
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

function saveProfile(p: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

function initialFromStorage(): {
  step: OnboardingStep
  profile: UserProfile | null
} {
  const saved = loadProfile()
  if (saved) return { step: 'main', profile: saved }
  return { step: 'welcome', profile: null }
}

function loadGlobalNews(): { title: string; content: string } | null {
  try {
    const raw = localStorage.getItem('vrn_global_news')
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.title && data.content) {
      return data
    }
  } catch { /* ignore */ }
  return null
}

export default function App() {
  const [step, setStep] = useState<OnboardingStep>(
    () => initialFromStorage().step,
  )
  const [name, setName] = useState('')
  const [picked, setPicked] = useState<Set<InterestId>>(new Set())
  const [profile, setProfile] = useState<UserProfile | null>(
    () => initialFromStorage().profile,
  )
  const [tgUser, setTgUser] = useState<{id: number; first_name: string; username?: string} | null>(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [mainTab, setMainTab] = useState<MainTab>('feed')
  const [userPosts, setUserPosts] = useState<FeedItem[]>(() => loadUserPosts())
  const [profileOpen, setProfileOpen] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerKey, setComposerKey] = useState(0)
  const [viewAuthorId, setViewAuthorId] = useState<string | null>(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [globalNews, setGlobalNews] = useState<{title: string; content: string} | null>(() => loadGlobalNews())
  const [globalDismissed, setGlobalDismissed] = useState(false)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 })

  const tabs = [
    { id: 'feed' as const, label: 'Лента' },
    { id: 'news' as const, label: 'Новости' },
    { id: 'affiche' as const, label: 'Афиша' },
  ]

  useEffect(() => {
    const user = initTelegramWebApp()
    if (user) {
      setTgUser(user)
    }
  }, [])

  useEffect(() => {
    const currentTab = tabRefs.current.get(mainTab)
    if (currentTab) {
      setSliderStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
      })
    }
  }, [mainTab])

  const handleLogin = useCallback(() => {
    if (!password.trim()) {
      setLoginError('Введите пароль')
      return
    }
    if (password !== DEV_PASSWORD) {
      setLoginError('Неверный пароль')
      return
    }
    const isDev = tgUser ? isDeveloper(tgUser.username) : false
    const newProfile: UserProfile = {
      id: tgUser ? `tg-${tgUser.id}` : `local-${Date.now()}`,
      name: tgUser?.first_name || 'Пользователь',
      username: tgUser?.username,
      telegramId: tgUser?.id,
      interests: ['news'],
      isChokoboy: isDev,
      isDeveloper: isDev,
    }
    saveProfile(newProfile)
    setProfile(newProfile)
    setStep('main')
    setPassword('')
    setLoginError('')
  }, [password, tgUser])

  const toggleInterest = useCallback((id: InterestId) => {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const finishOnboarding = useCallback(() => {
    const interests = [...picked]
    if (!name.trim() || interests.length === 0) return
    const isDev = tgUser ? isDeveloper(tgUser.username) : false
    const p: UserProfile = { 
      id: profile?.id || `tg-${tgUser?.id || Date.now()}`,
      name: name.trim(), 
      username: tgUser?.username,
      telegramId: tgUser?.id,
      interests,
      isChokoboy: isDev,
      isDeveloper: isDev,
    }
    saveProfile(p)
    setProfile(p)
    setStep('main')
    setMainTab('feed')
  }, [name, picked, profile, tgUser])

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    clearUserPosts()
    setUserPosts([])
    setProfile(null)
    setName('')
    setPicked(new Set())
    setStep('welcome')
    setMainTab('feed')
    setProfileOpen(false)
    setComposerOpen(false)
    setComposerKey(0)
    setViewAuthorId(null)
  }, [])

  const updateProfile = useCallback((next: UserProfile) => {
    saveProfile(next)
    setProfile(next)
  }, [])

  const publishPost = useCallback(
    (payload: PublishPayload) => {
      if (!profile) return
      const item: FeedItem = {
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author: profile.name,
        authorId: AUTHOR_SELF,
        title: payload.title,
        excerpt: payload.excerpt,
        gradient: gradientById(payload.gradientId),
        imageDataUrl: payload.imageDataUrl,
        headerStyle: payload.headerStyle,
        tags: payload.tags,
        createdAt: Date.now(),
        isUserPost: true,
        authorIsChokoboy: profile.isChokoboy,
        authorIsDeveloper: profile.isDeveloper,
      }
      setUserPosts((prev) => {
        const next = [item, ...prev]
        saveUserPosts(next)
        return next
      })
    },
    [profile],
  )

  const deleteUserPost = useCallback((id: string) => {
    setUserPosts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      saveUserPosts(next)
      return next
    })
  }, [])

  const handleDeletePostFromAdmin = useCallback((id: string) => {
    setUserPosts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      saveUserPosts(next)
      return next
    })
  }, [])

  const handleCreateGlobalNews = useCallback((title: string, content: string) => {
    setGlobalNews({ title, content })
    localStorage.setItem('vrn_global_news', JSON.stringify({ title, content }))
  }, [])

  const feedItems = useMemo(() => {
    if (!profile) return FEED_ITEMS
    const interests = new Set(profile.interests)
    return mergeFeedItems(FEED_ITEMS, userPosts, interests)
  }, [profile, userPosts])

  const avatarLetter = profile?.name?.trim().slice(0, 1).toUpperCase() ?? '?'

  const showGlobalNews = globalNews && !globalDismissed

  return (
    <div className="vrn-app">
      {showGlobalNews && (
        <motion.div
          className="vrn-global-banner"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <h3 className="vrn-global-banner-title">{globalNews.title}</h3>
          <p className="vrn-global-banner-content">{globalNews.content}</p>
          <button
            type="button"
            className="vrn-global-banner-btn"
            onClick={() => setGlobalDismissed(true)}
          >
            Понятно
          </button>
        </motion.div>
      )}
      <header className="vrn-brand">
        <span className="vrn-logo">vrn</span>
        {step === 'main' && profile && (
          <div className="vrn-brand-right">
            <span className="vrn-greet">Привет, {profile.name}</span>
            {profile.isChokoboy && (
              <button
                type="button"
                className="vrn-admin-btn"
                onClick={() => setAdminOpen(true)}
                aria-label="Админ-панель"
                title="Админ-панель"
              >
                ⚙️
              </button>
            )}
            <button
              type="button"
              className="vrn-header-avatar"
              onClick={() => setProfileOpen(true)}
              aria-label="Открыть профиль"
            >
              {profile.avatarDataUrl ? (
                <img src={profile.avatarDataUrl} alt="" className="vrn-header-avatar-img" />
              ) : (
                <span className="vrn-header-avatar-ph">{avatarLetter}</span>
              )}
            </button>
          </div>
        )}
      </header>

      {step === 'welcome' && (
        <motion.section
          className="vrn-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        >
          <p className="vrn-kicker">Добро пожаловать</p>
          <h1 className="vrn-title">VRN - Воронеж</h1>
          <p className="vrn-lead">
            Лента новостей, события и всё о Воронеже в одном месте.
          </p>
          <ul className="vrn-bullets">
            <li>Новости города</li>
            <li>Афиша событий</li>
            <li>Посты от жителей</li>
          </ul>
          <button
            type="button"
            className="vrn-btn vrn-btn-primary"
            onClick={() => setStep('login')}
          >
            Войти
          </button>
        </motion.section>
      )}

      {step === 'login' && (
        <motion.section
          className="vrn-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        >
          <p className="vrn-kicker">Вход</p>
          <h2 className="vrn-title">Введите пароль</h2>
          <p className="vrn-lead">
            Получить пароль можно у @pornochocoboy
          </p>
          {tgUser && (
            <p className="vrn-lead" style={{ fontSize: '0.8rem', color: 'var(--vrn-text-soft)' }}>
              Вход через Telegram: {tgUser.username ? `@${tgUser.username}` : tgUser.first_name}
            </p>
          )}
          <label className="vrn-label" htmlFor="vrn-password">
            Пароль
          </label>
          <input
            id="vrn-password"
            className="vrn-input"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {loginError && <p className="vrn-login-error">{loginError}</p>}
          <div className="vrn-row">
            <button
              type="button"
              className="vrn-btn vrn-btn-ghost"
              onClick={() => setStep('welcome')}
            >
              Назад
            </button>
            <button
              type="button"
              className="vrn-btn vrn-btn-primary"
              onClick={handleLogin}
            >
              Войти
            </button>
          </div>
        </motion.section>
      )}

      {step === 'name' && (
        <motion.section
          className="vrn-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        >
          <p className="vrn-step">Шаг 1 из 2</p>
          <h2 className="vrn-title">Как вас называть?</h2>
          <p className="vrn-lead">Имя будет в приветствии на главном экране.</p>
          <label className="vrn-label" htmlFor="vrn-name">
            Ваше имя
          </label>
          <input
            id="vrn-name"
            className="vrn-input"
            type="text"
            autoComplete="given-name"
            placeholder="Например, Алексей"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
          />
          <div className="vrn-row">
            <button
              type="button"
              className="vrn-btn vrn-btn-ghost"
              onClick={() => setStep('welcome')}
            >
              Назад
            </button>
            <button
              type="button"
              className="vrn-btn vrn-btn-primary"
              disabled={!name.trim()}
              onClick={() => setStep('interests')}
            >
              Далее
            </button>
          </div>
        </motion.section>
      )}

      {step === 'interests' && (
        <motion.section
          className="vrn-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        >
          <p className="vrn-step">Шаг 2 из 2</p>
          <h2 className="vrn-title">Что хотите видеть?</h2>
          <p className="vrn-lead">Можно выбрать несколько вариантов.</p>
          <div className="vrn-chips">
            {INTERESTS.map((it) => {
              const active = picked.has(it.id)
              return (
                <button
                  key={it.id}
                  type="button"
                  className={`vrn-chip ${active ? 'vrn-chip-active' : ''}`}
                  onClick={() => toggleInterest(it.id)}
                >
                  <span className="vrn-chip-label">{it.label}</span>
                  <span className="vrn-chip-hint">{it.hint}</span>
                </button>
              )
            })}
          </div>
          <div className="vrn-row">
            <button
              type="button"
              className="vrn-btn vrn-btn-ghost"
              onClick={() => setStep('name')}
            >
              Назад
            </button>
            <button
              type="button"
              className="vrn-btn vrn-btn-primary"
              disabled={picked.size === 0}
              onClick={finishOnboarding}
            >
              Готово
            </button>
          </div>
        </motion.section>
      )}

      {step === 'main' && profile && (
        <>
            <div className="vrn-tabs-scroll">
            <motion.nav
              className="vrn-tabs"
              aria-label="Разделы"
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            >
              <div className="vrn-tabs-slider" style={{
                left: sliderStyle.left,
                width: sliderStyle.width,
              }} />
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  ref={(el) => { if (el) tabRefs.current.set(t.id, el) }}
                  className={`vrn-tab ${mainTab === t.id ? 'vrn-tab-active' : ''}`}
                  onClick={() => setMainTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </motion.nav>
          </div>

          <AnimatePresence mode="wait">
            <motion.main
              key={mainTab}
              className="vrn-main"
              role="main"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.22 }}
            >
              {mainTab === 'feed' && (
                <div className="vrn-feed" role="feed" aria-label="Лента">
                  {feedItems.length === 0 ? (
                    <p className="vrn-empty">
                      Нет постов по выбранным темам — измените интересы в профиле или
                      добавьте пост.
                    </p>
                  ) : (
                    feedItems.map((item, i) => (
                      <motion.article
                        key={item.id}
                        className={`vrn-card ${item.authorIsDeveloper ? 'vrn-card-developer' : ''}`}
                        layout
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(i * 0.05, 0.35),
                          type: 'spring',
                          damping: 22,
                          stiffness: 320,
                        }}
                      >
                        <div
                          className="vrn-card-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setViewAuthorId(item.authorId)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setViewAuthorId(item.authorId)
                            }
                          }}
                        >
                          {item.imageDataUrl ? (
                            <img src={item.imageDataUrl} alt="" className="vrn-card-visual-img" />
                          ) : (
                            <div
                              className="vrn-card-visual"
                              style={{ background: item.gradient }}
                            />
                          )}
                          <div className="vrn-card-body">
                            <div className="vrn-card-top">
                              <span className="vrn-card-author">{item.author}</span>
                              {(item.authorIsChokoboy || item.authorIsDeveloper) && (
                                <div className="vrn-badges">
                                  {item.authorIsChokoboy && (
                                    <span className="vrn-badge vrn-badge-chokoboy">чокобой</span>
                                  )}
                                  {item.authorIsDeveloper && (
                                    <span className="vrn-badge vrn-badge-developer">разработчик vrn</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <h3 className={`vrn-card-title vrn-card-title-${item.headerStyle || 'default'}`}>{item.title}</h3>
                            <p className="vrn-card-text">{item.excerpt}</p>
                            <p className="vrn-card-hint">Открыть профиль</p>
                          </div>
                        </div>
                        {item.isUserPost && (
                          <button
                            type="button"
                            className="vrn-card-delete"
                            onClick={() => deleteUserPost(item.id)}
                            aria-label="Удалить пост"
                          >
                            ✕
                          </button>
                        )}
                      </motion.article>
                    ))
                  )}
                </div>
              )}

              {mainTab === 'news' && (
                <div className="vrn-list">
                  {NEWS_ITEMS.map((n, i) => (
                    <motion.article
                      key={n.id}
                      className="vrn-news-card"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', damping: 24 }}
                    >
                      <div className="vrn-news-meta">
                        <span>{n.source}</span>
                        <span>{n.time}</span>
                      </div>
                      <h3 className="vrn-news-title">{n.title}</h3>
                      <p className="vrn-news-lead">{n.lead}</p>
                    </motion.article>
                  ))}
                </div>
              )}

              {mainTab === 'affiche' && (
                <div className="vrn-list">
                  {AFFICHE_ITEMS.map((a, i) => (
                    <motion.article
                      key={a.id}
                      className="vrn-aff-card"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', damping: 24 }}
                    >
                      <div className="vrn-aff-date">
                        <span className="vrn-aff-day">{a.date}</span>
                        <span className="vrn-aff-place">{a.place}</span>
                      </div>
                      <h3 className="vrn-aff-title">{a.title}</h3>
                      <p className="vrn-aff-note">{a.note}</p>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.main>
          </AnimatePresence>

          {mainTab === 'feed' && (
            <motion.button
              type="button"
              className="vrn-fab"
              aria-label="Новый пост"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              onClick={() => {
                setComposerKey((k) => k + 1)
                setComposerOpen(true)
              }}
            >
              <span className="vrn-fab-icon" aria-hidden>
                +
              </span>
            </motion.button>
          )}

          <footer className="vrn-footer">
            <button type="button" className="vrn-link-btn" onClick={resetDemo}>
              Сбросить демо (первый вход)
            </button>
          </footer>

          <ProfileSheet
            open={profileOpen}
            profile={profile}
            onClose={() => setProfileOpen(false)}
            onSave={updateProfile}
          />
          <PostComposer
            key={composerKey}
            open={composerOpen}
            authorName={profile.name}
            onClose={() => setComposerOpen(false)}
            onPublish={publishPost}
          />
          <AuthorProfileSheet
            open={viewAuthorId !== null}
            authorId={viewAuthorId}
            selfProfile={profile}
            onClose={() => setViewAuthorId(null)}
            onEditSelf={() => setProfileOpen(true)}
          />
          <AdminSheet
            open={adminOpen}
            allPosts={userPosts}
            onClose={() => setAdminOpen(false)}
            onDeletePost={handleDeletePostFromAdmin}
            onCreateGlobalNews={handleCreateGlobalNews}
          />
        </>
      )}
    </div>
  )
}
