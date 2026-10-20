import { useEffect, useState } from 'react'

export function usePwa() {
  const [installEvent, setInstallEvent] = useState(null)
  const [standalone, setStandalone] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  })
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent || ''
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

    const onPrompt = (event) => {
      event.preventDefault()
      setInstallEvent(event)
    }
    const onInstalled = () => {
      setStandalone(true)
      setInstallEvent(null)
    }
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const install = async () => {
    if (!installEvent) return false
    installEvent.prompt()
    const choice = await installEvent.userChoice.catch(() => ({ outcome: 'dismissed' }))
    if (choice.outcome === 'accepted') {
      setInstallEvent(null)
      return true
    }
    return false
  }

  return {
    canPrompt: Boolean(installEvent),
    canInstall: Boolean(installEvent) || isIOS,
    isIOS,
    standalone,
    online,
    install,
  }
}
