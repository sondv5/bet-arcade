import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStage } from '../../lib/useStage'
import {
  addContactRing,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  makeBlock,
  makeTextPlane,
  makeTextSprite,
} from '../../lib/threeKit'
import { shuffle } from '../../lib/random'
import { makeCat } from '../../lib/characters'
import { sfx } from '../../lib/sfx'
import { UiIcon } from '../../components/icons'
import { useI18n } from '../../i18n'
import './gacha.css'

const TEAM_COLORS = ['#ff4d6d', '#4d9bff', '#2ee6a6', '#9b7bff']
const TRAY_W = 2.75
const TRAY_D = 1.35

function shortName(name, max = 10) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

function makeCard(player) {
  const group = new THREE.Group()
  group.visible = false
  const base = makeBlock({
    width: 0.8,
    height: 0.24,
    depth: 0.1,
    radius: 0.06,
    color: '#fffaf1',
    roughness: 0.7,
  })
  group.add(base)
  const cap = makeBlock({
    width: 0.12,
    height: 0.2,
    depth: 0.11,
    radius: 0.03,
    color: player.color,
    roughness: 0.5,
  })
  cap.position.x = -0.31
  group.add(cap)
  const label = makeTextPlane(shortName(player.name), {
    height: 0.115,
    color: '#17161a',
    fontSize: 40,
    paddingX: 5,
    paddingY: 2,
    maxWidth: 155,
  })
  label.position.set(0.03, 0, 0.061)
  group.add(label)
  return group
}

function makeCapsule(player) {
  const group = new THREE.Group()
  const color = new THREE.Color(player.color)
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 20, 14),
    new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.04 }),
  )
  body.castShadow = true
  group.add(body)
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.028, 8, 24),
    new THREE.MeshStandardMaterial({ color: '#fffaf1', roughness: 0.5 }),
  )
  band.rotation.x = Math.PI / 2
  group.add(band)
  const shine = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 6),
    new THREE.MeshBasicMaterial({ color: '#fffaf1', transparent: true, opacity: 0.55 }),
  )
  shine.position.set(-0.08, 0.08, 0.13)
  group.add(shine)
  return group
}

export default function GachaGame({ players, onFinish }) {
  const { t } = useI18n()
  const hostRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [teamCount, setTeamCount] = useState(2)
  const teamRef = useRef(teamCount)
  const timers = useRef([])
  const finishRef = useRef(false)
  const teamNames = [t('teams.red'), t('teams.blue'), t('teams.green'), t('teams.purple')]

  useEffect(() => {
    teamRef.current = teamCount
    api.current?.setTeamCount(teamCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamCount])

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const api = useStage(hostRef, {
    fov: 37,
    position: [0, 7.5, 13.2],
    lookAt: [0, 3, -0.2],
    setup: (stage) => {
      const world = new THREE.Group()
      stage.scene.add(world)
      const ink = '#17161a'

      const table = makeBlock({
        width: 8.2,
        height: 0.32,
        depth: 6,
        radius: 0.23,
        color: '#ffe4ef',
        roughness: 0.9,
      })
      table.position.y = 0.16
      stage.scene.add(table)
      const tableInk = makeBlock({
        width: 8.5,
        height: 0.18,
        depth: 6.3,
        radius: 0.18,
        color: ink,
        roughness: 0.7,
      })
      tableInk.position.y = 0.07
      stage.scene.add(tableInk)
      addContactRing(stage.scene, { inner: 5.2, outer: 5.32, color: '#dcccb8', opacity: 0.65 })

      const cat = makeCat({ scale: 0.85, color: '#fff2dd' })
      cat.position.set(-3.5, 0.32, 1.4)
      cat.rotation.y = 0.8
      world.add(cat)

      const centers = [
        { x: -1.58, z: 0.85 },
        { x: 1.58, z: 0.85 },
        { x: -1.58, z: -1.25 },
        { x: 1.58, z: -1.25 },
      ]

      const trays = centers.map((center, index) => {
        const group = new THREE.Group()
        group.position.set(center.x, 0, center.z)
        world.add(group)
        const color = TEAM_COLORS[index]

        const tray = makeBlock({
          width: TRAY_W,
          height: 0.16,
          depth: TRAY_D,
          radius: 0.08,
          color: '#fbf2e3',
          roughness: 0.85,
        })
        tray.position.y = 0.52
        group.add(tray)

        const rim = makeBlock({
          width: TRAY_W + 0.05,
          height: 0.18,
          depth: TRAY_D + 0.05,
          radius: 0.09,
          color,
          roughness: 0.5,
        })
        rim.position.y = 0.44
        group.add(rim)

        const back = makeBlock({
          width: TRAY_W,
          height: 0.5,
          depth: 0.1,
          radius: 0.05,
          color,
          roughness: 0.55,
        })
        back.position.set(0, 0.75, -TRAY_D / 2 + 0.08)
        group.add(back)

        const label = makeTextSprite(teamNames[index], {
          height: 0.3,
          color: ink,
          background: '#fffaf1',
          border: ink,
          borderWidth: 4,
          paddingX: 12,
          paddingY: 6,
          fontSize: 52,
          fontWeight: 700,
        })
        label.position.set(0, 2.1, TRAY_D / 2 + 0.4)
        group.add(label)

        return { center, color, group, label, index }
      })

      const setTeamCount = (count) => {
        trays.forEach((tray, index) => {
          tray.group.visible = index < count
        })
      }
      setTeamCount(2)

      const machine = new THREE.Group()
      machine.position.set(0, 0, -1.5)
      world.add(machine)

      const body = makeBlock({
        width: 3.3,
        height: 1.5,
        depth: 1.5,
        radius: 0.2,
        color: '#fbf2e3',
        roughness: 0.68,
      })
      body.position.set(0, 4.55, 0)
      machine.add(body)

      const bodyInk = makeBlock({
        width: 3.55,
        height: 1.68,
        depth: 1.7,
        radius: 0.22,
        color: ink,
        roughness: 0.55,
      })
      bodyInk.position.set(0, 4.55, -0.13)
      machine.add(bodyInk)

      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(1.32, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
          color: '#dff4ff',
          transparent: true,
          opacity: 0.22,
          roughness: 0.08,
          metalness: 0.05,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      )
      dome.position.set(0, 5.25, 0)
      machine.add(dome)

      const domeRim = new THREE.Mesh(
        new THREE.TorusGeometry(1.32, 0.08, 8, 48),
        new THREE.MeshStandardMaterial({ color: ink, roughness: 0.5 }),
      )
      domeRim.rotation.x = -Math.PI / 2
      domeRim.position.set(0, 5.25, 0)
      machine.add(domeRim)

      const innerCapsules = []
      const decoColors = ['#ff4d6d', '#ffd23f', '#2ee6a6', '#4d9bff', '#9b7bff', '#ff6fb5']
      for (let i = 0; i < 14; i += 1) {
        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(0.15 + (i % 3) * 0.025, 12, 8),
          new THREE.MeshStandardMaterial({ color: decoColors[i % decoColors.length], roughness: 0.35 }),
        )
        const angle = i * 1.7
        const radius = 0.25 + (i % 4) * 0.22
        ball.position.set(
          Math.cos(angle) * radius,
          5.38 + (i % 5) * 0.12,
          Math.sin(angle) * radius * 0.55,
        )
        ball.userData = { phase: i * 0.9, baseY: ball.position.y }
        machine.add(ball)
        innerCapsules.push(ball)
      }

      const sign = makeTextPlane(t('games.gacha.title'), {
        height: 0.4,
        color: ink,
        background: '#ffd23f',
        border: ink,
        borderWidth: 4,
        paddingX: 14,
        paddingY: 6,
        fontSize: 58,
        fontWeight: 800,
      })
      sign.position.set(0, 4.68, 0.78)
      machine.add(sign)

      const mouth = makeBlock({
        width: 1.05,
        height: 0.32,
        depth: 0.24,
        radius: 0.08,
        color: ink,
        roughness: 0.4,
      })
      mouth.position.set(0, 4.05, 0.62)
      machine.add(mouth)

      const knob = new THREE.Group()
      knob.position.set(1.82, 4.55, 0.55)
      machine.add(knob)
      const knobBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.15, 20),
        new THREE.MeshStandardMaterial({ color: ink, roughness: 0.5 }),
      )
      knobBase.rotation.x = Math.PI / 2
      knob.add(knobBase)
      const knobArmA = makeBlock({
        width: 0.7,
        height: 0.12,
        depth: 0.12,
        radius: 0.04,
        color: '#ff4d6d',
        roughness: 0.45,
      })
      knob.add(knobArmA)
      const knobArmB = knobArmA.clone()
      knobArmB.rotation.z = Math.PI / 2
      knob.add(knobArmB)
      const knobCenter = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 14, 10),
        new THREE.MeshStandardMaterial({ color: '#ffd23f', roughness: 0.4 }),
      )
      knobCenter.position.z = 0.13
      knob.add(knobCenter)

      const tiles = players.map((player) => {
        const tile = makeCard(player)
        tile.position.set(0, 0.8, 0)
        world.add(tile)
        return { tile, player, target: new THREE.Vector3(), capsule: null, data: null, landed: false, landTime: 0 }
      })

      tiles.forEach((item) => {
        const capsule = makeCapsule(item.player)
        capsule.visible = false
        capsule.position.set(0, 4.1, 0.2)
        world.add(capsule)
        item.capsule = capsule
      })

      const sparkles = Array.from({ length: 7 }, (_, index) => {
        const sparkle = makeBlock({
          width: 0.12 + (index % 2) * 0.06,
          height: 0.12 + (index % 3) * 0.04,
          depth: 0.12,
          radius: 0.03,
          color: TEAM_COLORS[index % 4],
          segments: 1,
        })
        sparkle.position.set(-4.1 + index * 1.35, 1.1 + (index % 2) * 0.45, -2.3)
        sparkle.visible = false
        world.add(sparkle)
        sparkle.userData = { phase: index, baseY: sparkle.position.y }
        return sparkle
      })

      const state = {
        running: false,
        done: false,
        crankStart: 0,
        start: 0,
        finishedAt: 0,
        active: 2,
        confetti: [],
      }

      const burst = () => {
        for (let i = 0; i < 34; i += 1) {
          const piece = makeBlock({
            width: 0.1,
            height: 0.1,
            depth: 0.1,
            radius: 0.02,
            color: TEAM_COLORS[i % 4],
            segments: 1,
          })
          piece.position.set((Math.random() - 0.5) * 5.2, 2.6 + Math.random(), 0.3)
          piece.userData = {
            vx: (Math.random() - 0.5) * 3,
            vy: 1.5 + Math.random() * 3,
            vz: (Math.random() - 0.5) * 2,
            spin: (Math.random() - 0.5) * 14,
          }
          world.add(piece)
          state.confetti.push(piece)
        }
      }

      stage.onFrame((dt, elapsed) => {
        cat.position.y = 0.32 + Math.sin(elapsed * 1.5) * 0.03
        cat.userData.paw.rotation.z = 0.7 + Math.sin(elapsed * 2.6) * 0.26

        innerCapsules.forEach((ball) => {
          ball.position.y = ball.userData.baseY + Math.sin(elapsed * 1.4 + ball.userData.phase) * 0.05
        })
        dome.rotation.z = Math.sin(elapsed * 0.9) * 0.01

        sparkles.forEach((sparkle) => {
          if (!sparkle.visible) return
          sparkle.rotation.y += dt * 1.7
          sparkle.position.y = sparkle.userData.baseY + Math.sin(elapsed * 1.8 + sparkle.userData.phase) * 0.1
        })

        if (state.running && !state.done) {
          const now = performance.now()
          const crankFor = now - state.crankStart
          knob.rotation.z = crankFor < 900 ? -crankFor * 0.012 : 0
          machine.rotation.z = crankFor < 900 ? Math.sin(crankFor * 0.02) * 0.006 : 0

          let allLanded = true
          tiles.forEach((item) => {
            if (!item.data) return
            const p = (now - item.data.launchAt) / 700
            if (p < 0) {
              item.capsule.visible = false
              item.tile.visible = false
              allLanded = false
              return
            }
            allLanded = allLanded && item.landed
            if (item.landed) {
              item.tile.position.lerp(item.target, Math.min(1, dt * 14))
              const pop = Math.min(1, (now - item.landTime) / 260)
              item.tile.scale.setScalar(0.001 + easeOutBack(pop))
              return
            }

            item.capsule.visible = true
            const progress = Math.min(1, p)
            const eased = easeInOutCubic(progress)
            item.capsule.position.x = 0 + (item.target.x - 0) * eased
            item.capsule.position.z = 0.25 + (item.target.z - 0.25) * eased
            item.capsule.position.y = 4.05 + (item.target.y - 4.05) * eased + Math.sin(progress * Math.PI) * 1.25
            item.capsule.rotation.x = progress * Math.PI * 2
            item.capsule.rotation.z = progress * 1.2

            if (progress >= 1) {
              item.landed = true
              item.landTime = now
              item.capsule.visible = false
              item.tile.visible = true
              item.tile.position.copy(item.target)
              item.tile.scale.setScalar(0.001)
              sfx.pop()
            }
          })

          if (allLanded) {
            state.done = true
            state.finishedAt = now
            sparkles.forEach((sparkle) => {
              sparkle.visible = true
            })
            sfx.win()
            burst()
            setStatus('done')
            timers.current.push(
              setTimeout(() => {
                if (finishRef.current) return
                finishRef.current = true
                const groups = Array.from({ length: state.active }, (_, index) => ({
                  name: teamNames[index],
                  playerIds: tiles
                    .filter((item) => item.data && item.data.team === index)
                    .map((item) => item.player.id),
                }))
                onFinish({
                  type: 'teams',
                  headline: t('game.gacha.result'),
                  groups,
                })
              }, 1100),
            )
          }
        }

        if (state.done) {
          const since = (performance.now() - state.finishedAt) / 1000
          trays.slice(0, state.active).forEach((tray, index) => {
            tray.label.position.y = 2.1 + Math.sin(since * 4 + index) * 0.04
          })
        }

        if (state.confetti.length) {
          state.confetti.forEach((piece) => {
            const data = piece.userData
            data.vy -= 9.5 * dt
            piece.position.x += data.vx * dt
            piece.position.y += data.vy * dt
            piece.position.z += data.vz * dt
            piece.rotation.x += data.spin * dt
            piece.rotation.y += data.spin * dt
          })
          state.confetti = state.confetti.filter((piece) => {
            if (piece.position.y < 0.3) {
              world.remove(piece)
              piece.geometry.dispose()
              piece.material.dispose()
              return false
            }
            return true
          })
        }
      })

      const start = () => {
        if (state.running || state.done) return
        const active = Math.max(2, Math.min(4, players.length, teamRef.current))
        const activeTrays = trays.slice(0, active)
        const order = shuffle(players)
        const groups = Array.from({ length: active }, () => [])
        const assignment = new Map()

        order.forEach((player, index) => {
          const round = Math.floor(index / active)
          const pos = index % active
          const teamIndex = round % 2 === 0 ? pos : active - 1 - pos
          groups[teamIndex].push(player)
          assignment.set(player.id, teamIndex)
        })

        state.active = active
        state.crankStart = performance.now()
        state.start = performance.now()
        state.running = true
        state.done = false
        setStatus('running')
        sfx.click()
        sfx.coin()
        timers.current.push(setTimeout(() => sfx.whoosh(), 850))

        order.forEach((player, index) => {
          const teamIndex = assignment.get(player.id)
          const slot = groups[teamIndex].indexOf(player)
          const col = slot % 3
          const row = Math.floor(slot / 3)
          const tray = activeTrays[teamIndex]
          const item = tiles.find((entry) => entry.player.id === player.id)
          item.data = {
            team: teamIndex,
            launchAt: state.start + 920 + index * 175,
          }
          item.target.set(
            tray.center.x + (col - 1) * 0.84,
            0.78 + row * 0.28,
            tray.center.z + 0.35,
          )
          item.landed = false
          item.tile.visible = false
          item.capsule.visible = false
          item.capsule.position.set(0, 4.1, 0.2)
        })

        trays.forEach((tray, index) => {
          tray.group.visible = index < active
        })
      }

      const fitCamera = (aspect) => {
        const vFov = (37 * Math.PI) / 180
        const requiredWidth = 6.8
        const requiredHeight = 8
        const distance = Math.max(
          11.5,
          requiredWidth / (2 * Math.tan(vFov / 2) * Math.max(0.4, aspect)) + 2,
          requiredHeight / (2 * Math.tan(vFov / 2)) + 2,
        )
        stage.setCamera([0, 5.6 + distance * 0.16, distance], [0, 3, -0.35])
      }

      stage.onResize(({ aspect }) => fitCamera(aspect))

      return { start, setTeamCount }
    },
  })

  return (
    <div className="game-root gacha-root">
      <div className="game-canvas" ref={hostRef} />
      <div className="game-hud">
        <div className="stage-note">{t('game.gacha.note')}</div>
        <div className="game-settings">
          <div className="hud-card gacha-setting">
            <span className="hud-kicker">{t('game.gacha.count')}</span>
            <div className="seg">
              {[2, 3, 4].map((amount) => (
                <button
                  type="button"
                  key={amount}
                  disabled={status !== 'idle' || amount > players.length}
                  aria-pressed={teamCount === amount}
                  onClick={() => setTeamCount(amount)}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="game-readout">
          <span className="chip">{t('common.people', { count: players.length })}</span>
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
              ? t('game.gacha.start')
              : status === 'running'
                ? t('game.gacha.running')
                : t('game.gacha.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
