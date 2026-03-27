import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initTelegramWebApp } from './telegramInit'

initTelegramWebApp()

const el = document.getElementById('root')
if (!el) {
  throw new Error('Элемент #root не найден')
}

try {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e)
  el.innerHTML = `<div style="font-family:system-ui;padding:1.5rem;max-width:24rem;margin:2rem auto;color:#111"><p><strong>Ошибка запуска</strong></p><p style="font-size:0.9rem">${msg}</p><p style="font-size:0.9rem">Откройте консоль разработчика (F12) для подробностей.</p></div>`
  console.error(e)
}
