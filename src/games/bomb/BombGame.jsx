import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStage } from '../../lib/useStage'
import {
  addContactRing,
  easeInOutCubic,
  easeOutCubic,
  makeBlock,
  makeTextSprite,
} from '../../lib/threeKit'
import { randomInt } from '../../lib/random'
import { makePlayerAvatar } from '../../lib/characters'
import { sfx } from '../../lib/sfx'
import { UiIcon } from '../../components/icons'
import { useI18n } from '../../i18n'
import './bomb.css'

export default function BombGame({ players, onFinish }) {
  const { t } = useI18n()
  const hostRef = useRef(null)
  const fuseRef = useRef(null)
  const flashRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [holderName, setHolderName] = useState('')
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
    position: [0, 6.3, 12.4],
    lookAt: [0, 2.2, 0],
    setup: (stage) => {
      const world = new THREE.Group()
      stage.scene.add(world)

      const count = players.length
      const circleRadius = 1.65 + count * 0.14
      const platformRadius = circleRadius + 0.95
      const platformTop = 0.5
      const blockSize = 0.86
      const characterHeight = 1.25
      const ink = '#17161a'

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(platformRadius + 0.15, platformRadius + 0.15, 0.22, 64),
        new THREE.MeshStandardMaterial({ color: ink, roughness: 0.58 }),
      )
      base.position.y = 0.11
      base.receiveShadow = true
      world.add(base)

      const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(platformRadius, platformRadius, 0.38, 64),
        new THREE.MeshStandardMaterial({ color: '#c9f7e4', roughness: 0.86 }),
      )
      platform.position.y = 0.31
      platform.castShadow = true
      platform.receiveShadow = true
      world.add(platform)

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(platformRadius - 0.35, 0.05, 8, 80),
        new THREE.MeshStandardMaterial({ color: '#ff8f6b', roughness: 0.5 }),
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.y = platformTop + 0.03
      world.add(ring)

      addContactRing(stage.scene, { inner: platformRadius + 0.7, outer: platformRadius + 0.82, color: '#dcccb8', opacity: 0.65 })

      const blocks = []
      const angleOffset = Math.PI / 2 + Math.PI / count
      const positions = players.map((player, index) => {
        const angle = (index / count) * Math.PI * 2 + angleOffset
        const x = Math.cos(angle) * circleRadius
        const z = Math.sin(angle) * circleRadius
        const block = makePlayerAvatar(player, index, {
          height: characterHeight,
          labelHeight: count > 12 ? 0.24 : 0.3,
          labelBackground: '#fffaf1',
        })
        block.position.set(x, platformTop, z)
        block.rotation.y = 0
        block.userData.baseY = platformTop
        block.userData.phase = index * 0.8
        world.add(block)
        blocks.push(block)
        return { x, z, angle }
      })

      const bomb = new THREE.Group()
      const bombBody = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.3, 2),
        new THREE.MeshStandardMaterial({ color: '#242126', roughness: 0.38, metalness: 0.1 }),
      )
      bombBody.castShadow = true
      bomb.add(bombBody)

      const bombBand = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.035, 8, 28),
        new THREE.MeshStandardMaterial({ color: '#ff4d6d', roughness: 0.45 }),
      )
      bombBand.rotation.x = Math.PI / 2
      bomb.add(bombBand)

      const fuseCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.1, 0.25, 0),
        new THREE.Vector3(0.34, 0.62, 0),
        new THREE.Vector3(0.6, 0.82, 0.06),
        new THREE.Vector3(0.78, 1.05, 0),
      ])
      const fuse = new THREE.Mesh(
        new THREE.TubeGeometry(fuseCurve, 16, 0.028, 5, false),
        new THREE.MeshStandardMaterial({ color: '#5b4131', roughness: 0.8 }),
      )
      bomb.add(fuse)

      const spark = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 10, 8),
        new THREE.MeshStandardMaterial({
          color: '#ffd23f',
          emissive: new THREE.Color('#ff8f1f'),
          emissiveIntensity: 1.4,
          roughness: 0.3,
        }),
      )
      spark.position.set(0.8, 1.07, 0)
      bomb.add(spark)

      const bombRing = new THREE.Mesh(
        new THREE.RingGeometry(0.38, 0.5, 24),
        new THREE.MeshBasicMaterial({
          color: '#ffd23f',
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
          depthWrite: false,
          toneMapped: false,
        }),
      )
      bombRing.rotation.x = -Math.PI / 2
      bombRing.position.y = -0.15
      bomb.add(bombRing)

      const holderMark = new THREE.Mesh(
        new THREE.RingGeometry(blockSize * 0.72, blockSize * 0.92, 32),
        new THREE.MeshBasicMaterial({
          color: '#ffd23f',
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false,
          toneMapped: false,
        }),
      )
      holderMark.rotation.x = -Math.PI / 2
      holderMark.position.y = platformTop + 0.025
      world.add(holderMark)

      const boomText = makeTextSprite(t('game.bomb.done'), {
        height: 0.78,
        color: '#fffaf1',
        background: '#ff4d6d',
        border: '#17161a',
        borderWidth: 7,
        paddingX: 20,
        paddingY: 8,
        fontSize: 96,
        fontWeight: 800,
      })
      boomText.visible = false
      world.add(boomText)

      const shockwaveMat = new THREE.MeshBasicMaterial({
        color: '#ffd23f',
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      })
      const shockwave = new THREE.Mesh(new THREE.RingGeometry(0.6, 1.1, 48), shockwaveMat)
      shockwave.rotation.x = -Math.PI / 2
      shockwave.position.y = platformTop + 0.05
      shockwave.visible = false
      world.add(shockwave)

      const flash = new THREE.PointLight(0xff7a45, 0, 16)
      flash.position.set(0, 2.5, 2)
      world.add(flash)

      const state = {
        running: false,
        done: false,
        start: 0,
        explodeAt: 0,
        duration: 0,
        holder: 0,
        from: { x: 0, z: 0 },
        to: { x: 0, z: 0 },
        hopStart: 0,
        hopping: false,
        nextHopAt: 0,
        hopDuration: 280,
        lastBeep: 0,
        confetti: [],
        impact: 0,
        shake: 0,
      }

      const placeBomb = (index, instant = true) => {
        const pos = positions[index]
        bomb.position.set(pos.x, platformTop + characterHeight + 0.5, pos.z)
        holderMark.position.set(pos.x, platformTop + 0.025, pos.z)
        if (instant) {
          state.from = { x: pos.x, z: pos.z }
          state.to = { x: pos.x, z: pos.z }
        }
      }

      placeBomb(0, true)
      bomb.visible = true
      bomb.position.set(0, 1.7, 0)
      holderMark.material.opacity = 0

      const burst = (color) => {
        for (let i = 0; i < 30; i += 1) {
          const piece = makeBlock({
            width: 0.1 + Math.random() * 0.14,
            height: 0.1 + Math.random() * 0.14,
            depth: 0.1 + Math.random() * 0.14,
            radius: 0.02,
            color: i % 4 === 0 ? color : i % 3 === 0 ? '#ffd23f' : '#2a252a',
            segments: 1,
          })
          piece.position.set(bomb.position.x, bomb.position.y, bomb.position.z)
          piece.userData = {
            vx: (Math.random() - 0.5) * 5.5,
            vy: 2 + Math.random() * 4,
            vz: (Math.random() - 0.5) * 5.5,
            spinX: (Math.random() - 0.5) * 16,
            spinY: (Math.random() - 0.5) * 16,
          }
          world.add(piece)
          state.confetti.push(piece)
        }
      }

      const explode = () => {
        if (state.done) return
        state.done = true
        state.hopping = false
        state.impact = performance.now()
        state.shake = 1
        const loserIndex = state.holder
        bomb.visible = false
        holderMark.material.opacity = 0
        boomText.position.set(bomb.position.x, 2.2, bomb.position.z + 0.5)
        boomText.visible = true
        boomText.scale.setScalar(0.001)
        shockwave.visible = true
        shockwave.position.x = bomb.position.x
        shockwave.position.z = bomb.position.z
        shockwave.scale.setScalar(0.2)
        shockwaveMat.opacity = 0.8
        flash.position.set(bomb.position.x, 2.5, bomb.position.z)
        flash.intensity = 55
        burst(players[loserIndex].color)
        const loserBlock = blocks[loserIndex]
        loserBlock.userData.label.visible = false
        if (flashRef.current) {
          flashRef.current.classList.remove('is-on')
          void flashRef.current.offsetWidth
          flashRef.current.classList.add('is-on')
        }
        sfx.boom()
        sfx.lose()
        if (fuseRef.current) fuseRef.current.style.width = '0%'
        setStatus('done')
        timers.current.push(
          setTimeout(() => {
            if (finishRef.current) return
            finishRef.current = true
            onFinish({
              type: 'players',
              playerIds: [players[loserIndex].id],
              headline: t('game.bomb.result'),
              tone: 'lose',
            })
          }, 1200),
        )
      }

      stage.onFrame((dt, elapsed) => {
        blocks.forEach((block, index) => {
          if (state.done && index === state.holder) return
          const phase = block.userData.phase
          block.position.y = platformTop + Math.sin(elapsed * 1.9 + phase) * 0.02
          block.rotation.z = Math.sin(elapsed * 1.3 + phase) * 0.012
        })

        if (!state.running) {
          if (bomb.visible) {
            bomb.position.y = 1.7 + Math.sin(elapsed * 2) * 0.08
            bomb.rotation.y += dt * 0.5
            spark.scale.setScalar(1 + Math.sin(elapsed * 10) * 0.25)
            bombRing.rotation.z += dt * 1.4
          }
          return
        }

        const since = (performance.now() - state.start) / 1000
        const remaining = state.explodeAt - performance.now()
        if (fuseRef.current) {
          const ratio = Math.max(0, Math.min(1, remaining / state.duration))
          fuseRef.current.style.width = `${ratio * 100}%`
        }

        spark.scale.setScalar(1 + Math.sin(elapsed * 18) * 0.35)
        bombRing.rotation.z += dt * 2.5
        holderMark.material.opacity = 0.45 + Math.sin(elapsed * 7) * 0.18

        if (state.hopping) {
          const p = Math.min(1, (performance.now() - state.hopStart) / state.hopDuration)
          const eased = easeInOutCubic(p)
          const from = state.from
          const to = state.to
          bomb.position.x = from.x + (to.x - from.x) * eased
          bomb.position.z = from.z + (to.z - from.z) * eased
          bomb.position.y =
            platformTop + characterHeight + 0.5 + Math.sin(p * Math.PI) * 1.15
          bomb.rotation.z = Math.sin(p * Math.PI) * 0.4
          if (p >= 1) {
            state.hopping = false
            bomb.rotation.z = 0
            state.nextHopAt = performance.now() + 240 + Math.random() * 260
          }
        } else {
          bomb.position.y =
            platformTop + characterHeight + 0.5 + Math.sin(elapsed * 3.2) * 0.04
          if (performance.now() >= state.nextHopAt) {
            let next = randomInt(count - 1)
            if (next >= state.holder) next += 1
            state.holder = next
            state.from = { x: bomb.position.x, z: bomb.position.z }
            state.to = positions[next]
            state.hopStart = performance.now()
            state.hopping = true
            holderMark.position.set(state.to.x, platformTop + 0.025, state.to.z)
            const nextName = players[next].name
            setHolderName(nextName)
            sfx.tick()
          }
        }

        if (remaining <= 2000 && performance.now() - state.lastBeep > 420) {
          state.lastBeep = performance.now()
          sfx.beep()
        }

        if (remaining <= 0) {
          explode()
        }

        if (state.done) {
          const tSince = (performance.now() - state.impact) / 1000
          boomText.scale.setScalar(
            Math.max(0.001, easeOutCubic(Math.min(1, tSince / 0.22)) * (1 + Math.sin(tSince * 9) * 0.04)),
          )
          boomText.position.y = 2.2 + tSince * 0.5
          boomText.material.opacity = Math.max(0, 1 - Math.max(0, tSince - 0.7))
          shockwave.scale.setScalar(0.4 + tSince * 5)
          shockwaveMat.opacity = Math.max(0, 0.8 - tSince * 1.1)
          flash.intensity = Math.max(0, 55 - tSince * 100)
          if (tSince > 1) shockwave.visible = false
          const loserBlock = blocks[state.holder]
          const p = Math.min(1, tSince / 0.5)
          loserBlock.rotation.z = easeOutCubic(p) * 1.35
          loserBlock.position.y = platformTop + Math.sin(p * Math.PI * 0.8) * 0.1
          if (tSince > 0.8) loserBlock.visible = false
        }

        if (state.shake > 0) {
          state.shake = Math.max(0, state.shake - dt * 2.4)
          world.position.x = Math.sin(performance.now() * 0.09) * state.shake * 0.08
          world.position.z = Math.cos(performance.now() * 0.12) * state.shake * 0.06
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

      const start = () => {
        if (state.running || state.done) return
        const initial = randomInt(count)
        state.start = performance.now()
        state.duration = 6200 + Math.random() * 3400
        state.explodeAt = state.start + state.duration
        state.holder = initial
        state.nextHopAt = performance.now() + 450
        state.hopping = false
        state.lastBeep = 0
        state.running = true
        state.done = false
        bomb.visible = true
        placeBomb(initial, true)
        bomb.position.y += 0.6
        holderMark.material.opacity = 0.5
        boomText.visible = false
        shockwave.visible = false
        setHolderName(players[initial].name)
        setStatus('running')
        sfx.whoosh()
        sfx.tick()
      }

      const fitCamera = (aspect) => {
        const vFov = (37 * Math.PI) / 180
        const requiredWidth = (platformRadius + 0.4) * 2
        const distance = Math.max(
          11.8,
          requiredWidth / (2 * Math.tan(vFov / 2) * Math.max(0.4, aspect)) + 2,
        )
        const cameraY = Math.min(9.5, 4.1 + distance * 0.2)
        stage.setCamera([0, cameraY, distance], [0, 2.2, 0])
      }

      stage.onResize(({ aspect }) => fitCamera(aspect))

      return { start }
    },
  })

  return (
    <div className="game-root bomb-root">
      <div className="game-canvas" ref={hostRef} />
      <div className="bomb-flash" ref={flashRef} aria-hidden="true" />
      <div className="game-hud">
        <div className="stage-note">{t('game.bomb.note')}</div>
        <div className="game-readout">
          <div className="hud-card bomb-hud">
            <span className="hud-kicker">{t('game.bomb.fuse')}</span>
            <span className="bomb-meter">
              <span ref={fuseRef} className="bomb-meter-fill" />
            </span>
            <span className="bomb-holder">
              {status === 'idle' ? t('game.bomb.start') : t('game.bomb.holder', { name: holderName })}
            </span>
          </div>
        </div>
        <div className="stage-controls">
          <button
            type="button"
            className="btn btn-primary"
            disabled={status !== 'idle'}
            onClick={() => api.current?.start()}
          >
            <UiIcon name="sparkle" size={17} />
            {status === 'idle'
              ? t('game.bomb.start')
              : status === 'running'
                ? t('game.bomb.running')
                : t('game.bomb.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
