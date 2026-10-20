import { useEffect, useRef, useState } from 'react'
import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS, defaultPlayers, makePlayer } from '../lib/players'
import { shuffle } from '../lib/random'
import { sfx } from '../lib/sfx'
import { useI18n } from '../i18n'
import { UiIcon } from './icons'

export default function PlayersDrawer({ open, players, onClose, onChange, showToast }) {
  const { t, sampleNames } = useI18n()
  const [newName, setNewName] = useState('')
  const [drafts, setDrafts] = useState({})
  const [confirmReset, setConfirmReset] = useState(false)
  const inputRef = useRef(null)
  const resetTimer = useRef(null)
  const focusTimer = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    setDrafts(Object.fromEntries(players.map((player) => [player.id, player.name])))
    setNewName('')
    setConfirmReset(false)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    focusTimer.current = setTimeout(() => inputRef.current?.focus(), 240)

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      clearTimeout(focusTimer.current)
      clearTimeout(resetTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const addPlayer = (event) => {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return
    if (players.length >= MAX_PLAYERS) {
      showToast(t('drawer.maxError', { max: MAX_PLAYERS }))
      return
    }
    if (players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
      showToast(t('drawer.duplicate'))
      return
    }
    onChange([...players, makePlayer(name, players)])
    setNewName('')
    sfx.pop()
    inputRef.current?.focus()
  }

  const commitName = (id) => {
    const player = players.find((item) => item.id === id)
    if (!player) return
    const original = player.name
    const next = (drafts[id] ?? original).trim().slice(0, 22) || original
    if (next === original) {
      setDrafts((current) => ({ ...current, [id]: original }))
      return
    }
    if (players.some((item) => item.id !== id && item.name.toLowerCase() === next.toLowerCase())) {
      showToast(t('drawer.duplicate'))
      setDrafts((current) => ({ ...current, [id]: original }))
      return
    }
    onChange(players.map((item) => (item.id === id ? { ...item, name: next } : item)))
    setDrafts((current) => ({ ...current, [id]: next }))
  }

  const removePlayer = (id) => {
    if (players.length <= MIN_PLAYERS) {
      showToast(t('drawer.minError', { min: MIN_PLAYERS }))
      return
    }
    sfx.click()
    onChange(players.filter((player) => player.id !== id))
  }

  const cycleColor = (id) => {
    const player = players.find((item) => item.id === id)
    if (!player) return
    const used = new Set(players.filter((item) => item.id !== id).map((item) => item.color))
    const available = PLAYER_COLORS.filter((color) => !used.has(color))
    const pool = available.length ? available : PLAYER_COLORS
    const currentIndex = pool.indexOf(player.color)
    const nextColor = pool[(currentIndex + 1) % pool.length]
    onChange(players.map((item) => (item.id === id ? { ...item, color: nextColor } : item)))
    sfx.tick()
  }

  const shufflePlayers = () => {
    onChange(shuffle(players))
    sfx.whoosh()
    showToast(t('drawer.shuffleToast'))
  }

  const resetPlayers = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setConfirmReset(false), 3200)
      return
    }
    const samples = defaultPlayers(sampleNames)
    onChange(samples)
    setConfirmReset(false)
    sfx.win()
    showToast(t('drawer.resetToast', { count: samples.length }))
  }

  return (
    <div
      className="drawer-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <aside className="players-drawer" role="dialog" aria-modal="true" aria-labelledby="roster-title">
        <header className="drawer-head">
          <div>
            <span className="hud-kicker">{t('drawer.kicker')}</span>
            <h2 id="roster-title">{t('drawer.title')}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label={t('drawer.closeAria')}>
            <UiIcon name="close" size={19} />
          </button>
        </header>

        <div className="drawer-body">
          <div className="roster-summary">
            <span className="roster-live">
              <i />
              {t('drawer.live', { count: players.length })}
            </span>
            <span>{t('drawer.max', { max: MAX_PLAYERS })}</span>
          </div>

          <ul className="player-list">
            {players.map((player, index) => (
              <li className="player-row" key={player.id}>
                <button
                  type="button"
                  className="player-color"
                  style={{ '--player-color': player.color }}
                  onClick={() => cycleColor(player.id)}
                  aria-label={t('drawer.colorAria', { name: player.name })}
                  title={t('drawer.colorAria', { name: player.name })}
                />
                <span className="player-order">{String(index + 1).padStart(2, '0')}</span>
                <input
                  className="player-name-input"
                  value={drafts[player.id] ?? player.name}
                  maxLength={22}
                  aria-label={t('drawer.nameAria', { index: index + 1 })}
                  onChange={(event) => setDrafts((current) => ({ ...current, [player.id]: event.target.value }))}
                  onBlur={() => commitName(player.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur()
                  }}
                />
                <button
                  type="button"
                  className="row-remove"
                  onClick={() => removePlayer(player.id)}
                  disabled={players.length <= MIN_PLAYERS}
                  aria-label={t('drawer.removeAria', { name: player.name })}
                  title={players.length <= MIN_PLAYERS ? t('drawer.minError', { min: MIN_PLAYERS }) : t('drawer.removeAria', { name: player.name })}
                >
                  <UiIcon name="trash" size={17} />
                </button>
              </li>
            ))}
          </ul>

          <form className="add-player" onSubmit={addPlayer}>
            <input
              ref={inputRef}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder={t('drawer.addPlaceholder')}
              maxLength={22}
              aria-label={t('drawer.newPlayerAria')}
            />
            <button type="submit" className="btn btn-primary btn-small" disabled={!newName.trim()} aria-label={t('drawer.addAria')}>
              <UiIcon name="plus" size={18} />
              {t('drawer.add')}
            </button>
          </form>
          {players.length >= MAX_PLAYERS && (
            <p className="roster-limit">{t('drawer.maxError', { max: MAX_PLAYERS })}</p>
          )}

          <div className="drawer-tools">
            <button type="button" className="btn btn-ghost btn-small" onClick={shufflePlayers}>
              <UiIcon name="shuffle" size={16} />
              {t('drawer.shuffle')}
            </button>
            <button
              type="button"
              className={`btn btn-ghost btn-small${confirmReset ? ' is-danger' : ''}`}
              onClick={resetPlayers}
            >
              {confirmReset ? t('drawer.resetConfirm') : t('drawer.reset')}
            </button>
          </div>

          <p className="drawer-note">{t('drawer.note')}</p>
        </div>

        <footer className="drawer-foot">
          <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
            {t('drawer.done', { count: players.length })}
          </button>
        </footer>
      </aside>
    </div>
  )
}
