import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStage } from '../../lib/useStage'
import {
  addContactRing,
  easeOutCubic,
  easeOutQuint,
  makeBlock,
  makeTextPlane,
} from '../../lib/threeKit'
import { randomInt } from '../../lib/random'
import { makeBird, makeButterfly, makeRabbit } from '../../lib/characters'
import { sfx } from '../../lib/sfx'
import { UiIcon } from '../../components/icons'
import { useI18n } from '../../i18n'
import './wheel.css'

const TWO_PI = Math.PI * 2

function shortName(name, max) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

function makeWedge(radius, start, end, color, depth) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(Math.cos(start) * radius, Math.sin(start) * radius)
  shape.absarc(0, 0, radius, start, end, false)
  shape.lineTo(0, 0)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    curveSegments: 48,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 2,
  })
  geometry.translate(0, 0, -depth / 2)
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.58,
    metalness: 0.01,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

export default function WheelGame({ players, onFinish }) {
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
    fov: 38,
    position: [0, 4.4, 10.6],
    lookAt: [0, 3, 0],
    setup: (stage) => {
      const wheel = new THREE.Group()
      wheel.position.set(0, 3.12, 0)
      stage.scene.add(wheel)

      const radius = 2.62
      const thickness = 0.36
      const count = players.length
      const slice = TWO_PI / count
      const gap = Math.min(0.016, slice * 0.06)

      const inkMat = new THREE.MeshStandardMaterial({ color: '#17161a', roughness: 0.52 })
      const back = new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.2, radius + 0.2, 0.32, 96), inkMat)
      back.rotation.x = Math.PI / 2
      back.position.z = -0.28
      back.castShadow = true
      back.receiveShadow = true
      wheel.add(back)

      const wedges = []
      players.forEach((player, index) => {
        const start = index * slice + gap / 2
        const end = (index + 1) * slice - gap / 2
        const baseColor = new THREE.Color(player.color)
        const tint = baseColor.clone().offsetHSL(0, 0, index % 2 === 0 ? 0.015 : -0.02)
        const wedge = makeWedge(radius, start, end, tint, thickness)
        wedge.position.z = 0.04
        wheel.add(wedge)
        wedges.push(wedge)
      })

      const labelHeight = count <= 6 ? 0.5 : count <= 10 ? 0.4 : count <= 16 ? 0.32 : 0.27
      const labelChars = count <= 8 ? 18 : count <= 12 ? 14 : count <= 16 ? 11 : 9
      const labelMaxWidth = count <= 8 ? 430 : count <= 12 ? 360 : count <= 16 ? 300 : 250
      players.forEach((player, index) => {
        const mid = (index + 0.5) * slice
        const label = makeTextPlane(shortName(player.name, labelChars), {
          height: labelHeight,
          color: '#17161a',
          background: '#fffaf1',
          border: '#17161a',
          borderWidth: 4,
          paddingX: 16,
          paddingY: 8,
          radius: 14,
          fontSize: 56,
          maxWidth: labelMaxWidth,
        })
        label.position.set(
          Math.cos(mid) * radius * 0.59,
          Math.sin(mid) * radius * 0.59,
          thickness / 2 + 0.075,
        )
        label.rotation.z = mid + (Math.cos(mid) < 0 ? Math.PI : 0)
        wheel.add(label)
      })

      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(radius + 0.16, 0.065, 8, 100),
        new THREE.MeshStandardMaterial({ color: '#17161a', roughness: 0.42 }),
      )
      rim.position.z = 0.06
      wheel.add(rim)

      const bulbMaterial = new THREE.MeshStandardMaterial({
        color: '#fff4d0',
        emissive: new THREE.Color('#ffd23f'),
        emissiveIntensity: 0.35,
        roughness: 0.35,
      })
      const bulbs = []
      const bulbCount = 20
      for (let i = 0; i < bulbCount; i += 1) {
        const angle = (i / bulbCount) * TWO_PI
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.082, 12, 10), bulbMaterial)
        bulb.position.set(
          Math.cos(angle) * (radius + 0.32),
          Math.sin(angle) * (radius + 0.32),
          0.08,
        )
        wheel.add(bulb)
        bulbs.push(bulb)
      }

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.42, 48), inkMat)
      hub.rotation.x = Math.PI / 2
      hub.position.z = 0.3
      hub.castShadow = true
      wheel.add(hub)

      const hubCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.1, 40),
        new THREE.MeshStandardMaterial({ color: '#fffaf1', roughness: 0.45 }),
      )
      hubCap.rotation.x = Math.PI / 2
      hubCap.position.z = 0.54
      wheel.add(hubCap)

      const hubDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 16, 12),
        new THREE.MeshStandardMaterial({ color: '#ff4d6d', roughness: 0.4 }),
      )
      hubDot.position.z = 0.62
      wheel.add(hubDot)

      const pointerGroup = new THREE.Group()
      const pointerX = radius + 0.6
      pointerGroup.position.set(pointerX, 3.12, 0.65)
      const pointerShape = new THREE.Shape()
      pointerShape.moveTo(0.34, 0.4)
      pointerShape.lineTo(0.34, -0.4)
      pointerShape.lineTo(-0.42, 0)
      pointerShape.closePath()
      const pointerGeo = new THREE.ExtrudeGeometry(pointerShape, {
        depth: 0.16,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 2,
      })
      pointerGeo.translate(0, 0, -0.08)
      const pointer = new THREE.Mesh(
        pointerGeo,
        new THREE.MeshStandardMaterial({ color: '#17161a', roughness: 0.45 }),
      )
      pointer.castShadow = true
      pointerGroup.add(pointer)
      const pointerFace = new THREE.Mesh(
        pointerGeo.clone(),
        new THREE.MeshStandardMaterial({ color: '#ffd23f', roughness: 0.45 }),
      )
      pointerFace.scale.set(0.8, 0.75, 1)
      pointerFace.position.set(0.02, 0, 0.08)
      pointerGroup.add(pointerFace)
      stage.scene.add(pointerGroup)

      const baseInk = makeBlock({
        width: 4.9,
        height: 0.2,
        depth: 2.05,
        radius: 0.13,
        color: '#17161a',
        roughness: 0.7,
      })
      baseInk.position.y = 0.1
      stage.scene.add(baseInk)

      const base = makeBlock({
        width: 4.55,
        height: 0.36,
        depth: 1.8,
        radius: 0.18,
        color: '#e6dcff',
        roughness: 0.85,
      })
      base.position.set(0, 0.32, 0.05)
      stage.scene.add(base)

      addContactRing(stage.scene, { inner: 3.5, outer: 3.62, color: '#dfd1bd', opacity: 0.7 })

      const rabbit = makeRabbit({ scale: 0.85 })
      rabbit.position.set(-3.35, 0.5, 0.9)
      rabbit.rotation.y = 0.85
      stage.scene.add(rabbit)

      const bird = makeBird({ scale: 0.7, color: '#ffd23f' })
      bird.position.set(3.35, 0.5, 0.7)
      bird.rotation.y = -0.9
      stage.scene.add(bird)

      const butterflies = []
      for (let i = 0; i < 3; i += 1) {
        const butterfly = makeButterfly({
          scale: 0.85 + i * 0.15,
          colorA: i === 0 ? '#ff6fb5' : i === 1 ? '#ffd23f' : '#9b7bff',
          colorB: '#fff3d4',
        })
        const base = new THREE.Vector3([-4.1, 0, 4.1][i], [2.4, 6.05, 3.6][i], 0.6)
        butterfly.position.copy(base)
        stage.scene.add(butterfly)
        butterflies.push({ butterfly, base, phase: i * 2.1 })
      }

      const state = {
        spinning: false,
        done: false,
        target: 0,
        start: 0,
        duration: 4800,
        from: 0,
        to: 0,
        endTime: 0,
        lastTick: 0,
        lastIndex: -1,
        winnerMat: null,
        pointerBaseX: pointerX,
        confetti: [],
      }

      const spillConfetti = () => {
        const colors = players.map((player) => player.color)
        for (let i = 0; i < 48; i += 1) {
          const piece = makeBlock({
            width: 0.13,
            height: 0.13,
            depth: 0.13,
            radius: 0.03,
            color: colors[i % colors.length],
            segments: 1,
          })
          piece.position.set(
            (Math.random() - 0.5) * 5.6,
            6.2 + Math.random() * 0.8,
            0.6 + Math.random() * 0.8,
          )
          piece.userData = {
            vx: (Math.random() - 0.5) * 2.2,
            vy: 1 + Math.random() * 2.6,
            vz: (Math.random() - 0.5) * 1.4,
            spinX: (Math.random() - 0.5) * 10,
            spinY: (Math.random() - 0.5) * 10,
          }
          stage.scene.add(piece)
          state.confetti.push(piece)
        }
      }

      stage.onFrame((dt, elapsed) => {
        bulbs.forEach((bulb, index) => {
          bulb.material.emissiveIntensity = 0.24 + Math.sin(elapsed * 2.2 + index * 0.6) * 0.14
        })

        rabbit.position.y = 0.5 + Math.sin(elapsed * 1.7) * 0.04
        rabbit.userData.ears?.forEach((ear, index) => {
          ear.rotation.z = (index % 2 === 0 ? 0.13 : -0.13) + Math.sin(elapsed * 2.5 + index) * 0.08
        })
        bird.position.y = 0.5 + Math.sin(elapsed * 1.4) * 0.05
        bird.rotation.y = -0.9 + Math.sin(elapsed * 0.6) * 0.2
        bird.userData.wings?.forEach((wing, index) => {
          wing.rotation.z = (index === 0 ? -1 : 1) * Math.sin(elapsed * 7) * 0.45
        })

        butterflies.forEach(({ butterfly, base, phase }) => {
          const angle = elapsed * 0.55 + phase
          butterfly.position.x = base.x + Math.cos(angle) * 0.55
          butterfly.position.y = base.y + Math.sin(elapsed * 1.6 + phase) * 0.2
          butterfly.position.z = base.z + Math.sin(angle * 0.7) * 0.3
          butterfly.userData.wings?.forEach((wing, index) => {
            wing.rotation.y = (index % 2 === 0 ? 1 : -1) * (0.35 + Math.abs(Math.sin(elapsed * 9 + phase)) * 0.9)
          })
        })

        if (state.spinning) {
          const progress = Math.min(1, (performance.now() - state.start) / state.duration)
          const eased = easeOutQuint(progress)
          wheel.rotation.z = state.from + (state.to - state.from) * eased

          const normalized = ((-wheel.rotation.z % TWO_PI) + TWO_PI) % TWO_PI
          const under = Math.floor(normalized / slice) % count
          const now = performance.now()
          if (progress > 0.42 && under !== state.lastIndex && now - state.lastTick > 48) {
            state.lastIndex = under
            state.lastTick = now
            sfx.tick()
          }

          if (progress >= 1) {
            state.spinning = false
            state.done = true
            state.endTime = performance.now()
            wheel.rotation.z = state.to
            const winnerMat = wedges[state.target]?.material
            if (winnerMat) {
              state.winnerMat = winnerMat
              winnerMat.emissiveIntensity = 0.3
            }
            sfx.win()
            spillConfetti()
            setStatus('done')
            timers.current.push(
              setTimeout(() => {
                if (finishRef.current) return
                finishRef.current = true
                const winner = players[state.target]
                onFinish({
                  type: 'players',
                  playerIds: [winner.id],
                  headline: t('game.wheel.result'),
                  tone: 'pick',
                })
              }, 950),
            )
          }
        }

        if (state.winnerMat && state.done) {
          const t = (performance.now() - state.endTime) / 1000
          state.winnerMat.emissiveIntensity = Math.max(
            0.08,
            0.22 + Math.sin(t * 9) * 0.16 * Math.max(0, 1 - t / 2.4),
          )
        }

        if (state.done) {
          const t = (performance.now() - state.endTime) / 1000
          pointerGroup.position.x = state.pointerBaseX - Math.sin(t * 12) * 0.09 * Math.max(0, 1 - t / 1.4)
        }

        if (state.confetti.length) {
          state.confetti.forEach((piece) => {
            const data = piece.userData
            data.vy -= 9.5 * dt
            piece.position.x += data.vx * dt
            piece.position.y += data.vy * dt
            piece.position.z += data.vz * dt
            piece.rotation.x += data.spinX * dt
            piece.rotation.y += data.spinY * dt
          })
          state.confetti = state.confetti.filter((piece) => {
            if (piece.position.y < -0.4) {
              stage.scene.remove(piece)
              piece.geometry.dispose()
              piece.material.dispose()
              return false
            }
            return true
          })
        }
      })

      const spin = () => {
        if (state.spinning || state.done) return
        setStatus('spinning')
        sfx.spin()
        const target = randomInt(count)
        const sliceAngle = TWO_PI / count
        const center = (target + 0.5) * sliceAngle
        const jitter = (Math.random() - 0.5) * sliceAngle * 0.4
        const current = wheel.rotation.z
        const desired = -center + jitter
        const delta = ((desired - current) % TWO_PI + TWO_PI) % TWO_PI
        state.target = target
        state.from = current
        state.to = current + TWO_PI * 6 + delta
        state.start = performance.now()
        state.lastTick = 0
        state.lastIndex = -1
        state.spinning = true
        state.done = false
      }

      stage.onResize(({ aspect }) => {
        if (aspect < 0.72) stage.setCamera([0, 5.9, 21.4], [0, 3.05, 0])
        else if (aspect < 1.05) stage.setCamera([0, 4.9, 13.6], [0, 3, 0])
        else if (aspect < 1.35) stage.setCamera([0, 4.6, 11.6], [0, 3, 0])
        else stage.setCamera([0, 4.4, 10.4], [0, 3, 0])
      })

      return { spin }
    },
  })

  return (
    <div className="game-root wheel-root">
      <div className="game-canvas" ref={hostRef} />
      <div className="game-hud">
        <div className="stage-note">{t('game.wheel.note')}</div>
        <div className="game-readout">
          <span className="chip">{t('common.people', { count: players.length })}</span>
        </div>
        <div className="stage-controls">
          <button
            type="button"
            className="btn btn-primary"
            disabled={status !== 'idle'}
            onClick={() => api.current?.spin()}
          >
            <UiIcon name="shuffle" size={17} />
            {status === 'idle' ? t('game.wheel.start') : status === 'spinning' ? t('game.wheel.running') : t('game.wheel.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
