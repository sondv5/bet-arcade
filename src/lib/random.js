const hasCrypto = typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'

export function randomInt(maxExclusive) {
  const max = Math.floor(maxExclusive)
  if (!Number.isFinite(max) || max <= 0) return 0
  if (!hasCrypto) return Math.floor(Math.random() * max)
  const limit = 2 ** 32
  const cutoff = limit - (limit % max)
  const buffer = new Uint32Array(1)
  let value
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= cutoff)
  return value % max
}

export function randomFloat() {
  return randomInt(1_000_000) / 1_000_000
}

export function pickRandom(list) {
  return list[randomInt(list.length)]
}

export function shuffle(list) {
  const result = [...list]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function sample(list, count) {
  return shuffle(list).slice(0, Math.max(0, count))
}

export function uid(prefix = 'id') {
  if (hasCrypto && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
}
