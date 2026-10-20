import { useCallback, useEffect, useRef, useState } from 'react'
import AmbientScene from './components/AmbientScene'
import Dashboard from './components/Dashboard'
import GameShell from './components/GameShell'
import PlayersDrawer from './components/PlayersDrawer'
import { getGame } from './data/games'
import { loadPlayers, savePlayers } from './lib/players'
import { sfx } from './lib/sfx'
import { usePwa } from './hooks/usePwa'
import { useI18n } from './i18n'

function parseRoute() {
  const raw = (window.location.hash || '').replace(/^#/, '') || '/'
  const match = raw.match(/^\/game\/([a-z0-9-]+)/i)
  if (match) {
    const game = getGame(match[1])
    if (game) return { name: 'game', gameId: game.id }
  }
  return { name: 'home' }
}

export default function App() {
  const { t, sampleNames } = useI18n()
  const [players, setPlayers] = useState(() => loadPlayers(sampleNames))
  const [muted, setMuted] = useState(() => sfx.muted)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [route, setRoute] = useState(parseRoute)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const previousOnline = useRef(null)
  const pwa = usePwa()

  const showToast = useCallback((message) => {
    setToast({ message, id: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3400)
  }, [])

  useEffect(() => {
    savePlayers(players)
  }, [players])

  useEffect(() => {
    sfx.setMuted(muted)
  }, [muted])

  useEffect(() => {
    const onHashChange = () => {
      const next = parseRoute()
      setRoute(next)
      if (next.name === 'game') {
        setDrawerOpen(false)
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
      }
    }
    window.addEventListener('hashchange', onHashChange)
    if (parseRoute().name === 'game') window.scrollTo(0, 0)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (previousOnline.current === null) {
      previousOnline.current = pwa.online
      return
    }
    if (previousOnline.current !== pwa.online) {
      previousOnline.current = pwa.online
      showToast(pwa.online ? t('home.toastOnline') : t('home.toastOffline'))
    }
  }, [pwa.online, showToast, t])

  useEffect(
    () => () => {
      clearTimeout(toastTimer.current)
    },
    [],
  )

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    sfx.setMuted(next)
    if (!next) sfx.click()
    showToast(next ? t('home.toastSoundOff') : t('home.toastSoundOn'))
  }

  const handleInstall = async () => {
    try {
      const installed = await pwa.install()
      if (installed) showToast(t('home.toastInstallOk'))
    } catch {
      showToast(t('home.toastInstallFail'))
    }
  }

  const game = route.name === 'game' ? getGame(route.gameId) : null

  return (
    <>
      <div className="site-backdrop" aria-hidden="true" />
      <AmbientScene />
      <div className="app">
        {game ? (
        <GameShell
          game={game}
          players={players}
          onOpenPlayers={() => setDrawerOpen(true)}
          muted={muted}
          onToggleMute={toggleMute}
          showToast={showToast}
        />
      ) : (
        <Dashboard
          players={players}
          onOpenPlayers={() => setDrawerOpen(true)}
          muted={muted}
          onToggleMute={toggleMute}
          onInstall={handleInstall}
          pwa={pwa}
          showToast={showToast}
        />
      )}

      <PlayersDrawer
        open={drawerOpen}
        players={players}
        onClose={() => setDrawerOpen(false)}
        onChange={setPlayers}
        showToast={showToast}
      />

      <div className="toast-layer" aria-live="polite" aria-atomic="true">
        {toast && (
          <div className="toast" key={toast.id} role="status">
            <span className="toast-dot" aria-hidden="true" />
            {toast.message}
          </div>
        )}
        </div>
      </div>
    </>
  )
}
