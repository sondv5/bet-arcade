import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStage } from '../../lib/useStage'
import {
  addContactRing,
  easeOutCubic,
  makeBlock,
  makeTextPlane,
  PALETTE,
} from '../../lib/threeKit'
import { randomInt } from '../../lib/random'
import { makeBird } from '../../lib/characters'
import { sfx } from '../../lib/sfx'
import { UiIcon } from '../../components/icons'
import { useI18n } from '../../i18n'
import './plinko.css'

const BOARD_W = 7.6
const BOARD_HALF = BOARD_W / 2
const BALL_R = 0.16
const PEG_R = 0.115
const FLOOR = -3.45
const PEG_TOP = 2.85
const ROW_GAP = 0.58
const ROWS = 7

function shortName(name, max) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

function buildPegs() {
  const pegs = []
  for (let row = 0; row < ROWS; row += 1) {
    const count = row % 2 === 0 ? 7 : 8
    const gap = 0.92
    const start = -((count - 1) * gap) / 2
    for (let i = 0; i < count; i += 1) {
      pegs.push({ x: start + i * gap, y: PEG_TOP - row * ROW_GAP })
    }
  }
  return pegs
}

function simulatePath(pegs, targetIndex, slotWidth, targetX, count) {
  const attempt = (bias, startX) => {
    let x = startX
    let y = 3.14
    let vx = (Math.random() - 0.5) * 0.5
    let vy = 0
    let time = 0
    const dt = 1 / 120
    const points = [{ x, y, t: 0 }]
    const events = []

    for (let step = 0; step < 900; step += 1) {
      vy += -10.2 * dt
      const pull = (targetX - x) * bias
      vx += Math.max(-7, Math.min(7, pull)) * dt
      x += vx * dt
      y += vy * dt
      time += dt

      if (x < -BOARD_HALF + BALL_R) {
        x = -BOARD_HALF + BALL_R
        vx = Math.abs(vx) * 0.45
      } else if (x > BOARD_HALF - BALL_R) {
        x = BOARD_HALF - BALL_R
        vx = -Math.abs(vx) * 0.45
      }

      for (const peg of pegs) {
        const dx = x - peg.x
        const dy = y - peg.y
        const min = BALL_R + PEG_R
        const distSq = dx * dx + dy * dy
        if (distSq < min * min) {
          const dist = Math.sqrt(distSq) || 0.0001
          const nx = dx / dist
          const ny = dy / dist
          x = peg.x + nx * (min + 0.002)
          y = peg.y + ny * (min + 0.002)
          const vn = vx * nx + vy * ny
          if (vn < 0) {
            vx -= 1.38 * vn * nx
            vy -= 1.38 * vn * ny
          }
          vx += (Math.random() - 0.5) * 0.7
          vy += Math.random() * 0.18
          events.push({ t: time, x, y })
        }
      }

      if (y < -1.35) {
        const pullBottom = Math.min(1, dt * (6 + bias * 0.7))
        x += (targetX - x) * pullBottom
        vx *= 0.9
      }

      if (step % 3 === 0) points.push({ x, y, t: time })

      if (y < FLOOR) {
        const slot = Math.max(0, Math.min(Math.floor((x + BOARD_HALF) / slotWidth), count - 1))
        return { points, events, time, slot }
      }
    }
    return null
  }

  for (let attemptIndex = 0; attemptIndex < 80; attemptIndex += 1) {
    const result = attempt(1.5 + attemptIndex * 0.09, (Math.random() - 0.5) * 0.3)
    if (result && result.slot === targetIndex) return result
  }

  for (let attemptIndex = 0; attemptIndex < 80; attemptIndex += 1) {
    const result = attempt(4 + attemptIndex * 0.15, targetX * 0.25)
    if (result && result.slot === targetIndex) return result
  }

  const points = []
  const steps = 90
  for (let i = 0; i <= steps; i += 1) {
    const p = i / steps
    const t = p * 2.2
    points.push({
      x: Math.sin(p * Math.PI * 3) * 0.25 * (1 - p) + targetX * easeOutCubic(p),
      y: 3.14 - (3.14 - FLOOR) * p,
      t,
    })
  }
  return { points, events: [], time: 2.2, slot: targetIndex }
}

export default function PlinkoGame({ players, onFinish }) {
  const { t } = useI18n()
  const hostRef = useRef(null)
  const [status, setStatus] = useState('idle')
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
    position: [0, 4.8, 11.8],
    lookAt: [0, 4, 0],
    setup: (stage) => {
      const board = new THREE.Group()
      board.position.y = 4.25
      stage.scene.add(board)

      const count = players.length
      const slotWidth = BOARD_W / count
      const pegs = buildPegs()

      const ink = '#17161a'
      const frameMat = new THREE.MeshStandardMaterial({ color: ink, roughness: 0.55 })

      const back = makeBlock({
        width: BOARD_W + 0.55,
        height: 7.6,
        depth: 0.32,
        radius: 0.2,
        color: '#c9ebff',
        roughness: 0.88,
      })
      back.position.set(0, -0.25, -0.5)
      board.add(back)

      const inkBack = makeBlock({
        width: BOARD_W + 0.8,
        height: 7.85,
        depth: 0.26,
        radius: 0.22,
        color: ink,
        roughness: 0.6,
      })
      inkBack.position.set(0, -0.25, -0.68)
      board.add(inkBack)

      const leftRail = makeBlock({ width: 0.2, height: 7.3, depth: 0.45, radius: 0.07, color: ink })
      leftRail.position.set(-BOARD_HALF - 0.12, -0.2, 0.08)
      board.add(leftRail)
      const rightRail = leftRail.clone()
      rightRail.position.x = BOARD_HALF + 0.12
      board.add(rightRail)
      const topRail = makeBlock({ width: BOARD_W + 0.5, height: 0.22, depth: 0.45, radius: 0.07, color: ink })
      topRail.position.set(0, 3.45, 0.08)
      board.add(topRail)

      const sign = makeTextPlane('PLINKO', {
        height: 0.44,
        color: ink,
        background: '#ffd23f',
        border: ink,
        borderWidth: 4,
        paddingX: 16,
        paddingY: 6,
        fontSize: 80,
        fontWeight: 800,
      })
      sign.position.set(0, 3.16, 0.28)
      board.add(sign)

      const pegMeshes = []
      const pegGeo = new THREE.CylinderGeometry(PEG_R, PEG_R, 0.28, 14)
      pegGeo.rotateX(Math.PI / 2)
      const pegCapGeo = new THREE.SphereGeometry(PEG_R * 0.7, 10, 8)
      pegs.forEach((peg, index) => {
        const mesh = new THREE.Mesh(pegGeo, frameMat)
        mesh.position.set(peg.x, peg.y, 0.2)
        mesh.castShadow = false
        board.add(mesh)
        pegMeshes.push(mesh)
        const cap = new THREE.Mesh(
          pegCapGeo,
          new THREE.MeshStandardMaterial({
            color: PALETTE[index % PALETTE.length],
            roughness: 0.45,
          }),
        )
        cap.position.set(peg.x, peg.y, 0.36)
        board.add(cap)
      })

      const slotMeshes = []
      for (let i = 0; i < count; i += 1) {
        const x = -BOARD_HALF + slotWidth * (i + 0.5)
        const player = players[i]

        const panel = makeBlock({
          width: Math.max(0.18, slotWidth - 0.12),
          height: 1.9,
          depth: 0.18,
          radius: 0.06,
          color: '#fff7e9',
          roughness: 0.75,
        })
        panel.position.set(x, -2.45, 0.02)
        board.add(panel)

        const strip = makeBlock({
          width: Math.max(0.18, slotWidth - 0.12),
          height: 0.26,
          depth: 0.22,
          radius: 0.05,
          color: player.color,
          roughness: 0.5,
        })
        strip.position.set(x, -3.3, 0.12)
        board.add(strip)

        const label = makeTextPlane(shortName(player.name, count > 8 ? 8 : 14), {
          height: count > 8 ? 0.205 : 0.22,
          color: ink,
          background: '#fffaf1',
          border: ink,
          borderWidth: 3,
          paddingX: 12,
          paddingY: 6,
          radius: 12,
          fontSize: 48,
          maxWidth: count > 8 ? 190 : 280,
        })
        label.position.set(x, -1.15, 0.22)
        board.add(label)

        if (i > 0) {
          const divider = makeBlock({
            width: 0.07,
            height: 1.95,
            depth: 0.3,
            radius: 0.02,
            color: ink,
            roughness: 0.5,
          })
          divider.position.set(-BOARD_HALF + slotWidth * i, -2.45, 0.18)
          board.add(divider)
        }

        const glow = new THREE.Mesh(
          new THREE.PlaneGeometry(Math.max(0.2, slotWidth - 0.08), 1.7),
          new THREE.MeshBasicMaterial({ color: player.color, transparent: true, opacity: 0, toneMapped: false }),
        )
        glow.position.set(x, -2.45, 0.16)
        board.add(glow)

        slotMeshes.push({ panel, strip, label, glow, player, x })
      }

      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(BALL_R, 22, 16),
        new THREE.MeshStandardMaterial({
          color: '#ffd23f',
          emissive: new THREE.Color('#ff9f1c'),
          emissiveIntensity: 0.22,
          metalness: 0.25,
          roughness: 0.26,
        }),
      )
      ball.castShadow = true
      ball.position.set(0, 3.14, 0.55)
      ball.visible = false
      board.add(ball)

      const ballGlow = new THREE.Mesh(
        new THREE.SphereGeometry(BALL_R * 1.9, 16, 12),
        new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.15, depthWrite: false }),
      )
      ball.add(ballGlow)

      const bird = makeBird({ scale: 0.62, color: '#4d9bff' })
      bird.position.set(-2.9, 7.6, 1)
      bird.rotation.y = 0.6
      stage.scene.add(bird)

      const state = {
        running: false,
        done: false,
        start: 0,
        path: null,
        events: [],
        eventIndex: 0,
        duration: 2.4,
        winnerIndex: 0,
        confetti: [],
        landTime: 0,
      }

      const xForPlayer = (index) => -BOARD_HALF + slotWidth * (index + 0.5)

      const burst = (x, color) => {
        for (let i = 0; i < 26; i += 1) {
          const piece = makeBlock({
            width: 0.1,
            height: 0.1,
            depth: 0.1,
            radius: 0.02,
            color: i % 3 === 0 ? '#ffd23f' : color,
            segments: 1,
          })
          piece.position.set(x + (Math.random() - 0.5) * 0.7, 0.4, 0.6)
          piece.userData = {
            vx: (Math.random() - 0.5) * 2.4,
            vy: 1.5 + Math.random() * 2.6,
            vz: (Math.random() - 0.5) * 1.4,
            spin: (Math.random() - 0.5) * 12,
          }
          stage.scene.add(piece)
          state.confetti.push(piece)
        }
      }

      stage.onFrame((dt) => {
        bird.position.y = 7.6 + Math.sin(performance.now() * 0.0015) * 0.05
        bird.userData.wings?.forEach((wing, index) => {
          wing.rotation.z = (index === 0 ? -1 : 1) * Math.sin(performance.now() * 0.007) * 0.4
        })

        if (state.running) {
          const elapsed = (performance.now() - state.start) / 1000
          const progress = Math.min(1, elapsed / state.duration)
          if (state.path && state.path.length) {
            const targetT = progress * state.duration
            let index = 0
            while (index < state.path.length - 2 && state.path[index + 1].t < targetT) index += 1
            const a = state.path[index]
            const b = state.path[Math.min(state.path.length - 1, index + 1)]
            const span = Math.max(0.0001, b.t - a.t)
            const local = Math.max(0, Math.min(1, (targetT - a.t) / span))
            ball.position.x = a.x + (b.x - a.x) * local
            ball.position.y = a.y + (b.y - a.y) * local
          }

          while (
            state.eventIndex < state.events.length &&
            elapsed >= state.events[state.eventIndex].t
          ) {
            state.eventIndex += 1
            sfx.tick()
          }

          if (progress >= 1) {
            state.running = false
            state.done = true
            state.landTime = performance.now()
            ball.position.x = xForPlayer(state.winnerIndex)
            ball.position.y = FLOOR + 0.18
            const slot = slotMeshes[state.winnerIndex]
            sfx.win()
            burst(slot.x, slot.player.color)
            timers.current.push(
              setTimeout(() => {
                if (finishRef.current) return
                finishRef.current = true
                onFinish({
                  type: 'players',
                  playerIds: [slot.player.id],
                  headline: t('game.plinko.result'),
                  tone: 'pick',
                })
              }, 1000),
            )
          }
        }

        if (state.done) {
          const since = (performance.now() - state.landTime) / 1000
          slotMeshes.forEach((slot, index) => {
            const target = index === state.winnerIndex
            slot.glow.material.opacity = target
              ? Math.min(0.5, 0.25 + Math.sin(since * 8) * 0.14)
              : Math.max(0, slot.glow.material.opacity - dt * 1.5)
            slot.label.scale.setScalar(target ? 1 + Math.sin(since * 7) * 0.06 : 1)
          })
          ball.scale.setScalar(1 + Math.sin(since * 5) * 0.04)
          ball.rotation.y += dt * 2
        }

        if (state.confetti.length) {
          state.confetti.forEach((piece) => {
            const data = piece.userData
            data.vy -= 9 * dt
            piece.position.x += data.vx * dt
            piece.position.y += data.vy * dt
            piece.position.z += data.vz * dt
            piece.rotation.x += data.spin * dt
            piece.rotation.y += data.spin * dt * 0.7
          })
          state.confetti = state.confetti.filter((piece) => {
            if (piece.position.y < -0.6) {
              stage.scene.remove(piece)
              piece.geometry.dispose()
              piece.material.dispose()
              return false
            }
            return true
          })
        }
      })

      const drop = () => {
        if (state.running || state.done) return
        const winner = randomInt(count)
        const targetX = xForPlayer(winner)
        const simulation = simulatePath(pegs, winner, slotWidth, targetX, count)
        state.winnerIndex = winner
        state.path = simulation.points
        state.events = simulation.events
        state.eventIndex = 0
        state.duration = Math.max(1.9, Math.min(3.4, simulation.time))
        state.start = performance.now()
        state.running = true
        state.done = false
        ball.visible = true
        ball.position.set(0, 3.14, 0.55)
        ball.scale.setScalar(1)
        sfx.whoosh()
        setStatus('running')
      }

      stage.onResize(({ aspect }) => {
        if (aspect < 0.7) stage.setCamera([0, 7.6, 27], [0, 4.05, 0])
        else if (aspect < 1.05) stage.setCamera([0, 6.1, 19], [0, 4, 0])
        else if (aspect < 1.35) stage.setCamera([0, 5.2, 13.2], [0, 4, 0])
        else stage.setCamera([0, 4.8, 11.8], [0, 4, 0])
      })

      return { drop }
    },
  })

  return (
    <div className="game-root plinko-root">
      <div className="game-canvas" ref={hostRef} />
      <div className="game-hud">
        <div className="stage-note">{t('game.plinko.note')}</div>
        <div className="game-readout">
          <span className="chip">{t('common.people', { count: players.length })}</span>
        </div>
        <div className="stage-controls">
          <button
            type="button"
            className="btn btn-primary"
            disabled={status !== 'idle'}
            onClick={() => api.current?.drop()}
          >
            <UiIcon name="arrowDown" size={17} />
            {status === 'idle'
              ? t('game.plinko.start')
              : status === 'running'
                ? t('game.plinko.running')
                : t('game.plinko.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
