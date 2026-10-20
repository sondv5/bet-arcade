import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStage } from '../../lib/useStage'
import {
  addContactRing,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  makeBlock,
  makeTextSprite,
  PALETTE,
} from '../../lib/threeKit'
import { randomInt } from '../../lib/random'
import { makeCat } from '../../lib/characters'
import { sfx } from '../../lib/sfx'
import { UiIcon } from '../../components/icons'
import { useI18n } from '../../i18n'
import './cards.css'

const CARD_W = 1.12
const CARD_D = 1.52

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

function makeBackCanvas(accent) {
  const canvas = document.createElement('canvas')
  canvas.width = 420
  canvas.height = 560
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, 420, 560)
  ctx.strokeStyle = 'rgba(255,250,241,.18)'
  ctx.lineWidth = 3
  for (let i = -560; i < 900; i += 34) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + 560, 560)
    ctx.stroke()
  }
  roundedRect(ctx, 16, 16, 388, 528, 32)
  ctx.fillStyle = '#fffaf1'
  ctx.fill()
  ctx.strokeStyle = '#17161a'
  ctx.lineWidth = 9
  ctx.stroke()

  roundedRect(ctx, 32, 32, 356, 496, 24)
  ctx.strokeStyle = accent
  ctx.lineWidth = 7
  ctx.stroke()

  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(210, 280, 104, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fffaf1'
  ctx.font = '800 130px "Baloo 2", "Be Vietnam Pro", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('?', 210, 290)

  ctx.fillStyle = '#17161a'
  for (const [x, y] of [
    [74, 82],
    [346, 82],
    [74, 478],
    [346, 478],
  ]) {
    ctx.beginPath()
    ctx.arc(x, y, 7, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(255,250,241,.75)'
  ctx.font = '700 19px "Be Vietnam Pro", sans-serif'
  ctx.fillText('BÉT!', 210, 505)
  return canvas
}

function makeSafeCanvas(accent) {
  const canvas = document.createElement('canvas')
  canvas.width = 420
  canvas.height = 560
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fffaf1'
  ctx.fillRect(0, 0, 420, 560)
  ctx.strokeStyle = '#17161a'
  ctx.lineWidth = 11
  roundedRect(ctx, 16, 16, 388, 528, 32)
  ctx.stroke()
  ctx.strokeStyle = accent
  ctx.lineWidth = 5
  roundedRect(ctx, 32, 32, 356, 496, 24)
  ctx.stroke()

  const cx = 210
  const cy = 274
  ctx.save()
  ctx.translate(cx, cy)
  ctx.fillStyle = accent
  ctx.strokeStyle = '#17161a'
  ctx.lineWidth = 9
  ctx.beginPath()
  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2 - Math.PI / 2
    const radius = i % 2 === 0 ? 128 : 52
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = accent
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(210 + Math.cos(angle) * 172, 282 + Math.sin(angle) * 172, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  return canvas
}

function makeSkullCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = 420
  canvas.height = 560
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fffaf1'
  ctx.fillRect(0, 0, 420, 560)
  ctx.strokeStyle = '#17161a'
  ctx.lineWidth = 11
  roundedRect(ctx, 16, 16, 388, 528, 32)
  ctx.stroke()
  ctx.strokeStyle = '#ff4d6d'
  ctx.lineWidth = 5
  roundedRect(ctx, 32, 32, 356, 496, 24)
  ctx.stroke()

  ctx.fillStyle = '#17161a'
  ctx.strokeStyle = '#17161a'
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.moveTo(210, 125)
  ctx.bezierCurveTo(106, 125, 88, 220, 108, 286)
  ctx.bezierCurveTo(122, 328, 150, 337, 154, 372)
  ctx.lineTo(266, 372)
  ctx.bezierCurveTo(270, 337, 298, 328, 312, 286)
  ctx.bezierCurveTo(332, 220, 314, 125, 210, 125)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#fffaf1'
  ctx.beginPath()
  ctx.arc(172, 250, 37, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(248, 250, 37, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(210, 276)
  ctx.lineTo(190, 320)
  ctx.lineTo(230, 320)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#17161a'
  ctx.beginPath()
  ctx.arc(172, 254, 15, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(248, 254, 15, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fffaf1'
  for (let i = 0; i < 4; i += 1) {
    roundedRect(ctx, 162 + i * 25, 385, 19, 52, 8)
    ctx.fill()
  }

  return canvas
}

function toTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  return texture
}

function makeCardGroup(accent, skull) {
  const group = new THREE.Group()
  const base = makeBlock({
    width: CARD_W,
    height: 0.065,
    depth: CARD_D,
    radius: 0.07,
    color: '#f7ecdc',
    roughness: 0.7,
  })
  base.castShadow = true
  base.receiveShadow = true
  group.add(base)

  const backPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 1.38),
    new THREE.MeshBasicMaterial({ map: toTexture(makeBackCanvas(accent)), toneMapped: false }),
  )
  backPlane.rotation.x = -Math.PI / 2
  backPlane.position.y = 0.036
  group.add(backPlane)

  const frontPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 1.38),
    new THREE.MeshBasicMaterial({
      map: toTexture(skull ? makeSkullCanvas() : makeSafeCanvas(accent)),
      toneMapped: false,
    }),
  )
  frontPlane.rotation.x = Math.PI / 2
  frontPlane.position.y = -0.036
  group.add(frontPlane)

  return { group, base, backPlane, frontPlane }
}

export default function CardsGame({ players, onFinish }) {
  const { t } = useI18n()
  const hostRef = useRef(null)
  const [status, setStatus] = useState('dealing')
  const [turn, setTurn] = useState(0)
  const [remaining, setRemaining] = useState(players.length)
  const timers = useRef([])
  const finishRef = useRef(false)

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const api = useStage(hostRef, {
    fov: 42,
    position: [0, 8.2, 10.8],
    lookAt: [0, 0.8, 1.1],
    setup: (stage) => {
      const count = players.length
      const cols = count <= 4 ? count : 4
      const rows = Math.ceil(count / cols)
      const spacingX = 1.55
      const spacingZ = 1.85
      const gridW = (cols - 1) * spacingX + CARD_W
      const gridD = (rows - 1) * spacingZ + CARD_D
      const tableW = Math.max(5.4, gridW + 2.4)
      const tableD = Math.max(4.2, gridD + 2.2)
      const tableCentreZ = 0.8
      const tableTop = 0.68
      const ink = '#17161a'
      const skullIndex = randomInt(count)
      const accentChoices = PALETTE

      const world = new THREE.Group()
      stage.scene.add(world)

      const base = makeBlock({
        width: tableW + 0.3,
        height: 0.3,
        depth: tableD + 0.3,
        radius: 0.18,
        color: ink,
        roughness: 0.65,
      })
      base.position.set(0, 0.15, tableCentreZ)
      world.add(base)

      const table = makeBlock({
        width: tableW,
        height: 0.36,
        depth: tableD,
        radius: 0.2,
        color: '#efe3d1',
        roughness: 0.9,
      })
      table.position.set(0, 0.45, tableCentreZ)
      table.receiveShadow = true
      world.add(table)

      const felt = makeBlock({
        width: tableW - 0.3,
        height: 0.06,
        depth: tableD - 0.3,
        radius: 0.14,
        color: '#46d8b0',
        roughness: 0.82,
      })
      felt.position.set(0, tableTop - 0.012, tableCentreZ)
      world.add(felt)

      const dealer = makeCat({ scale: 0.85, color: '#fff2dd' })
      dealer.position.set(tableW / 2 - 1.35, tableTop, tableCentreZ + tableD / 2 - 0.45)
      dealer.rotation.y = -0.9
      world.add(dealer)

      addContactRing(stage.scene, {
        inner: Math.max(tableW, tableD) / 2 + 0.9,
        outer: Math.max(tableW, tableD) / 2 + 1,
        color: '#dccdb8',
        opacity: 0.55,
      })

      const cards = []
      const hitMeshes = []
      for (let index = 0; index < count; index += 1) {
        const col = index % cols
        const row = Math.floor(index / cols)
        const x = -((cols - 1) * spacingX) / 2 + col * spacingX
        const z = tableCentreZ + ((rows - 1) * spacingZ) / 2 - row * spacingZ
        const accent = accentChoices[index % accentChoices.length]
        const { group, base: cardBase } = makeCardGroup(accent, index === skullIndex)
        group.position.set(0, 0.73 + index * 0.01, 0.3)
        group.userData.cardIndex = index
        cardBase.userData.cardIndex = index
        world.add(group)
        hitMeshes.push(cardBase)

        const mat = makeBlock({
          width: CARD_W + 0.18,
          height: 0.025,
          depth: CARD_D + 0.18,
          radius: 0.07,
          color: '#fff3dc',
          roughness: 0.85,
        })
        mat.position.set(x, tableTop + 0.02, z)
        world.add(mat)

        cards.push({
          index,
          group,
          accent,
          x,
          z,
          skull: index === skullIndex,
          flipped: false,
          flipping: false,
          flipStart: 0,
          hovered: false,
          targetY: 0.73,
          resolved: false,
          dealDelay: index * 45,
          dealStart: 0,
        })
      }

      const stack = makeBlock({
        width: 1.1,
        height: 0.2,
        depth: 1.5,
        radius: 0.07,
        color: '#e7d9c5',
        roughness: 0.8,
      })
      stack.position.set(tableW / 2 - 1.15, tableTop + 0.12, tableCentreZ + tableD / 2 - 1.1)
      stack.rotation.y = -0.25
      world.add(stack)
      const stackCardA = makeBlock({
        width: 0.95,
        height: 0.035,
        depth: 1.3,
        radius: 0.04,
        color: '#ff6fb5',
        roughness: 0.6,
      })
      stackCardA.position.set(tableW / 2 - 1.15, tableTop + 0.24, tableCentreZ + tableD / 2 - 1.1)
      stackCardA.rotation.y = 0.18
      world.add(stackCardA)
      const stackCardB = stackCardA.clone()
      stackCardB.position.y += 0.04
      stackCardB.rotation.y = -0.12
      world.add(stackCardB)

      const safeBanner = makeTextSprite(t('game.cards.safe'), {
        height: 0.5,
        color: '#17161a',
        background: '#2ee6a6',
        border: '#17161a',
        borderWidth: 6,
        paddingX: 16,
        paddingY: 7,
        fontSize: 72,
        fontWeight: 800,
      })
      safeBanner.visible = false
      world.add(safeBanner)

      const skullBanner = makeTextSprite(t('game.cards.skull'), {
        height: 0.58,
        color: '#fffaf1',
        background: '#ff4d6d',
        border: '#17161a',
        borderWidth: 6,
        paddingX: 16,
        paddingY: 7,
        fontSize: 72,
        fontWeight: 800,
      })
      skullBanner.visible = false
      world.add(skullBanner)

      const state = {
        phase: 'dealing',
        dealStart: performance.now(),
        readyAt: performance.now() + 700 + count * 55,
        currentTurn: 0,
        remaining: count,
        banner: null,
        shake: 0,
        skullRevealAt: 0,
        confetti: [],
        dealSound: false,
      }

      const burst = (x, z, colorful) => {
        for (let i = 0; i < 18; i += 1) {
          const piece = makeBlock({
            width: 0.1,
            height: 0.1,
            depth: 0.1,
            radius: 0.02,
            color: colorful ? PALETTE[i % PALETTE.length] : i % 3 === 0 ? '#ff4d6d' : '#17161a',
            segments: 1,
          })
          piece.position.set(x, 1.1, z)
          piece.userData = {
            vx: (Math.random() - 0.5) * 3,
            vy: 1.5 + Math.random() * 2,
            vz: (Math.random() - 0.5) * 3,
            spin: (Math.random() - 0.5) * 12,
            ttl: 1.5,
          }
          world.add(piece)
          state.confetti.push(piece)
        }
      }

      const showBanner = (sprite, card, kind) => {
        sprite.visible = true
        sprite.position.set(card.x, 1.9, card.z + 0.4)
        sprite.scale.setScalar(0.001)
        state.banner = { sprite, start: performance.now(), kind }
      }

      const finish = (loserIndex) => {
        if (finishRef.current) return
        finishRef.current = true
        onFinish({
          type: 'players',
          playerIds: [players[loserIndex].id],
          headline: t('game.cards.result'),
          tone: 'lose',
        })
      }

      const reveal = (card) => {
        card.flipped = true
        card.flipping = false
        card.flipStart = 0
        card.group.rotation.x = -Math.PI
        card.group.position.y = card.targetY

        if (card.skull) {
          state.phase = 'done'
          state.skullRevealAt = performance.now()
          state.shake = 0.8
          showBanner(skullBanner, card, 'skull')
          burst(card.x, card.z, false)
          sfx.boom()
          sfx.lose()
          setStatus('done')
          timers.current.push(setTimeout(() => finish(state.currentTurn), 1450))
        } else {
          state.phase = 'resolving'
          showBanner(safeBanner, card, 'safe')
          burst(card.x, card.z, true)
          sfx.pop()
          timers.current.push(
            setTimeout(() => {
              state.currentTurn = (state.currentTurn + 1) % players.length
              setTurn(state.currentTurn)
              state.phase = 'playing'
              setStatus('playing')
              safeBanner.visible = false
            }, 720),
          )
        }
      }

      const flipCard = (index) => {
        if (state.phase !== 'playing') return
        const card = cards[index]
        if (!card || card.flipped || card.flipping) return
        card.flipping = true
        card.flipStart = performance.now()
        card.hovered = false
        state.phase = 'flipping'
        state.remaining = Math.max(0, state.remaining - 1)
        setRemaining(state.remaining)
        setStatus('flipping')
        sfx.whoosh()
      }

      const flipRandom = () => {
        if (state.phase !== 'playing') return
        const available = cards.filter((card) => !card.flipped && !card.flipping)
        if (available.length) flipCard(available[randomInt(available.length)].index)
      }

      const raycaster = new THREE.Raycaster()
      const pointer = new THREE.Vector2()
      const canvas = stage.renderer.domElement
      canvas.style.touchAction = 'manipulation'

      const getCardIndex = (event) => {
        const rect = canvas.getBoundingClientRect()
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(pointer, stage.camera)
        const hits = raycaster.intersectObjects(hitMeshes, false)
        return hits.length ? hits[0].object.userData.cardIndex : null
      }

      const onPointerDown = (event) => {
        if (state.phase !== 'playing') return
        const index = getCardIndex(event)
        if (index !== null) {
          event.preventDefault()
          flipCard(index)
        }
      }

      const onPointerMove = (event) => {
        if (event.pointerType !== 'mouse' || state.phase !== 'playing') return
        const index = getCardIndex(event)
        cards.forEach((card) => {
          card.hovered = index === card.index && !card.flipped && !card.flipping
        })
        canvas.style.cursor = index !== null ? 'pointer' : 'default'
      }

      const onPointerLeave = () => {
        cards.forEach((card) => {
          card.hovered = false
        })
        canvas.style.cursor = 'default'
      }

      canvas.addEventListener('pointerdown', onPointerDown)
      canvas.addEventListener('pointermove', onPointerMove)
      canvas.addEventListener('pointerleave', onPointerLeave)

      stage.onFrame((dt) => {
        const now = performance.now()
        dealer.position.y = tableTop + Math.sin(now * 0.0016) * 0.03
        dealer.userData.paw.rotation.z = 0.7 + Math.sin(now * 0.0026) * 0.28

        if (state.phase === 'dealing') {
          cards.forEach((card) => {
            const p = Math.min(1, Math.max(0, (now - state.dealStart - card.dealDelay) / 460))
            const eased = easeOutCubic(p)
            card.group.position.x = card.x * eased
            card.group.position.z = 0.3 + (card.z - 0.3) * eased
            card.group.position.y = 0.73 + Math.sin(p * Math.PI) * 0.25 + eased * 0.01
            card.group.rotation.y = (1 - eased) * 0.55
            if (p >= 1) {
              card.group.position.set(card.x, card.targetY, card.z)
              card.group.rotation.y = 0
            }
          })
          if (now >= state.readyAt) {
            state.phase = 'playing'
            setStatus('playing')
          }
        }

        cards.forEach((card) => {
          if (card.flipping) {
            const p = Math.min(1, (now - card.flipStart) / 520)
            const eased = easeInOutCubic(p)
            card.group.position.y = card.targetY + Math.sin(p * Math.PI) * 0.55
            card.group.rotation.x = -Math.PI * eased
            if (p >= 1) reveal(card)
          } else if (!card.flipped) {
            const targetY = card.targetY + (card.hovered ? 0.09 : 0)
            card.group.position.y += (targetY - card.group.position.y) * Math.min(1, dt * 12)
            card.group.rotation.x += (0 - card.group.rotation.x) * Math.min(1, dt * 10)
          }
        })

        if (state.banner) {
          const p = Math.min(1, (now - state.banner.start) / 420)
          const sprite = state.banner.sprite
          sprite.scale.setScalar(Math.max(0.001, easeOutBack(p)))
          sprite.position.y = 1.9 + Math.sin(now * 0.004) * 0.045
          if (state.banner.kind === 'skull') {
            sprite.material.opacity = 1
          }
        }

        if (state.shake > 0) {
          state.shake = Math.max(0, state.shake - dt * 2)
          world.position.x = Math.sin(now * 0.08) * state.shake * 0.1
          world.position.z = Math.cos(now * 0.11) * state.shake * 0.08
        } else {
          world.position.x = 0
          world.position.z = 0
        }

        if (state.confetti.length) {
          state.confetti.forEach((piece) => {
            const data = piece.userData
            data.ttl -= dt
            data.vy -= 10 * dt
            piece.position.x += data.vx * dt
            piece.position.y += data.vy * dt
            piece.position.z += data.vz * dt
            piece.rotation.x += data.spin * dt
            piece.rotation.y += data.spin * dt
            if (piece.position.y < 0.7) {
              piece.position.y = 0.7
              data.vy *= -0.35
              data.vx *= 0.8
              data.vz *= 0.8
            }
          })
        }
      })

      stage.onResize(({ aspect }) => {
        if (aspect < 0.8) stage.setCamera([0, 10.7, 19.2], [0, 0.7, tableCentreZ + 0.4])
        else if (aspect < 1.2) stage.setCamera([0, 9.6, 14.2], [0, 0.7, tableCentreZ + 0.4])
        else stage.setCamera([0, 8.2, 10.8], [0, 0.8, tableCentreZ + 0.3])
      })

      return {
        flipRandom,
        destroy() {
          canvas.removeEventListener('pointerdown', onPointerDown)
          canvas.removeEventListener('pointermove', onPointerMove)
          canvas.removeEventListener('pointerleave', onPointerLeave)
        },
      }
    },
  })

  const currentPlayer = players[turn] ?? players[0]
  const note =
    status === 'dealing'
      ? t('game.cards.note')
      : status === 'flipping'
        ? t('game.cards.flipping')
        : status === 'done'
          ? t('game.cards.skull')
          : t('game.cards.turn', { name: currentPlayer?.name ?? '' })

  return (
    <div className="game-root cards-root">
      <div className="game-canvas" ref={hostRef} />
      <div className="game-hud">
        <div className="stage-note cards-note" style={{ '--turn-color': currentPlayer?.color ?? '#ff4d6d' }}>
          <span className="cards-turn-dot" />
          {note}
        </div>
        <div className="game-readout">
          <span className="chip">{t('game.cards.remaining', { count: remaining })}</span>
        </div>
        <div className="stage-controls">
          <button
            type="button"
            className="btn btn-primary"
            disabled={status !== 'playing'}
            onClick={() => api.current?.flipRandom()}
          >
            <UiIcon name="shuffle" size={17} />
            {t('game.cards.random')}
          </button>
        </div>
      </div>
    </div>
  )
}
