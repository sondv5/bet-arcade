import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStage } from '../../lib/useStage'
import {
  addContactRing,
  easeInOutCubic,
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
import './teams.css'

const TEAM_COLORS = ['#ff4d6d', '#4d9bff', '#2ee6a6', '#9b7bff']
const BIN_W = 2.75
const BIN_D = 1.35

function shortName(name, max = 10) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

function makeNameTile(player) {
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
  base.castShadow = true
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

  group.userData.body = base
  return group
}

export default function TeamsGame({ players, onFinish }) {
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
    position: [0, 7.2, 12.5],
    lookAt: [0, 2.3, -0.2],
    setup: (stage) => {
      const world = new THREE.Group()
      stage.scene.add(world)

      const ink = '#17161a'
      const table = makeBlock({
        width: 8.4,
        height: 0.34,
        depth: 6.2,
        radius: 0.24,
        color: '#e0f4ff',
        roughness: 0.9,
      })
      table.position.y = 0.17
      stage.scene.add(table)
      const tableInk = makeBlock({
        width: 8.7,
        height: 0.18,
        depth: 6.5,
        radius: 0.18,
        color: ink,
        roughness: 0.7,
      })
      tableInk.position.y = 0.07
      stage.scene.add(tableInk)
      addContactRing(stage.scene, { inner: 5.3, outer: 5.42, color: '#dcccb8', opacity: 0.7 })

      const cat = makeCat({ scale: 0.85, color: '#fff2dd' })
      cat.position.set(-3.55, 0.34, 1.5)
      cat.rotation.y = 0.7
      world.add(cat)

      const binCenters = [
        { x: -1.58, z: 0.8 },
        { x: 1.58, z: 0.8 },
        { x: -1.58, z: -1.3 },
        { x: 1.58, z: -1.3 },
      ]

      const bins = binCenters.map((center, index) => {
        const group = new THREE.Group()
        group.position.set(center.x, 0, center.z)
        world.add(group)
        const color = TEAM_COLORS[index]

        const tray = makeBlock({
          width: BIN_W,
          height: 0.16,
          depth: BIN_D,
          radius: 0.08,
          color: '#fbf2e3',
          roughness: 0.85,
        })
        tray.position.y = 0.52
        group.add(tray)

        const rim = makeBlock({
          width: BIN_W + 0.06,
          height: 0.18,
          depth: BIN_D + 0.06,
          radius: 0.09,
          color,
          roughness: 0.5,
        })
        rim.position.y = 0.44
        group.add(rim)

        const back = makeBlock({
          width: BIN_W,
          height: 0.55,
          depth: 0.1,
          radius: 0.05,
          color,
          roughness: 0.55,
        })
        back.position.set(0, 0.76, -BIN_D / 2 + 0.08)
        group.add(back)

        const front = makeBlock({
          width: BIN_W,
          height: 0.3,
          depth: 0.12,
          radius: 0.05,
          color,
          roughness: 0.55,
        })
        front.position.set(0, 0.63, BIN_D / 2 - 0.06)
        group.add(front)

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
        label.position.set(0, 2.12, BIN_D / 2 + 0.4)
        group.add(label)

        return { center, color, group, label, index }
      })

      const setTeamCount = (count) => {
        bins.forEach((bin, index) => {
          bin.group.visible = index < count
        })
      }
      setTeamCount(2)

      const hopper = makeBlock({
        width: 3.1,
        height: 1.25,
        depth: 1.55,
        radius: 0.18,
        color: '#fbf2e3',
        roughness: 0.7,
      })
      hopper.position.set(0, 5.05, -1.35)
      world.add(hopper)
      const hopperInk = makeBlock({
        width: 3.35,
        height: 1.4,
        depth: 1.7,
        radius: 0.2,
        color: ink,
        roughness: 0.55,
      })
      hopperInk.position.set(0, 5.05, -1.7)
      world.add(hopperInk)
      const hopperMouth = makeBlock({
        width: 1.4,
        height: 0.32,
        depth: 0.3,
        radius: 0.09,
        color: ink,
        roughness: 0.4,
      })
      hopperMouth.position.set(0, 4.36, -0.62)
      world.add(hopperMouth)
      const hopperSign = makeTextPlane(t('games.teams.title'), {
        height: 0.46,
        color: ink,
        background: '#ffd23f',
        border: ink,
        borderWidth: 4,
        paddingX: 16,
        paddingY: 7,
        fontSize: 60,
        fontWeight: 800,
      })
      hopperSign.position.set(0, 5.08, -0.54)
      world.add(hopperSign)

      const posts = [-1.45, 1.45].map((x) => {
        const post = makeBlock({
          width: 0.14,
          height: 4.4,
          depth: 0.14,
          radius: 0.05,
          color: ink,
          roughness: 0.6,
        })
        post.position.set(x, 2.6, -2.05)
        world.add(post)
        return post
      })

      const tiles = players.map((player) => {
        const tile = makeNameTile(player)
        tile.position.set(0, 4.35, -0.55)
        world.add(tile)
        return { tile, player, target: new THREE.Vector3(), delay: 0, landed: false, data: null }
      })

      const tileById = new Map(tiles.map((item) => [item.player.id, item]))

      const sparkles = Array.from({ length: 8 }, (_, index) => {
        const sparkle = makeBlock({
          width: 0.14,
          height: 0.14,
          depth: 0.14,
          radius: 0.03,
          color: TEAM_COLORS[index % 4],
          segments: 1,
        })
        sparkle.position.set(-4.3 + (index % 4) * 2.8, 1.15 + (index % 2) * 0.5, -2.2)
        sparkle.visible = false
        world.add(sparkle)
        sparkle.userData = {
          phase: index,
          baseY: sparkle.position.y,
        }
        return sparkle
      })

      const state = {
        running: false,
        done: false,
        start: 0,
        finishedAt: 0,
        active: 2,
        lastLand: 0,
        confetti: [],
      }

      const burstConfetti = () => {
        for (let i = 0; i < 34; i += 1) {
          const piece = makeBlock({
            width: 0.11,
            height: 0.11,
            depth: 0.11,
            radius: 0.02,
            color: TEAM_COLORS[i % 4],
            segments: 1,
          })
          piece.position.set((Math.random() - 0.5) * 5.6, 2.3 + Math.random() * 1.2, 0.5)
          piece.userData = {
            vx: (Math.random() - 0.5) * 3,
            vy: 1.2 + Math.random() * 3,
            vz: (Math.random() - 0.5) * 2,
            spin: (Math.random() - 0.5) * 12,
          }
          world.add(piece)
          state.confetti.push(piece)
        }
      }

      stage.onFrame((dt, elapsed) => {
        cat.position.y = 0.34 + Math.sin(elapsed * 1.6) * 0.03
        cat.userData.paw.rotation.z = 0.7 + Math.sin(elapsed * 2.6) * 0.26

        sparkles.forEach((sparkle) => {
          if (!sparkle.visible) return
          sparkle.rotation.y += dt * 1.5
          sparkle.rotation.z += dt * 0.8
          sparkle.position.y = sparkle.userData.baseY + Math.sin(elapsed * 1.6 + sparkle.userData.phase) * 0.1
        })

        if (state.running && !state.done) {
          const since = performance.now() - state.start
          let allLanded = true
          tiles.forEach((item) => {
            if (!item.data) return
            const p = (since - item.delay) / 680
            if (p < 0) {
              item.tile.visible = false
              allLanded = false
              return
            }
            allLanded = allLanded && item.landed
            if (item.landed) {
              item.tile.position.lerp(item.target, Math.min(1, dt * 12))
              item.tile.rotation.x += (0 - item.tile.rotation.x) * Math.min(1, dt * 10)
              item.tile.rotation.y += (0 - item.tile.rotation.y) * Math.min(1, dt * 10)
              item.tile.rotation.z = Math.sin(elapsed * 3 + item.data.index) * 0.01
              return
            }

            item.tile.visible = true
            const progress = Math.min(1, p)
            const eased = easeInOutCubic(progress)
            const start = item.data.start
            item.tile.position.x = start.x + (item.target.x - start.x) * eased
            item.tile.position.z = start.z + (item.target.z - start.z) * eased
            item.tile.position.y = start.y + (item.target.y - start.y) * eased + Math.sin(progress * Math.PI) * 1.15
            item.tile.rotation.y = (1 - eased) * Math.PI * 1.4
            item.tile.rotation.x = Math.sin(progress * Math.PI) * 0.35
            item.tile.rotation.z = Math.sin(progress * Math.PI) * 0.12
            if (progress >= 1) {
              item.landed = true
              item.tile.position.copy(item.target)
              item.tile.rotation.set(0, 0, 0)
              if (performance.now() - state.lastLand > 45) {
                state.lastLand = performance.now()
                sfx.tick()
              }
            }
          })

          if (allLanded) {
            state.done = true
            state.finishedAt = performance.now()
            bins.slice(0, state.active).forEach((bin) => {
              bin.label.scale.setScalar(1)
            })
            sparkles.forEach((sparkle) => {
              sparkle.visible = true
            })
            sfx.win()
            burstConfetti()
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
                  headline: t('game.teams.result'),
                  groups,
                })
              }, 1050),
            )
          }
        }

        if (state.done) {
          const since = (performance.now() - state.finishedAt) / 1000
          bins.slice(0, state.active).forEach((bin, index) => {
            bin.label.position.y = 2.12 + Math.sin(since * 4 + index) * 0.04
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
        const activeBins = bins.slice(0, active)
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
        state.start = performance.now()
        state.running = true
        state.done = false
        state.lastLand = 0
        setStatus('running')

        tiles.forEach((item, index) => {
          const teamIndex = assignment.get(item.player.id)
          const slot = groups[teamIndex].indexOf(item.player)
          const col = slot % 3
          const row = Math.floor(slot / 3)
          const bin = activeBins[teamIndex]
          item.data = {
            team: teamIndex,
            index,
            start: {
              x: (Math.random() - 0.5) * 0.35,
              y: 4.3,
              z: -0.5,
            },
          }
          item.target.set(
            bin.center.x + (col - 1) * 0.84,
            0.78 + row * 0.28,
            bin.center.z + 0.35,
          )
          item.delay = 260 + index * 145
          item.landed = false
          item.tile.visible = false
        })

        bins.forEach((bin, index) => {
          bin.group.visible = index < active
          bin.label.scale.setScalar(1)
        })

        sfx.whoosh()
      }

      const fitCamera = (aspect) => {
        const vFov = (37 * Math.PI) / 180
        const requiredWidth = 6.8
        const requiredHeight = 7.2
        const distance = Math.max(
          11.5,
          requiredWidth / (2 * Math.tan(vFov / 2) * Math.max(0.4, aspect)) + 2,
          requiredHeight / (2 * Math.tan(vFov / 2)) + 2,
        )
        stage.setCamera([0, 5.5 + distance * 0.16, distance], [0, 2.3, -0.35])
      }

      stage.onResize(({ aspect }) => fitCamera(aspect))

      return { start, setTeamCount }
    },
  })

  return (
    <div className="game-root teams-root">
      <div className="game-canvas" ref={hostRef} />
      <div className="game-hud">
        <div className="stage-note">{t('game.teams.note')}</div>
        <div className="game-settings">
          <div className="hud-card teams-setting">
            <span className="hud-kicker">{t('game.teams.count')}</span>
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
            <UiIcon name="users" size={17} />
            {status === 'idle'
              ? t('game.teams.start')
              : status === 'running'
                ? t('game.teams.running')
                : t('game.teams.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
