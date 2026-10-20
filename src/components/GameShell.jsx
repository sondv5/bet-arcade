import { useEffect, useRef, useState } from 'react'
import { CATEGORIES } from '../data/games'
import { useI18n } from '../i18n'
import { UiIcon } from './icons'
import LanguageMenu from './LanguageMenu'
import ResultModal from './ResultModal'

export default function GameShell({ game, players, onOpenPlayers, muted, onToggleMute, showToast }) {
  const { t, lang } = useI18n()
  const [round, setRound] = useState(0)
  const [result, setResult] = useState(null)
  const [resultOpen, setResultOpen] = useState(false)
  const activePlayers = players.slice(0, game.maxPlayers)
  const signature = `${game.id}|${activePlayers.map((player) => `${player.id}:${player.name}`).join('|')}`
  const signatureRef = useRef(signature)
  const langRef = useRef(lang)
  const category = CATEGORIES.find((item) => item.id === game.category)
  const GameComponent = game.Component
  const gameTitle = t(`games.${game.id}.title`)

  useEffect(() => {
    document.title = `${gameTitle} — BÉT!`
    return () => {
      document.title = t('meta.title')
    }
  }, [game, gameTitle, t, lang])

  useEffect(() => {
    if (signatureRef.current === signature) return
    signatureRef.current = signature
    setResult(null)
    setResultOpen(false)
    setRound((value) => value + 1)
  }, [signature])

  useEffect(() => {
    if (langRef.current === lang) return
    langRef.current = lang
    setResult(null)
    setResultOpen(false)
    setRound((value) => value + 1)
  }, [lang])

  const handleFinish = (nextResult) => {
    setResult(nextResult)
    setResultOpen(true)
  }

  const replay = () => {
    setResult(null)
    setResultOpen(false)
    setRound((value) => value + 1)
  }

  const back = () => {
    window.location.hash = '#/'
  }

  return (
    <div className="game-page">
      <header className="game-topbar">
        <div className="game-topbar-left">
          <button type="button" className="icon-button game-back" onClick={back} aria-label={t('common.backToLobby')}>
            <UiIcon name="back" size={20} />
          </button>
          <div className="game-heading">
            <span className="game-category" style={{ '--cat-color': category?.accent ?? game.accent }}>
              {t(`categories.${category?.id ?? 'pick'}.short`)}
            </span>
            <h1>{gameTitle}</h1>
          </div>
        </div>
        <div className="game-topbar-actions">
          <LanguageMenu />
          <button
            type="button"
            className="roster-button roster-button-compact"
            onClick={onOpenPlayers}
            aria-label={t('common.openRoster', { count: players.length })}
          >
            <UiIcon name="users" size={17} />
            <span className="roster-label">{t('common.players')}</span>
            <span className="roster-count">{players.length}</span>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={onToggleMute}
            aria-label={muted ? t('common.soundOn') : t('common.soundOff')}
            aria-pressed={!muted}
          >
            <UiIcon name={muted ? 'volumeOff' : 'volume'} size={19} />
          </button>
        </div>
      </header>

      <main className="game-main">
        {players.length > game.maxPlayers && (
          <div className="cap-note">
            <span>
              <UiIcon name="users" size={15} />
              {t('game.capNotice', { max: game.maxPlayers, used: activePlayers.length })}
            </span>
            <button type="button" onClick={onOpenPlayers}>
              {t('game.capEdit')}
            </button>
          </div>
        )}

        <div
          className={`stage-frame stage-frame-${game.category}`}
          style={{ '--game-accent': game.accent }}
        >
          <div className="stage-decor" aria-hidden="true">
            <span className="stage-sun" />
            <span className="stage-cloud stage-cloud-1" />
            <span className="stage-cloud stage-cloud-2" />
            <span className="stage-hill stage-hill-1" />
            <span className="stage-hill stage-hill-2" />
            <span className="stage-flower stage-flower-1" />
            <span className="stage-flower stage-flower-2" />
          </div>
          <GameComponent
            key={`${round}-${signature}-${lang}`}
            players={activePlayers}
            onFinish={handleFinish}
          />
        </div>

        {result && !resultOpen && (
          <div className="post-result-bar">
            <span className="post-result-label">
              <UiIcon name="check" size={15} />
              {t('result.ready')}
            </span>
            <button type="button" onClick={() => setResultOpen(true)}>
              {t('result.viewAgain')}
            </button>
            <button type="button" className="post-result-replay" onClick={replay}>
              {t('common.replay')}
            </button>
          </div>
        )}
      </main>

      <ResultModal
        result={resultOpen ? result : null}
        game={game}
        players={activePlayers}
        onClose={() => setResultOpen(false)}
        onReplay={replay}
        onBack={back}
        showToast={showToast}
      />
    </div>
  )
}
