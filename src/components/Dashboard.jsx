import { useEffect } from 'react'
import { CATEGORIES, GAMES, gamesByCategory } from '../data/games'
import { useI18n } from '../i18n'
import HeroScene from './HeroScene'
import LanguageMenu from './LanguageMenu'
import Logo from './Logo'
import { GameIcon, UiIcon } from './icons'

function GameCard({ game }) {
  const { t } = useI18n()
  const title = t(`games.${game.id}.title`)

  return (
    <a
      className="game-card"
      href={`#/game/${game.id}`}
      style={{ '--accent': game.accent }}
      aria-label={`${title} — ${t(`games.${game.id}.tagline`)}`}
    >
      <div className="game-card-top">
        <span className="game-icon">
          <GameIcon id={game.id} />
        </span>
        <span className="game-badge">{t(`games.${game.id}.badge`)}</span>
      </div>
      <div className="game-card-body">
        <h3>{title}</h3>
        <p className="game-tagline">{t(`games.${game.id}.tagline`)}</p>
        <p className="game-description">{t(`games.${game.id}.description`)}</p>
      </div>
      <div className="game-card-foot">
        <span className="game-meta">
          <UiIcon name="users" size={15} />
          {game.minPlayers}–{game.maxPlayers}
        </span>
        <span className="game-meta">
          <UiIcon name="clock" size={15} />
          {t(`games.${game.id}.duration`)}
        </span>
        <span className="game-card-cta">
          {t('common.play')}
          <UiIcon name="arrowRight" size={16} />
        </span>
      </div>
    </a>
  )
}

function Ticker() {
  const { t } = useI18n()
  const items = ['home.ticker1', 'home.ticker2', 'home.ticker3', 'home.ticker4', 'home.ticker5', 'home.ticker6']
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map((copy) => (
          <div className="ticker-group" key={copy}>
            {items.map((key) => (
              <span className="ticker-item" key={`${copy}-${key}`}>
                {t(key)}
                <i className="ticker-dot" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ players, onOpenPlayers, muted, onToggleMute, onInstall, pwa, showToast }) {
  const { t, lang } = useI18n()
  const installLabel = pwa.standalone ? t('home.installed') : t('home.installCta')

  useEffect(() => {
    document.title = t('meta.title')
  }, [t, lang])

  return (
    <div className="home">
      <header className="topbar">
        <div className="topbar-inner shell">
          <Logo />
          <nav className="topbar-nav" aria-label={t('nav.games')}>
            <a href="#games">{t('nav.games')}</a>
            <a href="#how">{t('nav.how')}</a>
          </nav>
          <div className="topbar-actions">
            <LanguageMenu />
            <button
              type="button"
              className="roster-button"
              onClick={onOpenPlayers}
              aria-label={t('common.openRoster', { count: players.length })}
            >
              <UiIcon name="users" size={18} />
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
        </div>
      </header>

      {!pwa.online && <div className="offline-bar">{t('home.offline')}</div>}

      <main>
        <section className="hero shell">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-blocks" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {t('home.eyebrow', { count: GAMES.length })}
            </div>
            <h1 className="hero-title">
              {t('home.title1')}
              <br />
              <span className="hero-title-mark">{t('home.title2')}</span>
            </h1>
            <p className="hero-lead">{t('home.lead', { count: GAMES.length })}</p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-lg" href="#games">
                {t('home.chooseGame')}
                <UiIcon name="arrowDown" size={18} />
              </a>
              <button type="button" className="btn btn-ghost btn-lg" onClick={onOpenPlayers}>
                <UiIcon name="users" size={18} />
                {t('home.editList')}
              </button>
            </div>
            <div className="hero-stats">
              <span>
                <b>{GAMES.length}</b> {t('home.statGames')}
              </span>
              <span>
                <b>{CATEGORIES.length}</b> {t('home.statPurposes')}
              </span>
              <span>
                <b>2–24</b> {t('home.statPeople')}
              </span>
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-glow" aria-hidden="true" />
            <HeroScene />
            <div className="hero-sticker hero-sticker-sun" aria-hidden="true">
              <b>{t('home.stickerRandom')}</b>
            </div>
            <div className="hero-sticker hero-sticker-note" aria-hidden="true">
              {t('home.stickerFriend')}
            </div>
            <div className="hero-device-note">
              <UiIcon name="dice" size={15} />
              {t('home.deviceNote')}
            </div>
          </div>
        </section>

        <Ticker />

        <section className="games-section shell" id="games">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{t('home.collectionKicker')}</span>
              <h2>{t('home.heading')}</h2>
            </div>
            <p>{t('home.headingDesc')}</p>
          </div>

          <nav className="category-pills" aria-label={t('nav.games')}>
            {CATEGORIES.map((category) => (
              <a
                key={category.id}
                className="category-pill"
                href={`#cat-${category.id}`}
                style={{ '--pill': category.accent }}
              >
                <span className="category-pill-dot" />
                {t(`categories.${category.id}.short`)}
                <span className="category-pill-count">{gamesByCategory(category.id).length}</span>
              </a>
            ))}
          </nav>

          <div className="category-list">
            {CATEGORIES.map((category) => {
              const games = gamesByCategory(category.id)
              return (
                <section
                  className="category-section"
                  id={`cat-${category.id}`}
                  key={category.id}
                  style={{ '--cat-accent': category.accent }}
                >
                  <div className="category-head">
                    <span className="category-index">{category.index}</span>
                    <div className="category-copy">
                      <h3>{t(`categories.${category.id}.title`)}</h3>
                      <p>{t(`categories.${category.id}.blurb`)}</p>
                    </div>
                    <span className="category-count">{t('home.categoryCount', { count: games.length })}</span>
                  </div>
                  <div className="game-grid">
                    {games.map((game) => (
                      <GameCard game={game} key={game.id} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </section>

        <section className="how-section shell" id="how">
          <div className="how-panel">
            <div className="how-copy">
              <span className="section-kicker section-kicker-light">{t('home.howKicker')}</span>
              <h2>
                {t('home.howTitle1')}
                <br />
                {t('home.howTitle2')}
              </h2>
              <p>{t('home.howDesc')}</p>
              <div className="how-badges">
                <span>
                  <UiIcon name="check" size={14} /> {t('home.badgeFree')}
                </span>
                <span>
                  <UiIcon name="check" size={14} /> {t('home.badgeNoAds')}
                </span>
                <span>
                  <UiIcon name="check" size={14} /> {t('home.badgeLocal')}
                </span>
              </div>
            </div>

            <ol className="how-steps">
              <li>
                <span className="step-number">01</span>
                <div>
                  <b>{t('home.step1Title')}</b>
                  <p>{t('home.step1Text')}</p>
                </div>
              </li>
              <li>
                <span className="step-number">02</span>
                <div>
                  <b>{t('home.step2Title')}</b>
                  <p>{t('home.step2Text')}</p>
                </div>
              </li>
              <li>
                <span className="step-number">03</span>
                <div>
                  <b>{t('home.step3Title')}</b>
                  <p>{t('home.step3Text')}</p>
                </div>
              </li>
            </ol>

            <div className="install-card">
              <div className="install-copy">
                <span className="install-icon">
                  <UiIcon name="download" size={20} />
                </span>
                <div>
                  <h3>{t('home.installTitle')}</h3>
                  <p>{t('home.installDesc')}</p>
                </div>
              </div>
              <button
                type="button"
                className={`btn ${pwa.standalone ? 'btn-muted' : 'btn-dark'}`}
                onClick={() => {
                  if (pwa.standalone) {
                    showToast(t('home.toastInstalled'))
                    return
                  }
                  if (pwa.isIOS && !pwa.canPrompt) {
                    showToast(t('home.toastIos'))
                    return
                  }
                  if (!pwa.canPrompt) {
                    showToast(t('home.toastManual'))
                    return
                  }
                  onInstall?.()
                }}
              >
                {pwa.standalone ? <UiIcon name="check" size={17} /> : <UiIcon name="download" size={17} />}
                {installLabel}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell footer-inner">
          <div className="footer-brand">
            <Logo invert />
            <p>{t('home.footerTagline')}</p>
          </div>
          <div className="footer-info">
            <p>{t('home.footerLine1')}</p>
            <p>{t('home.footerLine2')}</p>
          </div>
        </div>
        <div className="footer-word" aria-hidden="true">
          BÉT!
        </div>
      </footer>
    </div>
  )
}
