import { useEffect, useMemo, useRef } from 'react'
import { useI18n } from '../i18n'
import { PLAYER_COLORS } from '../lib/players'
import { UiIcon } from './icons'

const GROUP_COLORS = ['#ff4d6d', '#4d9bff', '#2ee6a6', '#9b7bff', '#ffd23f', '#ff6fb5', '#22d3ee', '#ff9f43']

function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      resolve()
    } catch (error) {
      reject(error)
    } finally {
      document.body.removeChild(textarea)
    }
  })
}

export default function ResultModal({ result, game, players, onClose, onReplay, onBack, showToast }) {
  const { t } = useI18n()
  const primaryRef = useRef(null)
  const playerMap = useMemo(() => new Map(players.map((player) => [player.id, player])), [players])

  const tone = result?.tone ?? 'pick'
  const isTeams = result?.type === 'teams'
  const chosen = (result?.playerIds ?? []).map((id) => playerMap.get(id)).filter(Boolean)
  const groups = (result?.groups ?? []).map((group, index) => ({
    ...group,
    name: group.name || t('result.groupDefault', { n: index + 1 }),
    players: (group.playerIds ?? []).map((id) => playerMap.get(id)).filter(Boolean),
    color: GROUP_COLORS[index % GROUP_COLORS.length],
  }))

  const defaultHeadline = isTeams
    ? t('result.teamsHeadline')
    : tone === 'lose'
      ? t('result.loseHeadline')
      : tone === 'win'
        ? t('result.winHeadline')
        : t('result.pickHeadline')
  const headline = result?.headline || defaultHeadline
  const defaultSub = isTeams
    ? t('result.teamsSub')
    : tone === 'lose'
      ? chosen.length > 1
        ? t('result.loseSubMany')
        : t('result.loseSub')
      : tone === 'win'
        ? t('result.winSub')
        : t('result.pickSub')
  const subline = result?.subline || defaultSub

  const emblem = isTeams ? 'users' : tone === 'lose' ? 'skull' : tone === 'win' ? 'crown' : 'star'
  const tag = tone === 'lose' ? t('result.tagLose') : tone === 'win' ? t('result.tagWin') : t('result.tagPick')

  const confetti = useMemo(
    () =>
      Array.from({ length: 32 }, (_, index) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.7,
        duration: 2.4 + Math.random() * 1.9,
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
        color: PLAYER_COLORS[index % PLAYER_COLORS.length],
        round: index % 3 === 0,
      })),
    [result],
  )

  useEffect(() => {
    if (!result) return undefined
    const timer = setTimeout(() => primaryRef.current?.focus(), 120)
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [result, onClose])

  if (!result) return null

  const handleCopy = () => {
    const lines = [`BÉT! — ${t(`games.${game.id}.title`)}`, headline]
    if (isTeams) {
      groups.forEach((group) => {
        lines.push(`${group.name}: ${group.players.map((player) => player.name).join(', ') || '—'}`)
      })
    } else if (chosen.length) {
      lines.push(chosen.map((player) => player.name).join(', '))
    }
    lines.push(t('result.copyFooter'))
    copyText(lines.join('\n'))
      .then(() => showToast(t('result.copyOk')))
      .catch(() => showToast(t('result.copyFail')))
  }

  return (
    <div
      className={`result-overlay result-tone-${tone}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
    >
      <div className="confetti-layer" aria-hidden="true">
        {confetti.map((piece, index) => (
          <span
            key={index}
            className={`confetti-piece${piece.round ? ' is-round' : ''}`}
            style={{
              '--left': `${piece.left}%`,
              '--delay': `${piece.delay}s`,
              '--duration': `${piece.duration}s`,
              '--size': `${piece.size}px`,
              '--rotate': `${piece.rotate}deg`,
              '--piece': piece.color,
            }}
          />
        ))}
      </div>

      <div className={`result-card result-card-${tone}`} style={{ '--accent': game.accent }}>
        <button type="button" className="result-close" onClick={onClose} aria-label={t('result.closeAria')}>
          <UiIcon name="close" size={18} />
        </button>

        <span className="result-kicker">{t(`games.${game.id}.title`)}</span>
        <span className="result-emblem" aria-hidden="true">
          <UiIcon name={emblem} size={27} strokeWidth={2.2} />
        </span>
        <h2 id="result-title">{headline}</h2>

        {isTeams ? (
          <div className="result-groups">
            {groups.map((group) => (
              <div className="result-group" key={group.name} style={{ '--group': group.color }}>
                <div className="result-group-head">
                  <span className="result-group-dot" />
                  <b>{group.name}</b>
                  <span>{t('result.people', { count: group.players.length })}</span>
                </div>
                <div className="result-group-members">
                  {group.players.map((player) => (
                    <span className="member-chip" key={player.id} style={{ '--player': player.color }}>
                      <i />
                      {player.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : chosen.length === 1 ? (
          <div className="result-winner" style={{ '--player': chosen[0].color }}>
            <span className="result-winner-dot" />
            <span className="result-winner-name">{chosen[0].name}</span>
            <span className="result-winner-tag">{tag}</span>
          </div>
        ) : (
          <div className="result-names">
            {chosen.map((player) => (
              <span className="result-name-chip" key={player.id} style={{ '--player': player.color }}>
                <i />
                {player.name}
              </span>
            ))}
          </div>
        )}

        <p className="result-sub">{subline}</p>

        <div className="result-actions">
          <button ref={primaryRef} type="button" className="btn btn-primary" onClick={onReplay}>
            <UiIcon name="shuffle" size={17} />
            {t('common.replay')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            <UiIcon name="home" size={17} />
            {t('common.backToLobby')}
          </button>
          <button type="button" className="icon-button result-copy" onClick={handleCopy} aria-label={t('result.copyAria')}>
            <UiIcon name="copy" size={18} />
          </button>
        </div>

        <p className="result-footnote">{t('result.footnote')}</p>
      </div>
    </div>
  )
}
