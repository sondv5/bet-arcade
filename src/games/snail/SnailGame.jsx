import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStage } from '../../lib/useStage'
import {
  addContactRing,
  easeOutBack,
  easeOutCubic,
  makeBlock,
  makeTextPlane,
  makeTextSprite,
} from '../../lib/threeKit'
import { shuffle } from '../../lib/random'
import { sfx } from '../../lib/sfx'
import { UiIcon } from '../../components/icons'
import { useI18n } from '../../i18n'
import './snail.css'

function shortName(name, max) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

function makeSnail(player, { bodySize = 0.3, labelHeight = 0.22, labelChars = 12, labelMaxWidth = 165 } = {}) {
  const group = new THREE.Group()
  const bodyColor = new THREE.Color(player.color)
  const shellColor = bodyColor.clone().offsetHSL(0, -0.1, 0.16)

  const body = makeBlock({
    width: bodySize * 1.35,
    height: bodySize * 0.55,
    depth: bodySize * 0.8,
    radius: bodySize * 0.18,
    color: player.color,
    roughness: 0.58,
  })
  body.position.y = bodySize * 0.3
  group.add(body)

  const foot = makeBlock({
    width: bodySize * 1.5,
    height: bodySize * 0.16,
    depth: bodySize * 0.9,
    radius: bodySize * 0.07,
    color: '#fff3e2',
    roughness: 0.8,
  })
  foot.position.y = bodySize * 0.07
  group.add(foot)

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(bodySize * 0.66, 20, 14),
    new THREE.MeshStandardMaterial({ color: shellColor, roughness: 0.45 }),
  )
  shell.scale.set(1, 0.88, 1)
  shell.position.set(-bodySize * 0.12, bodySize * 0.78, 0)
  shell.castShadow = true
  group.add(shell)

  const spiral = new THREE.Mesh(
    new THREE.TorusGeometry(bodySize * 0.27, bodySize * 0.045, 6, 20),
    new THREE.MeshStandardMaterial({ color: '#17161a', roughness: 0.45 }),
  )
  spiral.position.set(-bodySize * 0.12, bodySize * 0.8, bodySize * 0.54)
  group.add(spiral)

  const eyeStalkGeo = new THREE.CylinderGeometry(bodySize * 0.025, bodySize * 0.025, bodySize * 0.28, 6)
  const eyeGeo = new THREE.SphereGeometry(bodySize * 0.065, 8, 6)
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#17161a', roughness: 0.35 })
  ;[-0.18, 0.16].forEach((offset) => {
    const stalk = new THREE.Mesh(eyeStalkGeo, eyeMat)
    stalk.position.set(bodySize * 0.48, bodySize * 0.55, offset)
    stalk.rotation.z = offset * 0.5
    group.add(stalk)
    const eye = new THREE.Mesh(eyeGeo, eyeMat)
    eye.position.set(bodySize * 0.48, bodySize * 0.7, offset + 0.012)
    group.add(eye)
  })

  const label = makeTextSprite(shortName(player.name, labelChars), {
    height: labelHeight,
    color: '#17161a',
    background: '#fffaf1',
    border: '#17161a',
    borderWidth: 3,
    paddingX: 10,
    paddingY: 6,
    radius: 12,
    fontSize: 50,
    maxWidth: labelMaxWidth,
  })
  label.position.set(0, bodySize * 1.9, 0)
  group.add(label)

  group.userData.body = body
  group.userData.shell = shell
  group.userData.label = label
  return group
}

export default function SnailGame({ players, onFinish }) {
  const { t } = useI18n()
  const hostRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [loserCount, setLoserCount] = useState(1)
  const loserRef = useRef(loserCount)
  const timers = useRef([])
  const finishRef = useRef(false)

  useEffect(() => {
    loserRef.current = loserCount
  }, [loserCount])

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const api = useStage(hostRef, {
    fov: 37,
    position: [0, 5.3, 13.2],
    lookAt: [0, 4.4, 0],
    setup: (stage) => {
      const world = new THREE.Group()
      stage.scene.add(world)

      const count = players.length
      const laneWidth = Math.min(1.25, 8 / count)
      const boardWidth = laneWidth * count
      const trackBottom = 0.95
      const trackTop = 7.55
      const startY = 1.25
      const finishY = 7.25
      const boardHeight = 8.35
      const ink = '#17161a'

      const board = new THREE.Group()
      board.position.y = 0.45
      world.add(board)

      const backInk = makeBlock({
        width: boardWidth + 0.55,
        height: boardHeight + 0.28,
        depth: 0.28,
        radius: 0.18,
        color: ink,
        roughness: 0.6,
      })
      backInk.position.set(0, boardHeight / 2, -0.3)
      board.add(backInk)

      const back = makeBlock({
        width: boardWidth + 0.32,
        height: boardHeight + 0.05,
        depth: 0.22,
        radius: 0.14,
        color: '#eef8ff',
        roughness: 0.9,
      })
      back.position.set(0, boardHeight / 2, -0.15)
      board.add(back)

      const base = makeBlock({
        width: boardWidth + 0.55,
        height: 0.18,
        depth: 0.85,
        radius: 0.08,
        color: '#eaddc9',
        roughness: 0.85,
      })
      base.position.set(0, -0.12, -0.05)
      board.add(base)

      addContactRing(stage.scene, {
        inner: boardWidth / 2 + 1.1,
        outer: boardWidth / 2 + 1.2,
        color: '#dccdb9',
        opacity: 0.55,
      })

      const laneMeshes = []
      for (let i = 0; i < count; i += 1) {
        const x = -boardWidth / 2 + laneWidth * (i + 0.5)
        const tint = new THREE.Color(players[i].color).lerp(new THREE.Color('#fffaf1'), 0.66)
        const lane = makeBlock({
          width: laneWidth - 0.06,
          height: trackTop - trackBottom + 0.4,
          depth: 0.08,
          radius: 0.05,
          color: tint,
          roughness: 0.88,
        })
        lane.position.set(x, (trackTop + trackBottom) / 2 + 0.05, -0.02)
        board.add(lane)

        if (i > 0) {
          const divider = new THREE.Mesh(
            new THREE.BoxGeometry(0.025, trackTop - trackBottom + 0.2, 0.16),
            new THREE.MeshBasicMaterial({ color: '#17161a', transparent: true, opacity: 0.12, depthWrite: false }),
          )
          divider.position.set(-boardWidth / 2 + laneWidth * i, (trackTop + trackBottom) / 2 + 0.05, 0.08)
          board.add(divider)
        }
        laneMeshes.push(lane)
      }

      const makeStrip = (y, flip) => {
        const cols = Math.max(6, Math.round(boardWidth / 0.28))
        const size = boardWidth / cols
        for (let i = 0; i < cols; i += 1) {
          const cell = new THREE.Mesh(
            new THREE.BoxGeometry(size * 0.98, 0.07, 0.3),
            new THREE.MeshStandardMaterial({
              color: (i + (flip ? 1 : 0)) % 2 === 0 ? '#17161a' : '#fffaf1',
              roughness: 0.6,
            }),
          )
          cell.position.set(-boardWidth / 2 + size * (i + 0.5), y, 0.18)
          board.add(cell)
        }
      }
      makeStrip(trackBottom, false)
      makeStrip(trackTop, true)

      const laneX = (index) => -boardWidth / 2 + laneWidth * (index + 0.5)

      const snails = players.map((player, index) => {
        const labelChars = count > 10 ? 6 : count > 6 ? 12 : 16
        const snail = makeSnail(player, {
          bodySize: Math.min(0.4, laneWidth * 0.48),
          labelHeight: count > 10 ? 0.16 : 0.22,
          labelChars,
          labelMaxWidth: count > 10 ? 165 : 245,
        })
        snail.position.set(laneX(index), startY, 0.4)
        board.add(snail)

        const highlight = new THREE.Mesh(
          new THREE.RingGeometry(laneWidth * 0.26, laneWidth * 0.36, 28),
          new THREE.MeshBasicMaterial({
            color: '#ff4d6d',
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: false,
            toneMapped: false,
          }),
        )
        highlight.rotation.x = -Math.PI / 2
        highlight.position.set(laneX(index), 0.09, 0.35)
        board.add(highlight)
        snail.userData.highlight = highlight
        snail.userData.baseX = laneX(index)
        snail.userData.phase = index * 0.8
        snail.userData.progress = 0
        return snail
      })

      const finishFlags = []
      for (let i = 0; i < 3; i += 1) {
        const flag = makeTextSprite('BÉT!', {
          height: 0.34,
          color: '#fffaf1',
          background: '#ff4d6d',
          border: '#17161a',
          borderWidth: 4,
          paddingX: 12,
          paddingY: 5,
          fontSize: 60,
          fontWeight: 800,
        })
        flag.visible = false
        board.add(flag)
        finishFlags.push(flag)
      }

      const state = {
        running: false,
        done: false,
        start: 0,
        goAt: 0,
        finishAt: [],
        order: [],
        losers: [],
        raceStart: 0,
        finishShownAt: 0,
        finalLoserCount: 1,
      }

      stage.onFrame((dt, elapsed) => {
        snails.forEach((snail, index) => {
          snail.rotation.z = Math.sin(elapsed * 1.4 + snail.userData.phase) * 0.02
          const body = snail.userData.body
          body.scale.y = 1 + Math.sin(elapsed * 8 + index) * 0.04
        })

        if (!state.running) return

        if (state.done) {
          const since = (performance.now() - state.finishShownAt) / 1000
          finishFlags.forEach((flag, index) => {
            if (!flag.visible) return
            flag.rotation.z = Math.sin(elapsed * 4) * 0.04
            flag.scale.setScalar(
              Math.max(
                0.001,
                easeOutBack(Math.min(1, since * 2.2 - index * 0.12)) * (1 + Math.sin(since * 8) * 0.035),
              ),
            )
          })
          state.losers.forEach((loserIndex) => {
            const snail = snails[loserIndex]
            snail.userData.highlight.material.opacity = 0.34 + Math.sin(since * 7) * 0.14
          })
          return
        }

        const now = performance.now()
        const elapsedSeconds = Math.max(0, (now - state.goAt) / 1000)
        let allFinished = true

        snails.forEach((snail, index) => {
          const finishSeconds = state.finishAt[index]
          const raw = Math.min(1, elapsedSeconds / finishSeconds)
          const wobble =
            Math.sin(raw * Math.PI * 5.4 + snail.userData.phase) *
            0.075 *
            raw *
            (1 - raw)
          const nextProgress = Math.max(snail.userData.progress, Math.min(1, raw + wobble))
          snail.userData.progress = nextProgress
          const eased = nextProgress
          const xOffset = Math.sin(elapsed * 5.5 + snail.userData.phase) * laneWidth * 0.045
          snail.position.x = snail.userData.baseX + xOffset * (1 - nextProgress)
          snail.position.y = startY + (finishY - startY) * eased

          if (raw < 1) allFinished = false
        })

        if (allFinished && now - state.goAt > 300) {
          state.done = true
          state.finishShownAt = now
          state.losers.forEach((loserIndex, flagIndex) => {
            const flag = finishFlags[flagIndex]
            if (!flag) return
            flag.visible = true
            flag.position.set(laneX(loserIndex), finishY + 0.75 + flagIndex * 0.02, 0.75)
            flag.scale.setScalar(0.001)
          })
          sfx.pop()
          sfx.gong()
          sfx.lose()
          setStatus('done')
          timers.current.push(
            setTimeout(() => {
              if (finishRef.current) return
              finishRef.current = true
              onFinish({
                type: 'players',
                playerIds: state.losers.map((index) => players[index].id),
                headline: t(state.finalLoserCount > 1 ? 'game.snail.resultMany' : 'game.snail.resultOne'),
                tone: 'lose',
              })
            }, 1350),
          )
        }

      })

      const start = () => {
        if (state.running || state.done) return
        const loserAmount = Math.max(1, Math.min(loserRef.current, count - 1))
        const order = shuffle([...Array(count).keys()])
        state.order = order
        state.losers = order.slice(count - loserAmount)
        state.finalLoserCount = loserAmount
        const baseTime = 5.4
        const spread = 2.5
        state.finishAt = new Array(count).fill(0)
        order.forEach((playerIndex, rank) => {
          state.finishAt[playerIndex] = baseTime + (rank / Math.max(1, count - 1)) * spread
        })
        state.start = performance.now()
        state.goAt = state.start + 1100
        state.running = true
        state.done = false
        state.finishShownAt = 0
        snails.forEach((snail, index) => {
          snail.userData.progress = 0
          snail.position.set(laneX(index), startY, 0.4)
          snail.userData.highlight.material.opacity = 0
        })
        finishFlags.forEach((flag) => {
          flag.visible = false
        })
        setStatus('running')
        sfx.beep()
        timers.current.push(setTimeout(() => sfx.beep(), 380))
        timers.current.push(setTimeout(() => sfx.beep(), 760))
        timers.current.push(setTimeout(() => sfx.whoosh(), 1050))
      }

      const fitCamera = (aspect) => {
        const vFov = (37 * Math.PI) / 180
        const requiredWidth = boardWidth + 1.7
        const requiredHeight = boardHeight + 1.7
        const distance = Math.max(
          11.5,
          requiredWidth / (2 * Math.tan(vFov / 2) * Math.max(0.4, aspect)) + 2,
          requiredHeight / (2 * Math.tan(vFov / 2)) + 1.2,
        )
        stage.setCamera([0, 4.1 + distance * 0.09, distance], [0, 4.35, 0])
      }

      stage.onResize(({ aspect }) => fitCamera(aspect))

      return { start }
    },
  })

  return (
    <div className="game-root snail-root">
      <div className="game-canvas" ref={hostRef} />
      <div className="game-hud">
        <div className="stage-note">{t('game.snail.note')}</div>
        <div className="game-settings">
          <div className="hud-card snail-setting">
            <span className="hud-kicker">{t('game.snail.losers')}</span>
            <div className="seg">
              {[1, 2, 3].map((amount) => (
                <button
                  type="button"
                  key={amount}
                  disabled={status !== 'idle' || amount >= players.length}
                  aria-pressed={loserCount === amount}
                  onClick={() => setLoserCount(amount)}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="stage-controls">
          <button
            type="button"
            className="btn btn-primary"
            disabled={status !== 'idle'}
            onClick={() => api.current?.start()}
          >
            <UiIcon name="arrowRight" size={17} />
            {status === 'idle'
              ? t('game.snail.start')
              : status === 'running'
                ? t('game.snail.running')
                : t('game.snail.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
