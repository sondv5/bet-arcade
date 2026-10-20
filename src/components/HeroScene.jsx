import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useStage } from '../lib/useStage'
import { makePerson, makeRabbit, makeBird, makeButterfly } from '../lib/characters'
import {
  makeBlossomTree,
  makeCampfire,
  makeCloud,
  makeFlower,
  makeGrassClump,
  makePineTree,
  makeRock,
  makeSign,
  makeTent,
} from '../lib/scenery'

const PALETTE = ['#ff4d6d', '#ffd23f', '#2ee6a6', '#4d9bff', '#9b7bff', '#ff6fb5']

function makeBlanket() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const cell = 64
  const colors = ['#fff4dc', '#ff8d9e']
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 4; x += 1) {
      ctx.fillStyle = colors[(x + y) % 2]
      ctx.fillRect(x * cell, y * cell, cell, cell)
    }
  }
  ctx.strokeStyle = '#17161a'
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, 248, 248)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  const blanket = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 1.5),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 }),
  )
  blanket.rotation.x = -Math.PI / 2
  blanket.receiveShadow = true
  return blanket
}

function makeMiniWheel() {
  const group = new THREE.Group()
  const radius = 0.5
  const count = 6
  for (let i = 0; i < count; i += 1) {
    const start = (i / count) * Math.PI * 2
    const end = ((i + 1) / count) * Math.PI * 2
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(Math.cos(start) * radius, Math.sin(start) * radius)
    shape.absarc(0, 0, radius, start, end, false)
    shape.lineTo(0, 0)
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.09, bevelEnabled: false })
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: PALETTE[i % PALETTE.length], roughness: 0.55 }),
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.position.y = 0.06
    mesh.castShadow = true
    group.add(mesh)
  }
  const hub = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 14, 10),
    new THREE.MeshStandardMaterial({ color: '#fffaf1', roughness: 0.5 }),
  )
  hub.position.y = 0.11
  group.add(hub)
  group.userData.spinner = group
  return group
}

export default function HeroScene() {
  const hostRef = useRef(null)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const element = hostRef.current
    if (!element) return undefined
    const onMove = (event) => {
      const rect = element.getBoundingClientRect()
      pointer.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    }
    const onLeave = () => {
      pointer.current.x = 0
      pointer.current.y = 0
    }
    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  useStage(hostRef, {
    fov: 34,
    position: [6.9, 6.1, 11.2],
    lookAt: [0, 1.9, 0],
    maxDpr: 2,
    setup: (stage) => {
      const root = new THREE.Group()
      stage.scene.add(root)
      const hillTopY = 1.3

      const layerDefs = [
        { radius: 4.5, height: 0.55, y: 0.28, color: '#3fc575' },
        { radius: 3.35, height: 0.5, y: 0.8, color: '#4fd986' },
        { radius: 2.3, height: 0.44, y: 1.12, color: '#6fee9c' },
      ]
      layerDefs.forEach((def) => {
        const layer = new THREE.Mesh(
          new THREE.CylinderGeometry(def.radius, def.radius * 1.04, def.height, 40),
          new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.92 }),
        )
        layer.position.y = def.y
        layer.castShadow = true
        layer.receiveShadow = true
        root.add(layer)
      })

      const flowers = []
      const flowerColors = ['#ff6fb5', '#ffd23f', '#fff0f5', '#b19dff', '#ff9f43']
      for (let i = 0; i < 9; i += 1) {
        const flower = makeFlower({
          color: flowerColors[i % flowerColors.length],
          scale: 0.7 + (i % 3) * 0.18,
        })
        const angle = (i / 9) * Math.PI * 2 + 0.4
        const radius = 2.6 + (i % 2) * 1.3
        flower.position.set(
          Math.cos(angle) * radius,
          hillTopY - 0.12 - (i % 3) * 0.25,
          Math.sin(angle) * radius * 0.85,
        )
        flower.userData.phase = i * 0.8
        root.add(flower)
        flowers.push(flower)
      }

      for (let i = 0; i < 6; i += 1) {
        const clump = makeGrassClump({ scale: 0.7 + (i % 2) * 0.3 })
        const angle = (i / 6) * Math.PI * 2 + 1
        clump.position.set(Math.cos(angle) * 3.6, hillTopY - 0.1, Math.sin(angle) * 3.2)
        clump.userData.phase = i
        root.add(clump)
        flowers.push(clump)
      }

      const rocks = [
        [2.9, -0.2, -1.6, 0.55],
        [-3.1, -0.3, 1.2, 0.5],
      ]
      rocks.forEach(([x, y, z, s]) => {
        const rock = makeRock({ scale: s })
        rock.position.set(x, y, z)
        root.add(rock)
      })

      const sign = makeSign('BÉT!')
      sign.position.set(1.75, hillTopY - 0.06, -0.5)
      sign.rotation.y = -0.5
      root.add(sign)

      const blanket = makeBlanket()
      blanket.position.set(0, hillTopY + 0.015, 0.75)
      root.add(blanket)

      const wheel = makeMiniWheel()
      wheel.position.set(0, hillTopY + 0.02, 0.78)
      root.add(wheel)

      const personA = makePerson({
        shirt: '#ff4d6d',
        pants: '#31314a',
        skin: '#f7c29a',
        hair: '#3a3550',
        hat: '#ffd23f',
        scale: 0.92,
      })
      personA.position.set(-1.25, hillTopY, 1.05)
      personA.rotation.y = 0.35
      root.add(personA)

      const personB = makePerson({
        shirt: '#4d9bff',
        pants: '#5a432f',
        skin: '#e0a473',
        hair: '#8a5a34',
        backpack: true,
        glasses: true,
        scale: 0.88,
      })
      personB.position.set(1.1, hillTopY, 1.35)
      personB.rotation.y = -0.7
      root.add(personB)

      const balloon = new THREE.Group()
      const string = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.55, 5),
        new THREE.MeshStandardMaterial({ color: '#e7dccb', roughness: 0.8 }),
      )
      string.position.y = 0.27
      balloon.add(string)
      const balloonBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 14, 10),
        new THREE.MeshStandardMaterial({ color: '#ff6fb5', roughness: 0.4 }),
      )
      balloonBall.position.y = 0.62
      balloon.add(balloonBall)
      balloon.position.set(1.35, hillTopY + 0.5, 1.55)
      root.add(balloon)

      const rabbit = makeRabbit({ scale: 1 })
      rabbit.position.set(-1.55, hillTopY, -0.55)
      rabbit.rotation.y = 1.1
      root.add(rabbit)

      const bird = makeBird({ scale: 0.8, color: '#ffd23f' })
      bird.position.set(1.95, hillTopY + 2.15, -0.55)
      bird.rotation.y = -1.2
      root.add(bird)

      const tent = makeTent()
      tent.position.set(-2.15, hillTopY, -1.25)
      tent.scale.setScalar(0.78)
      tent.rotation.y = 0.5
      root.add(tent)

      const campfire = makeCampfire({ scale: 0.72 })
      campfire.position.set(-0.55, hillTopY, -0.9)
      root.add(campfire)

      const blossom = makeBlossomTree({ scale: 2.2, color: '#ffb3d2' })
      blossom.position.set(-2.9, 0, -1.7)
      root.add(blossom)
      const pine = makePineTree({ scale: 2.3, hue: 1 })
      pine.position.set(3, 0, -1.5)
      root.add(pine)
      const roundTree = makePineTree({ scale: 1.6, hue: 2 })
      roundTree.position.set(3.2, 0, 1.6)
      root.add(roundTree)

      const clouds = []
      for (let i = 0; i < 3; i += 1) {
        const cloud = makeCloud({ scale: 0.8 + i * 0.25 })
        cloud.position.set(-3 + i * 3.2, 3.6 + (i % 2) * 0.7, -2.5 + i * 0.8)
        root.add(cloud)
        clouds.push({ cloud, base: cloud.position.x, speed: 0.06 + i * 0.03 })
      }

      const butterflies = []
      for (let i = 0; i < 2; i += 1) {
        const butterfly = makeButterfly({
          scale: 0.75,
          colorA: i === 0 ? '#ff6fb5' : '#b19dff',
          colorB: '#ffd23f',
        })
        butterfly.position.set(-0.8 + i * 2, hillTopY + 0.8 + i * 0.3, 1.6 + i * 0.5)
        root.add(butterfly)
        butterflies.push({ butterfly, phase: i * 2.3, base: butterfly.position.clone() })
      }

      const fireflies = []
      for (let i = 0; i < 5; i += 1) {
        const fly = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 8, 6),
          new THREE.MeshStandardMaterial({ color: '#fff2b3', emissive: '#ffd23f', emissiveIntensity: 1 }),
        )
        fly.position.set(-1.6 + i * 0.8, hillTopY + 0.5 + (i % 2) * 0.5, 0.2 + (i % 3) * 0.5)
        root.add(fly)
        fireflies.push({ fly, phase: i * 1.3, base: fly.position.clone() })
      }

      stage.onFrame((dt, elapsed) => {
        root.rotation.y = Math.sin(elapsed * 0.4) * 0.03
        const targetRotX = pointer.current.y * 0.02
        root.rotation.x += (targetRotX - root.rotation.x) * Math.min(1, dt * 2)

        flowers.forEach((item) => {
          item.rotation.z = Math.sin(elapsed * 1.3 + (item.userData.phase ?? 0)) * 0.06
        })

        wheel.rotation.z += dt * 0.8

        personA.position.y = hillTopY + Math.sin(elapsed * 1.4) * 0.05
        personA.userData.arms?.forEach((arm, index) => {
          arm.rotation.z = (index === 0 ? 0.3 : -0.3) + Math.sin(elapsed * 2.2 + index) * 0.12
        })
        personB.position.y = hillTopY + Math.sin(elapsed * 1.2 + 1) * 0.04
        balloon.position.y = hillTopY + 0.5 + Math.sin(elapsed * 1.5) * 0.1
        balloon.rotation.z = Math.sin(elapsed * 0.9) * 0.05

        rabbit.position.y = hillTopY + Math.sin(elapsed * 1.7) * 0.06
        rabbit.userData.ears?.forEach((ear, index) => {
          ear.rotation.z = (index % 2 === 0 ? 0.13 : -0.13) + Math.sin(elapsed * 2.6 + index) * 0.09
        })

        bird.position.y = hillTopY + 2.15 + Math.sin(elapsed * 1.3) * 0.08
        bird.userData.wings?.forEach((wing, index) => {
          wing.rotation.z = (index === 0 ? -1 : 1) * Math.sin(elapsed * 6) * 0.5
        })

        campfire.userData.flames?.forEach((flame, index) => {
          flame.scale.set(1 + Math.sin(elapsed * 10 + index * 2) * 0.16, 1 + Math.sin(elapsed * 8 + index) * 0.22, 1)
        })

        clouds.forEach(({ cloud, base, speed }) => {
          const raw = base + elapsed * speed
          cloud.position.x = (((raw + 4.5) % 9) + 9) % 9 - 4.5
        })

        butterflies.forEach(({ butterfly, phase, base }) => {
          const angle = elapsed * 0.6 + phase
          butterfly.position.x = base.x + Math.cos(angle) * 0.6
          butterfly.position.y = base.y + Math.sin(elapsed * 1.6 + phase) * 0.18
          butterfly.userData.wings?.forEach((wing, index) => {
            wing.rotation.y = (index % 2 === 0 ? 1 : -1) * (0.35 + Math.abs(Math.sin(elapsed * 10 + phase)) * 0.9)
          })
        })

        fireflies.forEach(({ fly, phase, base }) => {
          fly.position.y = base.y + Math.sin(elapsed * 1.9 + phase) * 0.25
          fly.material.emissiveIntensity = 0.6 + Math.sin(elapsed * 3.4 + phase) * 0.4
        })
      })

      stage.onResize(({ aspect }) => {
        if (aspect < 0.85) stage.setCamera([0, 6.8, 15.5], [0, 1.8, 0])
        else if (aspect < 1.15) stage.setCamera([5.6, 6.4, 13.2], [0, 1.9, 0])
        else stage.setCamera([6.9, 6.1, 11.2], [0, 1.9, 0])
      })
    },
  })

  return <div className="hero-canvas" ref={hostRef} aria-hidden="true" />
}
