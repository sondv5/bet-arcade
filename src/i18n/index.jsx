import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from './locales/en'
import vi from './locales/vi'
import zh from './locales/zh'
import ja from './locales/ja'
import ko from './locales/ko'
import es from './locales/es'
import fr from './locales/fr'
import pt from './locales/pt'

const STORAGE_KEY = 'bet.lang.v1'

export const LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', short: 'VI' },
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'zh', name: '中文', short: 'ZH' },
  { code: 'ja', name: '日本語', short: 'JA' },
  { code: 'ko', name: '한국어', short: 'KO' },
  { code: 'es', name: 'Español', short: 'ES' },
  { code: 'fr', name: 'Français', short: 'FR' },
  { code: 'pt', name: 'Português', short: 'PT' },
]

const DICTIONARIES = { en, vi, zh, ja, ko, es, fr, pt }
const SUPPORTED = new Set(LANGUAGES.map((language) => language.code))
const LOCALE_TAGS = {
  vi: 'vi-VN',
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  es: 'es-ES',
  fr: 'fr-FR',
  pt: 'pt-BR',
}

const SAMPLE_NAMES = {
  vi: ['Minh Béo', 'Linh Mập', 'Huy Sún', 'Trang Bơ', 'Dũng Tí', 'Mai Mắm', 'Khoa Cún', 'Nhi Ổi'],
  en: ['Alex', 'Sam', 'Max', 'Zoe', 'Mia', 'Leo', 'Nora', 'Kai'],
  zh: ['小明', '阿花', '强哥', '小美', '大力', '阿芳', '大伟', '小雨'],
  ja: ['ハナ', 'タケシ', 'ミキ', 'ケン', 'ユイ', 'ソラ', 'リク', 'アヤ'],
  ko: ['민수', '지은', '현우', '서연', '준호', '하늘', '도윤', '유나'],
  es: ['Sofía', 'Mateo', 'Valeria', 'Diego', 'Camila', 'Leo', 'Luna', 'Bruno'],
  fr: ['Léa', 'Hugo', 'Chloé', 'Théo', 'Manon', 'Noah', 'Inès', 'Lucas'],
  pt: ['Beatriz', 'Lucas', 'Júlia', 'Rafael', 'Camila', 'Thiago', 'Larissa', 'Bruno'],
}

function normalizeLanguage(raw) {
  if (!raw) return null
  const base = String(raw).toLowerCase().split(/[-_]/)[0]
  if (SUPPORTED.has(base)) return base
  return null
}

export function detectLanguage() {
  if (typeof window === 'undefined') return 'en'

  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    const normalized = normalizeLanguage(fromUrl)
    if (normalized) return normalized
  } catch {
    /* ignore malformed URLs */
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED.has(stored)) return stored
  } catch {
    /* ignore */
  }

  const browserLanguages =
    typeof navigator !== 'undefined'
      ? navigator.languages?.length
        ? navigator.languages
        : [navigator.language]
      : []

  for (const candidate of browserLanguages) {
    const normalized = normalizeLanguage(candidate)
    if (normalized) return normalized
  }

  return 'en'
}

export function getSampleNames(language) {
  return SAMPLE_NAMES[language] ?? SAMPLE_NAMES.en
}

const I18nContext = createContext(null)

function interpolate(template, values) {
  if (!values) return template
  return template.replace(/\{(\w+)\}/g, (match, key) => (values[key] ?? match))
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage)

  const setLang = useCallback((code) => {
    if (!SUPPORTED.has(code)) return
    setLangState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      /* ignore */
    }
  }, [])

  const t = useCallback(
    (key, values) => {
      const dictionary = DICTIONARIES[lang] ?? DICTIONARIES.en
      const template = dictionary[key] ?? DICTIONARIES.en[key] ?? key
      return interpolate(template, values)
    },
    [lang],
  )

  useEffect(() => {
    document.documentElement.lang = lang
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', t('meta.description'))
  }, [lang, t])

  const value = useMemo(
    () => ({
      lang,
      locale: LOCALE_TAGS[lang] ?? 'en-US',
      languages: LANGUAGES,
      setLang,
      t,
      sampleNames: SAMPLE_NAMES[lang] ?? SAMPLE_NAMES.en,
    }),
    [lang, setLang, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}
