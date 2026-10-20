import { createRoot } from 'react-dom/client'
import '@fontsource/baloo-2/latin-700.css'
import '@fontsource/baloo-2/latin-800.css'
import '@fontsource/baloo-2/vietnamese-700.css'
import '@fontsource/baloo-2/vietnamese-800.css'
import '@fontsource/be-vietnam-pro/latin-400.css'
import '@fontsource/be-vietnam-pro/latin-500.css'
import '@fontsource/be-vietnam-pro/latin-600.css'
import '@fontsource/be-vietnam-pro/latin-700.css'
import '@fontsource/be-vietnam-pro/vietnamese-400.css'
import '@fontsource/be-vietnam-pro/vietnamese-500.css'
import '@fontsource/be-vietnam-pro/vietnamese-600.css'
import '@fontsource/be-vietnam-pro/vietnamese-700.css'
import './styles/base.css'
import './styles/home.css'
import './styles/game.css'
import { I18nProvider } from './i18n'
import App from './App'

const container = document.getElementById('root')
const root = createRoot(container)
let rendered = false

const boot = () => {
  if (rendered) return
  rendered = true
  root.render(
    <I18nProvider>
      <App />
    </I18nProvider>,
  )
}

if (document.fonts?.ready) {
  document.fonts.ready.then(() => requestAnimationFrame(boot)).catch(boot)
  setTimeout(boot, 1400)
} else {
  boot()
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => null)
  })
}
