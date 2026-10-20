import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStage } from '../../lib/useStage'
import { easeOutCubic, makeBlock, makePlayerBlock } from '../../lib/threeKit'
import { randomInt } from '../../lib/random'
import { sfx } from '../../lib/sfx'

/**
 * DEMO ONLY — not part of the dashboard.
 * A minimal but complete example of the mini-game contract:
 * three.js scene via useStage, player blocks, timeouts, result callback.
 */
export default function DemoGame({ players, onFinish }) {
  const hostRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const busyRef = useRef(false)
  const timers = useRef([])

  const api = useStage(hostRef, {
    fov: 36,
    position: [0, 7, 12],
    lookAt: [0, 1.2, 0],
    setup: (stage) => {
      const group = new THREE.Group()
      stage.scene.add(group)

      const radius = 3.6
      const blocks = players.map((player, index) => {
        const block = makePlayerBlock(player, { size: 1 })
        const angle = (index / players.length) * Math.PI * 2 - Math.PI / 2
        block.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
        block.rotation.y = -angle
        group.add(block)
        return block
      })

      const pointerGroup = new THREE.Group()
      pointerGroup.position.y = 3.4
      const pointer = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 0.8, 4),
        new THREE.MeshStandardMaterial({ color: '#17161a', roughness: 0.4 }),
      )
      pointer.rotation.x = Math.PI
      pointer.position.set(0, 0, radius)
      pointer.castShadow = true
      pointerGroup.add(pointer)
      stage.scene.add(pointerGroup)

      const state = { target: 0, from: 0, to: 0, start: 0, spinning: false, done: false }

      stage.onFrame((dt, elapsed) => {
        blocks.forEach((block, index) => {
          block.position.y = Math.sin(elapsed * 1.6 + index) * 0.05
        })

        if (!state.spinning) {
          pointerGroup.rotation.y += dt * 0.35
          return
        }

        const progress = Math.min(1, (performance.now() - state.start) / 2600)
        const eased = easeOutCubic(progress)
        pointerGroup.rotation.y = state.from + (state.to - state.from) * eased
        if (progress >= 1 && !state.done) {
          state.done = true
          state.spinning = false
          const chosen = blocks[state.target]
          chosen.scale.setScalar(1.18)
          timers.current.push(
            setTimeout(() => {
              chosen.scale.setScalar(1)
              sfx.win()
              setStatus('done')
              const player = players[state.target]
              timers.current.push(
                setTimeout(
                  () =>
                    onFinish({
                      type: 'players',
                      playerIds: [player.id],
                      headline: 'Người được chọn',
                      tone: 'pick',
                    }),
                  600,
                ),
              )
            }, 180),
          )
        }
      })

      const spin = () => {
        if (state.spinning || busyRef.current) return
        busyRef.current = true
        setStatus('spinning')
        sfx.spin()
        const target = randomInt(players.length)
        const slice = (Math.PI * 2) / players.length
        const desired = -slice * target - Math.PI / 2
        const current = pointerGroup.rotation.y
        state.target = target
        state.from = current
        state.to = current + Math.PI * 6 + (desired - current) % (Math.PI * 2)
        state.start = performance.now()
        state.spinning = true
        state.done = false
      }

      stage.onResize(({ aspect }) => {
        stage.setCamera(aspect < 0.8 ? [0, 8.5, 15] : [0, 7, 12], [0, 1.2, 0])
      })

      return { spin }
    },
  })

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  return (
    <div className="game-root">
      <div className="game-canvas" ref={hostRef} />
      <div className="game-hud">
        <div className="stage-note">Bấm quay để chọn người. Vòng quay dừng lại sau vài giây.</div>
        <div className="stage-controls">
          <button type="button" className="btn btn-primary" disabled={status !== 'idle'} onClick={() => api.current?.spin()}>
            {status === 'idle' ? 'Quay thử' : status === 'spinning' ? 'Đang quay…' : 'Đã chốt'}
          </button>
        </div>
      </div>
    </div>
  )
}
