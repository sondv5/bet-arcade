import { randomInt, uid } from './random'

export const PLAYER_COLORS = [
  '#ff4d6d',
  '#ffd23f',
  '#2ee6a6',
  '#4d9bff',
  '#9b7bff',
  '#ff6fb5',
  '#ff9f43',
  '#22d3ee',
  '#b6f04a',
  '#f25ecb',
  '#2dd4bf',
  '#ffb27a',
]

export const MAX_PLAYERS = 24
export const MIN_PLAYERS = 2

const STORAGE_KEY = 'bet.players.v1'

const LEGACY_COLORS = {
  '#ff5c4d': '#ff4d6d',
  '#ffc53d': '#ffd23f',
  '#59d9a8': '#2ee6a6',
  '#6aa9ff': '#4d9bff',
  '#b89cff': '#9b7bff',
  '#ff8fab': '#ff6fb5',
  '#ffa45b': '#ff9f43',
  '#7bdff2': '#22d3ee',
  '#c7e96b': '#b6f04a',
  '#f29be0': '#f25ecb',
  '#9fe3b2': '#2dd4bf',
  '#ffd1a9': '#ffb27a',
}

const DEFAULT_NAMES = ['Minh Béo', 'Linh Mập', 'Huy Sún', 'Trang Bơ', 'Dũng Tí', 'Mai Mắm', 'Khoa Cún', 'Nhi Ổi']

export function defaultPlayers(names = DEFAULT_NAMES) {
  return names.map((name, index) => ({
    id: `seed-${index + 1}`,
    name,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
  }))
}

export function makePlayer(name, players = []) {
  const used = new Set(players.map((player) => player.color))
  const color = PLAYER_COLORS.find((candidate) => !used.has(candidate)) ?? PLAYER_COLORS[randomInt(PLAYER_COLORS.length)]
  return { id: uid('player'), name: String(name).trim().slice(0, 22), color }
}

export function sanitizePlayers(value) {
  if (!Array.isArray(value)) return null
  const seen = new Set()
  const players = value
    .filter((player) => player && typeof player.name === 'string' && player.name.trim())
    .slice(0, MAX_PLAYERS)
    .map((player, index) => {
      let id = typeof player.id === 'string' && player.id ? player.id : uid('player')
      if (seen.has(id)) id = uid('player')
      seen.add(id)
      const rawColor = /^#[0-9a-f]{6}$/i.test(player.color ?? '') ? player.color.toLowerCase() : null
      return {
        id,
        name: player.name.trim().slice(0, 22),
        color: (rawColor && LEGACY_COLORS[rawColor]) || rawColor || PLAYER_COLORS[index % PLAYER_COLORS.length],
      }
    })
  return players.length >= MIN_PLAYERS ? players : null
}

export function loadPlayers(fallbackNames = DEFAULT_NAMES) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPlayers(fallbackNames)
    return sanitizePlayers(JSON.parse(raw)) ?? defaultPlayers(fallbackNames)
  } catch {
    return defaultPlayers(fallbackNames)
  }
}

export function savePlayers(players) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
  } catch {
    /* storage can be unavailable; the party must go on */
  }
}
