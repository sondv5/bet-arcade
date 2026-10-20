import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStage } from '../../lib/useStage'
import {
  addContactRing,
  easeOutCubic,
  easeOutQuint,
  makeBlock,
  makeTextPlane,
  PALETTE,
} from '../../lib/threeKit'
import { randomInt } from '../../lib/random'
import { makeCat } from '../../lib/characters'
import { sfx } from '../../lib/sfx'
import { UiIcon } from '../../components/icons'
import { useI18n } from '../../i18n'
import './slots.css'

const REEL_W = 256
const REEL_H = 512
const ROW_H = 158

function fitFont(ctx, text, maxWidth, start, weight = 700) {
  let size = start
  ctx.font = `${weight} ${size}px "Be Vietnam Pro", sans-serif`
  while (size > 18 && ctx.measureText(text).width > maxWidth) {
    size -= 2
    ctx.font = `${weight} ${size}px "Be Vietnam Pro", sans-serif`
  }
  return size
}

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawReel(canvas, players, options = {}) {
  const { offset = 0, winner = null, stopped = false } = options
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, REEL_W, REEL_H)
  ctx.fillStyle = '#fffaf1'
  ctx.fillRect(0, 0, REEL_W, REEL_H)

  const total = Math.max(ROW_H * players.length, REEL_H + ROW_H)
  const baseOffset = ((offset % total) + total) % total

  const drawPill = (player, centerY) => {
    if (!player) return
    const color = new THREE.Color(player.color).lerp(new THREE.Color('#fffaf1'), 0.22).getStyle()
    roundedRect(ctx, 12, centerY - 55, REEL_W - 24, 110, 22)
    ctx.fillStyle = color
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = '#17161a'
    ctx.stroke()

    ctx.fillStyle = '#17161a'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    fitFont(ctx, player.name, REEL_W - 50, 38)
    ctx.fillText(player.name, REEL_W / 2, centerY + 2)
  }

  for (let i = 0; i < players.length; i += 1) {
    const center = ((i * ROW_H + ROW_H * 0.46 - baseOffset) % total + total) % total
    if (center < REEL_H + ROW_H) drawPill(players[i], center)
  }

  if (stopped && winner) {
    ctx.fillStyle = 'rgba(255, 197, 61, 0.16)'
    ctx.fillRect(0, REEL_H / 2 - ROW_H / 2, REEL_W, ROW_H)
    drawPill(winner, REEL_H / 2)
    ctx.strokeStyle = 'rgba(23, 22, 26, 0.14)'
    ctx.lineWidth = 2
    for (const y of [REEL_H / 2 - ROW_H / 2, REEL_H / 2 + ROW_H / 2]) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(REEL_W, y)
      ctx.stroke()
    }
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, REEL_H)
  gradient.addColorStop(0, 'rgba(23, 22, 26, 0.12)')
  gradient.addColorStop(0.14, 'rgba(23, 22, 26, 0)')
  gradient.addColorStop(0.86, 'rgba(23, 22, 26, 0)')
  gradient.addColorStop(1, 'rgba(23, 22, 26, 0.12)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, REEL_W, REEL_H)
}

function drawBackTexture(canvas) {
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff4d9'
  ctx.fillRect(0, 0, REEL_W, REEL_H)
  ctx.strokeStyle = 'rgba(23,22,26,.1)'
  ctx.lineWidth = 2
  for (let i = -REEL_H; i < REEL_W + REEL_H; i += 26) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + REEL_H, REEL_H)
    ctx.stroke()
  }
}

export default function SlotsGame({ players, onFinish }) {
  const { t } = useI18n()
  const hostRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [winnerName, setWinnerName] = useState('')
  const timers = useRef([])
  const finishRef = useRef(false)

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const api = useStage(hostRef, {
    fov: 37,
    position: [0, 4.9, 10.9],
    lookAt: [0, 2.8, 0],
    setup: (stage) => {
      const root = new THREE.Group()
      stage.scene.add(root)

      const cabinet = new THREE.Group()
      cabinet.position.y = 0
      root.add(cabinet)

      const ink = '#17161a'
      const baseInk = makeBlock({ width: 6.1, height: 0.28, depth: 2.5, radius: 0.16, color: ink, roughness: 0.7 })
      baseInk.position.y = 0.14
      stage.scene.add(baseInk)
      const base = makeBlock({ width: 5.7, height: 0.42, depth: 2.15, radius: 0.18, color: '#ffe0c8', roughness: 0.82 })
      base.position.y = 0.45
      stage.scene.add(base)
      addContactRing(stage.scene, { inner: 4, outer: 4.12, color: '#ded0bb', opacity: 0.7 })

      const cat = makeCat({ scale: 0.9, color: '#fff2dd' })
      cat.position.set(-2.25, 0.66, 1.05)
      cat.rotation.y = 0.5
      stage.scene.add(cat)

      const back = makeBlock({ width: 5.15, height: 4.55, depth: 1.05, radius: 0.24, color: '#f7eddd', roughness: 0.8 })
      back.position.set(0, 3.1, -0.15)
      cabinet.add(back)

      const body = makeBlock({ width: 4.95, height: 4.35, depth: 0.82, radius: 0.2, color: '#fdf4e7', roughness: 0.7 })
      body.position.set(0, 3.1, 0.25)
      cabinet.add(body)

      const window = makeBlock({ width: 4.15, height: 2.52, depth: 0.22, radius: 0.12, color: ink, roughness: 0.45 })
      window.position.set(0, 2.78, 0.69)
      cabinet.add(window)

      const reelCanvases = []
      const reelTextures = []
      const reelMeshes = []
      const reelBackdrops = []
      const reelX = [-1.24, 0, 1.24]

      reelX.forEach((x) => {
        const canvas = document.createElement('canvas')
        canvas.width = REEL_W
        canvas.height = REEL_H
        drawBackTexture(canvas)
        const texture = new THREE.CanvasTexture(canvas)
        texture.colorSpace = THREE.SRGBColorSpace
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 2.32), material)
        mesh.position.set(x, 2.78, 0.82)
        cabinet.add(mesh)
        reelCanvases.push(canvas)
        reelTextures.push(texture)
        reelMeshes.push(mesh)

        const backdrop = makeBlock({ width: 1.29, height: 2.44, depth: 0.12, radius: 0.08, color: '#17161a', roughness: 0.5 })
        backdrop.position.set(x, 2.78, 0.73)
        cabinet.add(backdrop)
        reelBackdrops.push(backdrop)

        reelMeshes[reelMeshes.length - 1].renderOrder = 2
      })

      reelBackdrops.forEach((backdrop) => {
        backdrop.position.z = 0.68
      })

      const framePieces = [
        { x: -2.16, y: 2.78, w: 0.3, h: 2.55 },
        { x: 2.16, y: 2.78, w: 0.3, h: 2.55 },
        { x: -1.81, y: 2.78, w: 0.12, h: 2.55 },
        { x: 1.81, y: 2.78, w: 0.12, h: 2.55 },
        { x: -0.62, y: 2.78, w: 0.1, h: 2.55 },
        { x: 0.62, y: 2.78, w: 0.1, h: 2.55 },
      ]
      framePieces.forEach((piece) => {
        const block = makeBlock({
          width: piece.w,
          height: piece.h,
          depth: 0.34,
          radius: 0.05,
          color: '#ffd36b',
          roughness: 0.55,
        })
        block.position.set(piece.x, piece.y, 0.96)
        cabinet.add(block)
      })

      const topBar = makeBlock({ width: 4.9, height: 0.95, depth: 0.75, radius: 0.16, color: '#ffd23f', roughness: 0.58 })
      topBar.position.set(0, 4.45, 0.48)
      cabinet.add(topBar)

      const bottomBar = makeBlock({ width: 4.9, height: 0.72, depth: 0.78, radius: 0.14, color: '#ffd23f', roughness: 0.58 })
      bottomBar.position.set(0, 1.2, 0.48)
      cabinet.add(bottomBar)

      const marquee = makeTextPlane('LUCKY BÉT!', {
        height: 0.6,
        color: ink,
        background: '#ffd23f',
        paddingX: 14,
        paddingY: 6,
        fontSize: 94,
        fontWeight: 800,
        maxWidth: 800,
      })
      marquee.position.set(0, 4.45, 0.87)
      cabinet.add(marquee)

      const jackpot = makeTextPlane('JACKPOT!', {
        height: 0.72,
        color: '#fffaf1',
        background: '#ff4d6d',
        border: ink,
        borderWidth: 6,
        paddingX: 18,
        paddingY: 8,
        fontSize: 100,
        fontWeight: 800,
        maxWidth: 700,
      })
      jackpot.position.set(0, 5.35, 0.8)
      jackpot.scale.setScalar(0.001)
      cabinet.add(jackpot)

      const bulbMaterial = new THREE.MeshStandardMaterial({
        color: '#fff5d4',
        emissive: new THREE.Color('#ffd23f'),
        emissiveIntensity: 0.9,
        roughness: 0.35,
      })
      const bulbs = []
      for (let i = 0; i < 7; i += 1) {
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), bulbMaterial)
        bulb.position.set(-1.95 + i * 0.65, 4.77, 0.9)
        cabinet.add(bulb)
        bulbs.push(bulb)
      }

      const leverPivot = new THREE.Group()
      leverPivot.position.set(2.62, 1.65, 0.4)
      leverPivot.rotation.z = 0.38
      cabinet.add(leverPivot)

      const leverRod = makeBlock({ width: 0.13, height: 2.1, depth: 0.13, radius: 0.05, color: '#17161a', roughness: 0.4 })
      leverRod.position.y = 1.02
      leverPivot.add(leverRod)
      const leverKnob = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 20, 16),
        new THREE.MeshStandardMaterial({ color: '#ff4d6d', roughness: 0.35 }),
      )
      leverKnob.position.y = 2.15
      leverKnob.castShadow = true
      leverPivot.add(leverKnob)

      const footA = makeBlock({ width: 0.65, height: 0.35, depth: 0.9, radius: 0.09, color: ink, roughness: 0.6 })
      footA.position.set(-1.85, 0.25, 0.1)
      cabinet.add(footA)
      const footB = footA.clone()
      footB.position.x = 1.85
      cabinet.add(footB)

      const rngMeta = {
        offset: [0, 0, 0],
        stopAt: [2.3, 3.35, 4.35],
        stopped: [false, false, false],
        speed: [950, 1120, 1280],
        bounce: [0, 0, 0],
        lastDraw: 0,
      }

      const winnerIndexRef = { value: 0 }
      const state = {
        spinning: false,
        done: false,
        start: 0,
        end: 0,
        winner: null,
        confetti: [],
        jackpotStart: 0,
      }
      const lastTurnTime = { value: 0 }

      const winnerOf = () => players[winnerIndexRef.value]

      const drawAll = (time) => {
        if (time - rngMeta.lastDraw < 32) return
        rngMeta.lastDraw = time
        for (let i = 0; i < 3; i += 1) {
          const isStopped = rngMeta.stopped[i]
          drawReel(reelCanvases[i], players, {
            offset: rngMeta.offset[i],
            winner: isStopped ? winnerOf() : null,
            stopped: isStopped,
          })
          reelTextures[i].needsUpdate = true
        }
      }

      const drawFinal = () => {
        for (let i = 0; i < 3; i += 1) {
          drawReel(reelCanvases[i], players, { stopped: true, winner: winnerOf(), offset: 0 })
          reelTextures[i].needsUpdate = true
        }
      }

      drawAll(performance.now())

      const spillCoins = () => {
        for (let i = 0; i < 36; i += 1) {
          const coin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 0.035, 14),
            new THREE.MeshStandardMaterial({ color: '#ffd23f', metalness: 0.25, roughness: 0.35 }),
          )
          coin.rotation.x = Math.random() * Math.PI
          coin.position.set((Math.random() - 0.5) * 5.6, 5.6 + Math.random(), 0.6 + Math.random() * 1.2)
          coin.userData = {
            vx: (Math.random() - 0.5) * 2.4,
            vy: 1.5 + Math.random() * 2.2,
            vz: (Math.random() - 0.5) * 1.4,
            spin: (Math.random() - 0.5) * 18,
          }
          stage.scene.add(coin)
          state.confetti.push(coin)
        }
      }

      stage.onFrame((dt, elapsed) => {
        cat.position.y = 0.66 + Math.sin(elapsed * 1.6) * 0.04
        cat.userData.paw.rotation.z = 0.7 + Math.sin(elapsed * 2.6) * 0.28

        bulbs.forEach((bulb, index) => {
          const flash = state.done ? 0.95 + Math.sin(elapsed * 12 + index) * 0.5 : 0.6 + Math.sin(elapsed * 2.5 + index * 0.7) * 0.22
          bulb.material.emissiveIntensity = flash
        })

        if (state.spinning) {
          const since = (performance.now() - state.start) / 1000
          for (let i = 0; i < 3; i += 1) {
            if (!rngMeta.stopped[i]) {
              rngMeta.offset[i] += dt * rngMeta.speed[i] * (1 - Math.min(0.65, since / 8))
              if (since >= rngMeta.stopAt[i]) {
                rngMeta.stopped[i] = true
                rngMeta.bounce[i] = 1
                sfx.coin()
              }
            } else if (rngMeta.bounce[i] > 0) {
              rngMeta.bounce[i] = Math.max(0, rngMeta.bounce[i] - dt * 3.5)
              reelMeshes[i].position.y = 2.78 - Math.sin(rngMeta.bounce[i] * Math.PI) * 0.06
            }
          }
          drawAll(performance.now())

          if (since >= rngMeta.stopAt[2]) {
            state.spinning = false
            state.done = true
            state.end = performance.now()
            state.jackpotStart = performance.now()
            drawFinal()
            sfx.win()
            spillCoins()
            setStatus('done')
            setWinnerName(winnerOf().name)
            timers.current.push(
              setTimeout(() => {
                if (finishRef.current) return
                finishRef.current = true
                onFinish({
                  type: 'players',
                  playerIds: [winnerOf().id],
                  headline: t('game.slots.result'),
                  tone: 'pick',
                })
              }, 1100),
            )
          }
        }

        if (state.done) {
          const t = (performance.now() - state.jackpotStart) / 1000
          const pop = t < 0.5 ? easeOutCubic(Math.min(1, t / 0.35)) : 1
          jackpot.scale.setScalar(Math.max(0.001, pop * (1 + Math.sin(t * 5) * 0.025)))
          jackpot.rotation.z = Math.sin(t * 4) * 0.02
          leverPivot.rotation.z = 0.38 + Math.sin(t * 3) * 0.04
        }

        if (state.confetti.length) {
          state.confetti.forEach((coin) => {
            const data = coin.userData
            data.vy -= 9.5 * dt
            coin.position.x += data.vx * dt
            coin.position.y += data.vy * dt
            coin.position.z += data.vz * dt
            coin.rotation.x += data.spin * dt
            coin.rotation.z += data.spin * dt * 0.7
          })
          state.confetti = state.confetti.filter((coin) => {
            if (coin.position.y < -0.2) {
              stage.scene.remove(coin)
              coin.geometry.dispose()
              coin.material.dispose()
              return false
            }
            return true
          })
        }
      })

      const spin = () => {
        if (state.spinning || state.done) return
        const winner = randomInt(players.length)
        winnerIndexRef.value = winner
        rngMeta.offset = [0, 0, 0]
        rngMeta.stopped = [false, false, false]
        rngMeta.bounce = [0, 0, 0]
        rngMeta.lastDraw = 0
        state.start = performance.now()
        state.spinning = true
        state.done = false
        jackpot.scale.setScalar(0.001)
        setStatus('spinning')
        sfx.spin()
        lastTurnTime.value = performance.now()
        leverPivot.rotation.z = -0.32
        timers.current.push(
          setTimeout(() => {
            leverPivot.rotation.z = 0.38
          }, 230),
        )
      }

      stage.onResize(({ aspect }) => {
        if (aspect < 0.7) stage.setCamera([0, 5.7, 17.3], [0, 3, 0])
        else if (aspect < 1.05) stage.setCamera([0, 5.3, 14], [0, 3, 0])
        else stage.setCamera([0, 4.9, 10.9], [0, 2.8, 0])
      })

      return { spin }
    },
  })

  return (
    <div className="game-root slots-root">
      <div className="game-canvas" ref={hostRef} />
      <div className="game-hud">
        <div className="stage-note">{t('game.slots.note')}</div>
        <div className="game-readout">
          <span className="chip">{status === 'done' ? winnerName : t('common.people', { count: players.length })}</span>
        </div>
        <div className="stage-controls">
          <button
            type="button"
            className="btn btn-primary"
            disabled={status !== 'idle'}
            onClick={() => api.current?.spin()}
          >
            <UiIcon name="sparkle" size={17} />
            {status === 'idle' ? t('game.slots.start') : status === 'spinning' ? t('game.slots.running') : t('game.slots.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
