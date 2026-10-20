const STORAGE_KEY = 'bet.muted.v1'

class SoundBoard {
  constructor() {
    this.muted = false
    try {
      this.muted = localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      /* ignore */
    }
    this.ctx = null
    this.master = null
    this.noiseBuffer = null
  }

  setMuted(muted) {
    this.muted = Boolean(muted)
    try {
      localStorage.setItem(STORAGE_KEY, this.muted ? '1' : '0')
    } catch {
      /* ignore */
    }
    if (this.master) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.5, this.ctx.currentTime, 0.02)
    }
  }

  ensure() {
    if (this.muted) return null
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return null
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.5
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => null)
    return this.ctx
  }

  tone(frequency, duration = 0.08, { type = 'sine', gain = 0.08, to = null, delay = 0 } = {}) {
    const ctx = this.ensure()
    if (!ctx) return
    const start = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const level = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(Math.max(20, frequency), start)
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + duration)
    level.gain.setValueAtTime(0.0001, start)
    level.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + 0.012)
    level.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.03, duration))
    osc.connect(level)
    level.connect(this.master)
    osc.start(start)
    osc.stop(start + duration + 0.06)
  }

  noise(duration = 0.4, { gain = 0.12, from = 1200, to = 300, q = 0.9, type = 'lowpass', delay = 0 } = {}) {
    const ctx = this.ensure()
    if (!ctx) return
    if (!this.noiseBuffer) {
      const length = Math.floor(ctx.sampleRate * 1.5)
      this.noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate)
      const data = this.noiseBuffer.getChannelData(0)
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1
    }
    const start = ctx.currentTime + delay
    const source = ctx.createBufferSource()
    source.buffer = this.noiseBuffer
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.Q.value = q
    filter.frequency.setValueAtTime(Math.max(30, from), start)
    filter.frequency.exponentialRampToValueAtTime(Math.max(30, to), start + duration)
    const level = ctx.createGain()
    level.gain.setValueAtTime(0.0001, start)
    level.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + 0.02)
    level.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    source.connect(filter)
    filter.connect(level)
    level.connect(this.master)
    source.start(start)
    source.stop(start + duration + 0.05)
  }

  click() {
    this.tone(460, 0.05, { type: 'square', gain: 0.035 })
    this.tone(700, 0.06, { type: 'square', gain: 0.025, delay: 0.035 })
  }

  tick() {
    this.tone(1180, 0.035, { type: 'triangle', gain: 0.045 })
  }

  pop() {
    this.tone(280, 0.09, { type: 'sine', gain: 0.1, to: 680 })
  }

  whoosh() {
    this.noise(0.5, { gain: 0.1, from: 380, to: 2600, q: 0.7, type: 'bandpass' })
  }

  spin() {
    this.noise(0.7, { gain: 0.055, from: 1800, to: 200, q: 0.6, type: 'bandpass' })
  }

  boom() {
    this.noise(0.9, { gain: 0.32, from: 1100, to: 55, q: 0.5, type: 'lowpass' })
    this.tone(130, 0.75, { type: 'sine', gain: 0.28, to: 34 })
    this.tone(72, 0.9, { type: 'triangle', gain: 0.16, to: 28 })
  }

  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((note, index) => {
      this.tone(note, 0.22, { type: 'triangle', gain: 0.09, delay: index * 0.1 })
    })
    this.noise(0.5, { gain: 0.045, from: 3200, to: 900, q: 0.8, type: 'highpass', delay: 0.05 })
  }

  lose() {
    this.tone(380, 0.22, { type: 'sawtooth', gain: 0.05, to: 300 })
    this.tone(300, 0.25, { type: 'sawtooth', gain: 0.045, to: 220, delay: 0.18 })
    this.tone(210, 0.4, { type: 'triangle', gain: 0.06, to: 150, delay: 0.38 })
  }

  gong() {
    this.tone(196, 1.2, { type: 'sine', gain: 0.15 })
    this.tone(294, 1.1, { type: 'sine', gain: 0.08, delay: 0.02 })
    this.tone(392, 0.9, { type: 'sine', gain: 0.05, delay: 0.04 })
    this.noise(0.6, { gain: 0.03, from: 2000, to: 400, q: 0.8, type: 'bandpass' })
  }

  drumroll(seconds = 1.2) {
    const steps = Math.max(8, Math.round(seconds * 28))
    for (let i = 0; i < steps; i += 1) {
      const progress = i / steps
      this.noise(0.055, {
        gain: 0.02 + progress * 0.04,
        from: 2400 - progress * 1500,
        to: 1200,
        q: 0.7,
        type: 'bandpass',
        delay: (i / 28) * (seconds / (steps / 28)),
      })
    }
  }

  coin() {
    this.tone(1046, 0.08, { type: 'square', gain: 0.05 })
    this.tone(1568, 0.16, { type: 'square', gain: 0.04, delay: 0.07 })
  }

  beep() {
    this.tone(880, 0.1, { type: 'square', gain: 0.045 })
  }
}

export const sfx = new SoundBoard()
