import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStage } from '../../lib/useStage'
import {
  addContactRing,
  easeOutBack,
  easeOutCubic,
  makeBlock,
  makeTextPlane,
  PALETTE,
} from '../../lib/threeKit'
import { shuffle } from '../../lib/random'
import { makeBird } from '../../lib/characters'
import { sfx } from '../../lib/sfx'
import { UiIcon } from '../../components/icons'
import { useI18n } from '../../i18n'
import './pairs.css'

function shortName(name, max = 10) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

function makeToken(player, width = 0.8) {
  const group = new THREE.Group()
  const base = makeBlock({
    width,
    height: 0.24,
    depth: 0.12,
    radius: 0.06,
    color: '#fffaf1',
    roughness: 0.7,
  })
  group.add(base)
  const cap = makeBlock({
    width: 0.12,
    height: 0.2,
    depth: 0.13,
    radius: 0.03,
    color: player.color,
    roughness: 0.5,
  })
  cap.position.x = -width / 2 + 0.1
  group.add(cap)
  const label = makeTextPlane(shortName(player.name, 10), {
    height: 0.115,
    color: '#17161a',
    fontSize: 40,
    paddingX: 5,
    paddingY: 2,
    maxWidth: width > 0.7 ? 150 : 120,
  })
  label.position.set(0.04, 0, 0.071)
  group.add(label)
  return group
}

export default function PairsGame({ players, onFinish }) {
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
    position: [0, 4.2, 13.4],
    lookAt: [0, 4.1, 0],
    setup: (stage) => {
      const ink = '#17161a'
      const pairCount = Math.max(1, Math.floor(players.length / 2))
      const cols = pairCount === 1 ? 1 : pairCount === 4 ? 2 : Math.min(3, pairCount)
      const rows = Math.ceil(pairCount / cols)
      const slotW = 2.35
      const slotH = 1.55
      const gapX = 0.3
      const gapY = 0.28
      const boardW = cols * slotW + (cols - 1) * gapX + 0.55
      const boardH = rows * slotH + (rows - 1) * gapY + 0.55

      const board = new THREE.Group()
      board.position.set(0, 4.2, 0)
      stage.scene.add(board)

      const backInk = makeBlock({
        width: boardW + 0.22,
        height: boardH + 0.22,
        depth: 0.28,
        radius: 0.2,
        color: ink,
        roughness: 0.6,
      })
      backInk.position.z = -0.3
      board.add(backInk)

      const back = makeBlock({
        width: boardW,
        height: boardH,
        depth: 0.22,
        radius: 0.16,
        color: '#f0f6ff',
        roughness: 0.9,
      })
      back.position.z = -0.14
      board.add(back)

      const table = makeBlock({
        width: boardW + 1.2,
        height: 0.22,
        depth: 1.1,
        radius: 0.1,
        color: '#eaddc9',
        roughness: 0.85,
      })
      table.position.set(0, 4.2 - boardH / 2 - 0.2, 0.15)
      stage.scene.add(table)
      addContactRing(stage.scene, {
        inner: boardW / 2 + 1,
        outer: boardW / 2 + 1.1,
        color: '#dccdb8',
        opacity: 0.6,
      })

      const pairSlots = []
      for (let index = 0; index < pairCount; index += 1) {
        const col = index % cols
        const row = Math.floor(index / cols)
        const x = -((cols - 1) * (slotW + gapX)) / 2 + col * (slotW + gapX)
        const y = ((rows - 1) * (slotH + gapY)) / 2 - row * (slotH + gapY)
        const accent = PALETTE[index % PALETTE.length]
        const group = new THREE.Group()
        group.position.set(x, y, 0.02)
        board.add(group)

        const slab = makeBlock({
          width: slotW,
          height: slotH,
          depth: 0.16,
          radius: 0.12,
          color: '#fffaf1',
          roughness: 0.82,
        })
        group.add(slab)

        const topStripe = makeBlock({
          width: slotW,
          height: 0.16,
          depth: 0.18,
          radius: 0.06,
          color: accent,
          roughness: 0.55,
        })
        topStripe.position.y = slotH / 2 - 0.08
        group.add(topStripe)

        const label = makeTextPlane(t('game.pairs.pair', { n: index + 1 }), {
          height: 0.23,
          color: ink,
          background: '#fffaf1',
          border: accent,
          borderWidth: 4,
          paddingX: 10,
          paddingY: 5,
          radius: 12,
          fontSize: 50,
          maxWidth: 160,
        })
        label.position.set(0, slotH / 2 - 0.12, 0.17)
        group.add(label)

        const trioLabel = makeTextPlane(t('game.pairs.trioGroup', { n: index + 1 }), {
          height: 0.23,
          color: ink,
          background: '#fffaf1',
          border: accent,
          borderWidth: 4,
          paddingX: 10,
          paddingY: 5,
          radius: 12,
          fontSize: 50,
          maxWidth: 170,
        })
        trioLabel.position.set(0, slotH / 2 - 0.12, 0.175)
        trioLabel.visible = false
        group.add(trioLabel)

        const link = makeBlock({
          width: 1.25,
          height: 0.11,
          depth: 0.06,
          radius: 0.04,
          color: accent,
          roughness: 0.4,
        })
        link.position.set(0, -0.14, 0.12)
        link.scale.x = 0.001
        link.visible = false
        group.add(link)

        const pads = []
        for (let p = 0; p < 3; p += 1) {
          const pad = new THREE.Mesh(
            new THREE.RingGeometry(0.29, 0.37, 26),
            new THREE.MeshBasicMaterial({
              color: accent,
              transparent: true,
              opacity: 0.34,
              side: THREE.DoubleSide,
              depthWrite: false,
              toneMapped: false,
            }),
          )
          pad.position.set((p - 1) * 0.62, -0.14, 0.1)
          pad.visible = p < 2
          pad.material.opacity = p < 2 ? 0.2 : 0.34
          group.add(pad)
          pads.push(pad)
        }

        pairSlots.push({ index, group, accent, label, trioLabel, link, pads, x, y })
      }

      const bird = makeBird({ scale: 0.72, color: '#ffd23f' })
      bird.position.set(boardW / 2 - 0.7, boardH / 2 + 0.32, 0.35)
      bird.rotation.y = 0.6
      board.add(bird)

      const tokens = players.map((player, index) => {
        const token = makeToken(player)
        token.visible = false
        token.renderOrder = 4
        board.add(token)
        return {
          token,
          player,
          pair: null,
          target: new THREE.Vector3(),
          startAt: 0,
          landAt: 0,
          landed: false,
          baseScaleX: 1,
        }
      })

      const state = {
        running: false,
        done: false,
        start: 0,
        finishedAt: 0,
        pairs: [],
        confetti: [],
      }

      const burst = () => {
        for (let i = 0; i < 30; i += 1) {
          const piece = makeBlock({
            width: 0.1,
            height: 0.1,
            depth: 0.1,
            radius: 0.02,
            color: PALETTE[i % PALETTE.length],
            segments: 1,
          })
          piece.position.set((Math.random() - 0.5) * 6, 7.4, 0.8 + Math.random())
          piece.userData = {
            vx: (Math.random() - 0.5) * 3,
            vy: 1.5 + Math.random() * 2.5,
            vz: (Math.random() - 0.5) * 2,
            spin: (Math.random() - 0.5) * 14,
          }
          stage.scene.add(piece)
          state.confetti.push(piece)
        }
      }

      stage.onFrame((dt) => {
        bird.position.y = boardH / 2 + 0.32 + Math.sin(performance.now() * 0.0014) * 0.05
        bird.userData.wings?.forEach((wing, index) => {
          wing.rotation.z = (index === 0 ? -1 : 1) * Math.sin(performance.now() * 0.007) * 0.45
        })

        if (state.running && !state.done) {
          const now = performance.now()
          state.pairs.forEach((pair) => {
            const since = now - pair.startAt
            const entrance = Math.min(1, Math.max(0, since / 480))
            const eased = easeOutBack(entrance)
            pair.tokens.forEach((item, index) => {
              item.token.visible = true
              const delay = index * 0.1
              const p = Math.min(1, Math.max(0, (entrance - delay) / (1 - delay)))
              const scale = 0.001 + easeOutBack(p)
              item.token.scale.set(scale * (item.baseScaleX ?? 1), scale, scale)
              item.token.position.x = item.target.x
              item.token.position.y = item.target.y + (1 - p) * 0.55
              item.token.position.z = item.target.z
              item.token.rotation.y = (1 - p) * Math.PI * 1.2
            })

            if (since > 360) {
              pair.link.visible = true
              const grow = Math.min(1, (since - 360) / 280)
              pair.link.scale.x = Math.max(0.001, easeOutCubic(grow))
              pair.label.scale.setScalar(1 + (1 - easeOutCubic(grow)) * 0.12)
            }
            if (since > 500 && !pair.sounded) {
              pair.sounded = true
              sfx.pop()
            }
          })

          if (now - state.start > state.totalDuration) {
            state.done = true
            state.finishedAt = now
            sfx.win()
            burst()
            setStatus('done')
            timers.current.push(
              setTimeout(() => {
                if (finishRef.current) return
                finishRef.current = true
                onFinish({
                  type: 'teams',
                  headline: t('game.pairs.result'),
                  groups: state.pairs.map((pair) => ({
                    name: pair.name,
                    playerIds: pair.players.map((player) => player.id),
                  })),
                })
              }, 1150),
            )
          }
        }

        if (state.done) {
          const since = performance.now() - state.finishedAt
          state.pairs.forEach((pair, index) => {
            pair.label.rotation.z = Math.sin(since * 0.004 + index) * 0.025
          })
        }

        if (state.confetti.length) {
          state.confetti.forEach((piece) => {
            const data = piece.userData
            data.vy -= 9 * dt
            piece.position.x += data.vx * dt
            piece.position.y += data.vy * dt
            piece.position.z += data.vz * dt
            piece.rotation.x += data.spin * dt
            piece.rotation.y += data.spin * dt
          })
          state.confetti = state.confetti.filter((piece) => {
            if (piece.position.y < -0.5) {
              stage.scene.remove(piece)
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
        const shuffled = shuffle(players)
        const groups = []
        let position = 0
        if (shuffled.length % 2 === 1) {
          groups.push(shuffled.slice(0, 3))
          position = 3
        }
        for (; position < shuffled.length; position += 2) {
          groups.push(shuffled.slice(position, position + 2))
        }
        state.pairs = []
        state.start = performance.now()
        state.running = true
        state.done = false
        setStatus('running')
        sfx.whoosh()

        const tokenById = new Map(tokens.map((item) => [item.player.id, item]))
        groups.forEach((group, pairIndex) => {
          const slot = pairSlots[pairIndex]
          const isTrio = group.length === 3
          slot.label.visible = !isTrio
          slot.trioLabel.visible = isTrio
          const pairTokens = group.map((player, index) => {
            const item = tokenById.get(player.id)
            const token = item.token
            item.baseScaleX = isTrio ? 0.8 : 1
            const x = isTrio ? (index - 1) * 0.68 : (index - 0.5) * 1.12
            const target = new THREE.Vector3(
              slot.group.position.x + x,
              slot.group.position.y - 0.15,
              0.2,
            )
            item.target = target
            item.pair = pairIndex
            item.landed = false
            item.token.position.set(target.x, target.y + 0.55, target.z)
            item.token.scale.setScalar(0.001)
            item.token.visible = false
            token.rotation.set(0, Math.PI, 0)
            slot.pads[index].visible = true
            slot.pads[index].material.opacity = 0.34
            return item
          })

          slot.link.position.y = -0.15
          slot.link.scale.x = 0.001
          slot.link.visible = false
          if (isTrio) {
            slot.link.scale.x = 0.001
            slot.link.position.set(0.04, -0.15, 0.12)
            slot.label.scale.setScalar(1)
          }
          slot.pads.forEach((pad, index) => {
            pad.visible = index < group.length
            pad.position.x = isTrio ? (index - 1) * 0.68 : (index - 0.5) * 1.12
          })

          const name = group.length === 3 ? t('game.pairs.trioGroup', { n: pairIndex + 1 }) : t('game.pairs.pair', { n: pairIndex + 1 })
          state.pairs.push({
            index: pairIndex,
            name,
            players: group,
            tokens: pairTokens,
            link: slot.link,
            label: isTrio ? slot.trioLabel : slot.label,
            startAt: performance.now() + 260 + pairIndex * 300,
            sounded: false,
          })
          slot.link.material.color = new THREE.Color(slot.accent)
        })

        state.totalDuration = 260 + groups.length * 300 + 800
        state.finishedAt = 0
      }

      const fitCamera = (aspect) => {
        const vFov = (37 * Math.PI) / 180
        const requiredWidth = boardW + 1.2
        const requiredHeight = boardH + 1.2
        const distance = Math.max(
          7.2,
          requiredWidth / (2 * Math.tan(vFov / 2) * Math.max(0.4, aspect)) + 1.1,
          requiredHeight / (2 * Math.tan(vFov / 2)) + 0.8,
        )
        stage.setCamera([0, 4.2 + distance * 0.07, distance], [0, 4.05, 0])
      }

      stage.onResize(({ aspect }) => fitCamera(aspect))

      return { start }
    },
  })

  return (
    <div className="game-root pairs-root">
      <div className="game-canvas" ref={hostRef} />
      <div className="game-hud">
        <div className="stage-note">{t('game.pairs.note')}</div>
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
              ? t('game.pairs.start')
              : status === 'running'
                ? t('game.pairs.running')
                : t('game.pairs.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
