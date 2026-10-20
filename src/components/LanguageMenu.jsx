import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { UiIcon } from './icons'

export default function LanguageMenu() {
  const { lang, languages, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const current = languages.find((language) => language.code === lang)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="language-control" ref={wrapperRef}>
      <button
        type="button"
        className="icon-button language-button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`${t('common.language')}: ${current?.name ?? ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <UiIcon name="globe" size={19} />
      </button>

      {open && (
        <div className="language-menu" role="listbox" aria-label={t('language.title')}>
          <span className="language-menu-title">{t('language.title')}</span>
          {languages.map((language) => {
            const selected = language.code === lang
            return (
              <button
                type="button"
                className={`language-option${selected ? ' is-selected' : ''}`}
                key={language.code}
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setLang(language.code)
                  setOpen(false)
                }}
              >
                <span className="language-code">{language.short}</span>
                <span className="language-name">{language.name}</span>
                {selected && <UiIcon name="check" size={15} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
