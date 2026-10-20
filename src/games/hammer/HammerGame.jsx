import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStage } from '../../lib/useStage'
import {
  addContactRing,
  easeInOutCubic,
  easeOutCubic,
  makeBlock,
  makeTextPlane,
} from '../../lib/threeKit'
import { randomInt } from '../../lib/random'
import { makePlayerAvatar } from '../../lib/characters'
import { sfx } from '../../lib/sfx'
import { UiIcon } from '../../components/icons'
import { useI18n } from '../../i18n'
import './hammer.css'

export default function HammerGame({ players, onFinish }) {
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
    position: [0, 7.6, 16.2],
    lookAt: [0, 3.2, 0],
    setup: (stage) => {
      const world = new THREE.Group()
      stage.scene.add(world)

      const count = players.length
      const circleRadius = 1.9 + count * 0.16
      const platformRadius = circleRadius + 1.05
      const platformTop = 0.55
      const blockSize = 0.95
      const characterHeight = 1.3
      const blockRadius = circleRadius

      const ink = '#17161a'
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(platformRadius + 0.18, platformRadius + 0.18, 0.24, 64),
        new THREE.MeshStandardMaterial({ color: ink, roughness: 0.6 }),
      )
      base.position.y = 0.12
      base.receiveShadow = true
      world.add(base)

      const arena = new THREE.Mesh(
        new THREE.CylinderGeometry(platformRadius, platformRadius, 0.42, 64),
        new THREE.MeshStandardMaterial({ color: '#ffe0a1', roughness: 0.85 }),
      )
      arena.position.y = 0.36
      arena.castShadow = true
      arena.receiveShadow = true
      world.add(arena)

      const arenaTop = new THREE.Mesh(
        new THREE.CylinderGeometry(platformRadius - 0.16, platformRadius - 0.16, 0.06, 64),
        new THREE.MeshStandardMaterial({ color: '#fff0c9', roughness: 0.8 }),
      )
      arenaTop.position.y = 0.59
      arenaTop.receiveShadow = true
      world.add(arenaTop)

      const arenaRing = new THREE.Mesh(
        new THREE.TorusGeometry(platformRadius - 0.28, 0.055, 8, 80),
        new THREE.MeshStandardMaterial({ color: '#ff4d6d', roughness: 0.5 }),
      )
      arenaRing.rotation.x = -Math.PI / 2
      arenaRing.position.y = 0.62
      world.add(arenaRing)

      addContactRing(stage.scene, { inner: platformRadius + 0.8, outer: platformRadius + 0.92, color: '#ddceba', opacity: 0.65 })

      const angleOffset = Math.PI / 2 + Math.PI / count
      const blocks = players.map((player, index) => {
        const angle = (index / count) * Math.PI * 2 + angleOffset
        const group = makePlayerAvatar(player, index, {
          height: characterHeight,
          labelHeight: count > 10 ? 0.28 : 0.34,
          labelBackground: '#fffaf1',
        })
        group.position.set(
          Math.cos(angle) * blockRadius,
          platformTop,
          Math.sin(angle) * blockRadius,
        )
        group.rotation.y = 0
        group.userData.baseY = platformTop
        group.userData.phase = index * 0.7
        world.add(group)
        return group
      })

      const angleFor = (index) => (index / count) * Math.PI * 2 + angleOffset

      const aimGroup = new THREE.Group()
      aimGroup.position.y = platformTop + 0.04
      aimGroup.visible = false
      world.add(aimGroup)

      const aimRing = new THREE.Mesh(
        new THREE.RingGeometry(0.72, 0.94, 40),
        new THREE.MeshBasicMaterial({
          color: '#ffd23f',
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
          depthWrite: false,
          toneMapped: false,
        }),
      )
      aimRing.rotation.x = -Math.PI / 2
      aimRing.position.set(blockRadius, 0, 0)
      aimGroup.add(aimRing)

      const aimInner = new THREE.Mesh(
        new THREE.RingGeometry(0.22, 0.34, 32),
        new THREE.MeshBasicMaterial({
          color: '#ff4d6d',
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
          depthWrite: false,
          toneMapped: false,
        }),
      )
      aimInner.rotation.x = -Math.PI / 2
      aimInner.position.set(blockRadius, 0.01, 0)
      aimGroup.add(aimInner)

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.95, 4.2, 24, 1, true),
        new THREE.MeshBasicMaterial({
          color: '#ffd23f',
          transparent: true,
          opacity: 0.055,
          side: THREE.DoubleSide,
          depthWrite: false,
          toneMapped: false,
        }),
      )
      beam.position.set(blockRadius, 2.1, 0)
      aimGroup.add(beam)

      const hammer = new THREE.Group()
      const hammerHeadY = 0
      hammer.position.set(0, 7.1, 0)
      world.add(hammer)

      const headInk = makeBlock({ width: 2.55, height: 1.02, depth: 1.3, radius: 0.13, color: ink, roughness: 0.55 })
      headInk.position.y = hammerHeadY
      hammer.add(headInk)

      const head = makeBlock({ width: 2.32, height: 0.84, depth: 1.16, radius: 0.12, color: '#f5e7d3', roughness: 0.62 })
      head.position.set(0, hammerHeadY, 0.09)
      hammer.add(head)

      const stripe = makeBlock({ width: 2.4, height: 0.23, depth: 1.22, radius: 0.06, color: '#ff4d6d', roughness: 0.5 })
      stripe.position.set(0, hammerHeadY + 0.11, 0.11)
      hammer.add(stripe)

      const hammerLabel = makeTextPlane('BÉT!', {
        height: 0.33,
        color: '#17161a',
        background: '#ffd23f',
        border: '#17161a',
        borderWidth: 4,
        paddingX: 12,
        paddingY: 5,
        fontSize: 62,
        fontWeight: 800,
      })
      hammerLabel.position.set(0, hammerHeadY - 0.18, 0.7)
      hammer.add(hammerLabel)

      const handle = makeBlock({ width: 0.3, height: 3.5, depth: 0.3, radius: 0.07, color: ink, roughness: 0.5 })
      handle.position.set(0, 2.25, 0)
      hammer.add(handle)

      for (let i = 0; i < 3; i += 1) {
        const grip = new THREE.Mesh(
          new THREE.CylinderGeometry(0.21, 0.21, 0.18, 14),
          new THREE.MeshStandardMaterial({ color: '#ffd23f', roughness: 0.5 }),
        )
        grip.position.set(0, 3.1 + i * 0.5, 0)
        hammer.add(grip)
      }

      const hammerCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 18, 12),
        new THREE.MeshStandardMaterial({ color: '#ff4d6d', roughness: 0.45 }),
      )
      hammerCap.position.set(0, 4.05, 0)
      hammer.add(hammerCap)

      const flash = new THREE.PointLight(0xffd166, 0, 14)
      flash.position.set(0, 2.2, 2)
      world.add(flash)

      const shockwaveMat = new THREE.MeshBasicMaterial({
        color: '#ffd23f',
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      })
      const shockwave = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.85, 48), shockwaveMat)
      shockwave.rotation.x = -Math.PI / 2
      shockwave.position.y = 0.7
      shockwave.visible = false
      world.add(shockwave)

      const state = {
        running: false,
        done: false,
        start: 0,
        target: 0,
        targetAngle: 0,
        hammerX: 0,
        hammerZ: 0,
        ringFrom: 0,
        ringTo: 0,
        impact: 0,
        confetti: [],
        shake: 0,
      }

      const burst = (color) => {
        for (let i = 0; i < 22; i += 1) {
          const debris = makeBlock({
            width: 0.12 + Math.random() * 0.12,
            height: 0.12 + Math.random() * 0.12,
            depth: 0.12 + Math.random() * 0.12,
            radius: 0.02,
            color: i % 4 === 0 ? '#17161a' : i % 3 === 0 ? '#ffd23f' : color,
            segments: 1,
          })
          debris.position.set(state.hammerX, 1.6, state.hammerZ)
          debris.userData = {
            vx: (Math.random() - 0.5) * 4.5,
            vy: 1.5 + Math.random() * 3.6,
            vz: (Math.random() - 0.5) * 4.5,
            spinX: (Math.random() - 0.5) * 14,
            spinY: (Math.random() - 0.5) * 14,
          }
          world.add(debris)
          state.confetti.push(debris)
        }
      }

      stage.onFrame((dt, elapsed) => {
        blocks.forEach((block, index) => {
          const phase = block.userData.phase
          if (!state.done || index !== state.target) {
            block.position.y = platformTop + Math.sin(elapsed * 1.8 + phase) * 0.02
            block.rotation.z = Math.sin(elapsed * 1.1 + phase) * 0.014
          }
        })

        if (state.running) {
          const since = (performance.now() - state.start) / 1000
          if (since < 1.75) {
            const p = easeOutCubic(Math.min(1, since / 1.75))
            aimGroup.rotation.y = state.ringFrom + (state.ringTo - state.ringFrom) * p
            const pulse = 1 + Math.sin(since * 16) * 0.08
            aimRing.scale.setScalar(pulse)
            aimInner.scale.setScalar(1 + Math.sin(since * 20) * 0.16)
            hammer.position.x = 0
            hammer.position.z = 0
            hammer.position.y = 7.1 + Math.sin(elapsed * 2) * 0.08
            hammer.rotation.z = Math.sin(elapsed * 1.4) * 0.035
          } else if (since < 2.35) {
            const p = easeInOutCubic(Math.min(1, (since - 1.75) / 0.6))
            aimGroup.rotation.y = state.ringTo
            aimRing.scale.setScalar(1 + Math.sin(elapsed * 18) * 0.06)
            hammer.position.x = state.hammerX * p
            hammer.position.z = state.hammerZ * p
            hammer.position.y = 7.1
            hammer.rotation.z = 0
          } else if (since < 2.85) {
            aimGroup.rotation.y = state.ringTo
            const p = Math.min(1, (since - 2.35) / 0.5)
            hammer.position.x = state.hammerX
            hammer.position.z = state.hammerZ
            hammer.position.y = 7.1 + Math.sin(p * Math.PI) * 0.65
            hammer.rotation.z = Math.sin(p * Math.PI) * 0.1
            aimRing.scale.setScalar(1 + p * 0.18)
          } else if (!state.done) {
            const p = Math.min(1, (since - 2.85) / 0.28)
            const eased = p * p * p
            hammer.position.x = state.hammerX
            hammer.position.z = state.hammerZ
            hammer.position.y = 7.75 - 5.95 * eased
            hammer.rotation.z = 0.1 * (1 - p)
            aimRing.scale.setScalar(1.18 - p * 0.18)

            if (p >= 1) {
              state.done = true
              state.impact = performance.now()
              state.shake = 0.75
              const block = blocks[state.target]
              block.userData.body.scale.set(1.12, 0.26, 1.12)
              block.userData.label.visible = false
              shockwave.visible = true
              shockwave.scale.setScalar(0.2)
              shockwaveMat.opacity = 0.75
              flash.intensity = 32
              aimGroup.visible = false
              burst(players[state.target].color)
              sfx.boom()
              sfx.lose()
              setStatus('done')
              timers.current.push(
                setTimeout(() => {
                  if (finishRef.current) return
                  finishRef.current = true
                  onFinish({
                    type: 'players',
                    playerIds: [players[state.target].id],
                    headline: t('game.hammer.result'),
                    tone: 'lose',
                  })
                }, 1150),
              )
            }
          }
        }

        if (state.done) {
          const since = (performance.now() - state.impact) / 1000
          shockwave.scale.setScalar(0.6 + since * 4.6)
          shockwaveMat.opacity = Math.max(0, 0.65 - since * 0.9)
          flash.intensity = Math.max(0, 32 - since * 60)
          if (since > 0.8) shockwave.visible = false
          hammer.position.y = 1.8 - Math.sin(Math.min(1, since * 6) * Math.PI) * 0.07
        }

        if (state.shake > 0) {
          state.shake = Math.max(0, state.shake - dt * 2.2)
          const amp = state.shake * 0.09
          world.position.x = Math.sin(performance.now() * 0.09) * amp
          world.position.z = Math.cos(performance.now() * 0.11) * amp * 0.7
        } else {
          world.position.x = 0
          world.position.z = 0
        }

        if (state.confetti.length) {
          state.confetti.forEach((piece) => {
            const data = piece.userData
            data.vy -= 12 * dt
            piece.position.x += data.vx * dt
            piece.position.y += data.vy * dt
            piece.position.z += data.vz * dt
            piece.rotation.x += data.spinX * dt
            piece.rotation.y += data.spinY * dt
            if (piece.position.y < 0.2) {
              piece.position.y = 0.2
              data.vy *= -0.35
              data.vx *= 0.8
              data.vz *= 0.8
            }
          })
        }
      })

      const slam = () => {
        if (state.running || state.done) return
        const target = randomInt(count)
        const angle = angleFor(target)
        state.target = target
        state.targetAngle = angle
        state.hammerX = Math.cos(angle) * blockRadius
        state.hammerZ = Math.sin(angle) * blockRadius
        state.ringFrom = aimGroup.rotation.y
        const desired = -angle
        const current = aimGroup.rotation.y
        const delta = ((desired - current) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
        state.ringTo = current + Math.PI * 4 + delta
        state.start = performance.now()
        state.running = true
        state.done = false
        aimGroup.visible = true
        shockwave.visible = false
        sfx.drumroll(1.7)
        setStatus('running')
      }

      const fitCamera = (aspect) => {
        const vFov = (37 * Math.PI) / 180
        const requiredWidth = (platformRadius + 0.6) * 2
        const distance = Math.max(
          15.2,
          requiredWidth / (2 * Math.tan(vFov / 2) * Math.max(0.4, aspect)) + 1.5,
          8.6 / (2 * Math.tan(vFov / 2)) + 2.5,
        )
        const cameraY = Math.min(11.5, 4.4 + distance * 0.2)
        stage.setCamera([0, cameraY, distance], [0, 3.2, 0])
      }

      stage.onResize(({ aspect }) => fitCamera(aspect))

      return { slam }
    },
  })

  return (
    <div className="game-root hammer-root">
      <div className="game-canvas" ref={hostRef} />
      <div className="game-hud">
        <div className="stage-note">{t('game.hammer.note')}</div>
        <div className="game-readout">
          <span className="chip">{t('common.people', { count: players.length })}</span>
        </div>
        <div className="stage-controls">
          <button
            type="button"
            className="btn btn-primary"
            disabled={status !== 'idle'}
            onClick={() => api.current?.slam()}
          >
            <UiIcon name="arrowDown" size={17} />
            {status === 'idle'
              ? t('game.hammer.start')
              : status === 'running'
                ? t('game.hammer.running')
                : t('game.hammer.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
