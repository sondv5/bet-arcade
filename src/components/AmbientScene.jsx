import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useStage } from '../lib/useStage'
import { makePerson, makeRabbit, makeBird, makeDuck, makeButterfly } from '../lib/characters'
import {
  makeBlossomTree,
  makeBush,
  makeCampfire,
  makeCloud,
  makeFlower,
  makeGrassClump,
  makeLilyPad,
  makeMountain,
  makePineTree,
  makeRock,
  makeRoundTree,
  makeStonePath,
  makeTent,
} from '../lib/scenery'
import './AmbientScene.css'

const grassMat = (color, opts) => new THREE.MeshStandardMaterial({ color, roughness: 0.95, flatShading: true, ...opts })

function shadowBlob(radius, opacity = 0.16) {
  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 18),
    new THREE.MeshBasicMaterial({ color: '#14512c', transparent: true, opacity }),
  )
  blob.rotation.x = -Math.PI / 2
  blob.position.y = 0.015
  return blob
}

function glowSprite(color = 'rgba(255,224,130,0.85)') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(128, 128, 8, 128, 128, 128)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.45, 'rgba(255,220,120,0.32)')
  gradient.addColorStop(1, 'rgba(255,220,120,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)
  const texture = new THREE.CanvasTexture(canvas)
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0.9 }),
  )
  return sprite
}

export default function AmbientScene() {
  const hostRef = useRef(null)
  const pointer = useRef({ x: 0, y: 0 })
  const scroll = useRef(0)

  useEffect(() => {
    const onMove = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2
    }
    const onScroll = () => {
      scroll.current = window.scrollY || 0
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useStage(hostRef, {
    fov: 44,
    position: [0, 5.4, 19],
    lookAt: [0, 4.8, -6],
    shadows: false,
    ground: false,
    maxDpr: 1.4,
    setup: (stage) => {
      const world = new THREE.Group()
      stage.scene.add(world)
      const isMobile = stage.mobile

      const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 140), grassMat('#5fd48b'))
      ground.rotation.x = -Math.PI / 2
      ground.position.set(0, 0, -22)
      ground.receiveShadow = false
      world.add(ground)

      const hillDefs = [
        { x: -17, y: -0.8, z: -15, sx: 15, sy: 3.4, sz: 9, color: '#46cf82' },
        { x: 15, y: -1, z: -12, sx: 13, sy: 3, sz: 9, color: '#5fdc90' },
        { x: 0, y: -2.2, z: -25, sx: 26, sy: 4.4, sz: 17, color: '#3fc575' },
        { x: -9, y: -0.5, z: 3, sx: 12, sy: 1.7, sz: 7, color: '#6fe39c' },
        { x: 11, y: -0.5, z: 2, sx: 10, sy: 1.6, sz: 6, color: '#78e8a4' },
      ]
      const hills = hillDefs.map((def) => {
        const hill = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), grassMat(def.color))
        hill.scale.set(def.sx, def.sy, def.sz)
        hill.position.set(def.x, def.y, def.z)
        hill.rotation.y = Math.random() * 2
        world.add(hill)
        return hill
      })

      const mountainDefs = [
        { x: -19, z: -40, r: 9, h: 13, c: '#8d86ff' },
        { x: 2, z: -44, r: 14, h: 20, c: '#9b7bff' },
        { x: 21, z: -39, r: 8, h: 12, c: '#7fa0ff' },
        { x: -5, z: -38, r: 6.5, h: 10, c: '#a993ff' },
      ]
      mountainDefs.forEach((def) => {
        const mountain = makeMountain({ radius: def.r, height: def.h, color: def.c })
        mountain.position.set(def.x, 0, def.z)
        world.add(mountain)
      })

      const clouds = []
      const cloudDefs = [
        { x: -10, y: 9.5, z: -18, s: 1.5, speed: 0.14 },
        { x: 6, y: 11.5, z: -22, s: 1.2, speed: 0.1 },
        { x: 14, y: 8.6, z: -12, s: 1.8, speed: 0.18 },
        { x: -16, y: 12.6, z: -28, s: 1.4, speed: 0.08 },
        { x: -2, y: 13.8, z: -32, s: 1.1, speed: 0.06 },
      ]
      cloudDefs.slice(0, isMobile ? 3 : 5).forEach((def) => {
        const cloud = makeCloud({ scale: def.s })
        cloud.position.set(def.x, def.y, def.z)
        world.add(cloud)
        clouds.push({ cloud, speed: def.speed, base: def.x })
      })

      const sun = new THREE.Mesh(
        new THREE.SphereGeometry(1.7, 20, 14),
        new THREE.MeshStandardMaterial({ color: '#ffd23f', emissive: '#ffb528', emissiveIntensity: 0.85, roughness: 0.4 }),
      )
      sun.position.set(14, 13.2, -34)
      world.add(sun)
      const sunGlow = glowSprite()
      sunGlow.scale.set(16, 16, 1)
      sunGlow.position.set(14, 13.2, -34)
      world.add(sunGlow)

      const treeList = isMobile
        ? [
            { kind: 'pine', x: -9.5, z: -4, s: 1.7 },
            { kind: 'blossom', x: 9.8, z: -6, s: 2 },
            { kind: 'pine', x: 11, z: -16, s: 2.6 },
          ]
        : [
            { kind: 'pine', x: -10.5, z: -5, s: 2.1 },
            { kind: 'blossom', x: -13.2, z: -1.5, s: 2.5 },
            { kind: 'pine', x: -15.5, z: -14, s: 3.2 },
            { kind: 'round', x: 10.5, z: -7, s: 1.9 },
            { kind: 'pine', x: 13.2, z: -2.5, s: 2.3 },
            { kind: 'blossom', x: 14.6, z: -12, s: 2.1 },
            { kind: 'pine', x: -18, z: -22, s: 3.6 },
            { kind: 'pine', x: 17, z: -24, s: 4 },
          ]
      const trees = treeList.map((item) => {
        const tree =
          item.kind === 'pine'
            ? makePineTree({ scale: item.s, hue: Math.floor(Math.random() * 3) })
            : item.kind === 'blossom'
              ? makeBlossomTree({ scale: item.s })
              : makeRoundTree({ scale: item.s })
        tree.position.set(item.x, 0, item.z)
        tree.rotation.y = Math.random() * Math.PI * 2
        world.add(tree)
        const blob = shadowBlob(item.s * 0.55)
        blob.position.set(item.x, 0.02, item.z)
        world.add(blob)
        return tree
      })

      const bushSpots = [
        [-7.6, -1.2, 0.9, 0x3bd879],
        [8.6, 0.6, 1.1, 0x2fc77b],
        [-11.8, 2.2, 0.8, 0x3bd879],
      ]
      bushSpots.forEach(([x, z, s]) => {
        const bush = makeBush({ scale: s })
        bush.position.set(x, 0, z)
        world.add(bush)
      })

      const rocks = [
        [6.5, -3.5, 0.9],
        [-4.8, -9, 0.7],
        [12.5, -1, 0.6],
      ]
      rocks.forEach(([x, z, s]) => {
        const rock = makeRock({ scale: s })
        rock.position.set(x, 0, z)
        world.add(rock)
      })

      const swayers = []
      const flowerCount = isMobile ? 7 : 15
      const flowerColors = ['#ff6fb5', '#ffd23f', '#ff8f6b', '#fff0f5', '#b19dff', '#ff4d6d']
      for (let i = 0; i < flowerCount; i += 1) {
        const side = i % 2 === 0 ? -1 : 1
        const flower = makeFlower({
          color: flowerColors[i % flowerColors.length],
          scale: 0.85 + (i % 4) * 0.2,
        })
        const x = side * (7.5 + (i % 4) * 1.5)
        const z = 2 + (i % 3) * 2.2 + Math.sin(i) * 1.2
        flower.position.set(x, 0, z)
        flower.rotation.y = (i % 5) * 0.7
        flower.userData.phase = i * 0.7
        flower.userData.baseZ = flower.rotation.z
        world.add(flower)
        swayers.push(flower)
      }

      const grassCount = isMobile ? 7 : 13
      for (let i = 0; i < grassCount; i += 1) {
        const clump = makeGrassClump({ scale: 0.8 + (i % 3) * 0.3 })
        const side = i % 2 === 0 ? -1 : 1
        clump.position.set(side * (6 + (i % 5) * 2), 0, -3 + (i % 4) * 2.4)
        clump.userData.phase = i
        world.add(clump)
        swayers.push(clump)
      }

      const path = makeStonePath(7)
      path.position.set(-5.6, 0.02, -1)
      path.rotation.y = 0.35
      world.add(path)

      const pond = new THREE.Mesh(
        new THREE.CylinderGeometry(2.9, 3.2, 0.1, 26),
        new THREE.MeshStandardMaterial({ color: '#43c7f4', roughness: 0.25, metalness: 0.05 }),
      )
      pond.position.set(9.2, 0.03, 4.6)
      world.add(pond)
      const pondRim = new THREE.Mesh(
        new THREE.TorusGeometry(3.05, 0.16, 8, 30),
        grassMat('#ffd9b0'),
      )
      pondRim.rotation.x = -Math.PI / 2
      pondRim.position.set(9.2, 0.04, 4.6)
      world.add(pondRim)

      const lily = makeLilyPad({ scale: 1.1 })
      lily.position.set(8.6, 0.06, 4.2)
      world.add(lily)
      const lilyTwo = makeLilyPad({ scale: 0.9 })
      lilyTwo.position.set(9.9, 0.06, 5.1)
      world.add(lilyTwo)

      const duck = makeDuck({ scale: 1.15 })
      duck.position.set(9.1, 0.05, 4.5)
      duck.rotation.y = -0.7
      world.add(duck)

      const tent = makeTent()
      tent.position.set(-7.3, 0, -7.6)
      world.add(tent)
      const tentBlob = shadowBlob(0.9)
      tentBlob.position.set(-7.3, 0.02, -7.6)
      world.add(tentBlob)

      const campfire = makeCampfire({ scale: 0.85 })
      campfire.position.set(-6.2, 0, -6.4)
      world.add(campfire)

      const personA = makePerson({
        shirt: '#ff4d6d',
        pants: '#31314a',
        skin: '#f7c29a',
        hair: '#3a3550',
        hat: '#ffd23f',
        scale: 0.85,
      })
      personA.position.set(-7, 0, -5.4)
      personA.rotation.y = 0.9
      world.add(personA)
      const blobA = shadowBlob(0.5)
      blobA.position.set(-7, 0.02, -5.4)
      world.add(blobA)

      const personB = makePerson({
        shirt: '#4d9bff',
        pants: '#5a432f',
        skin: '#e0a473',
        hair: '#8a5a34',
        backpack: true,
        scale: 0.8,
      })
      personB.position.set(-5.6, 0, -6.8)
      personB.rotation.y = -0.6
      world.add(personB)
      const blobB = shadowBlob(0.45)
      blobB.position.set(-5.6, 0.02, -6.8)
      world.add(blobB)

      const rabbit = makeRabbit({ scale: 1.15 })
      rabbit.position.set(10.4, 0, -5.6)
      rabbit.rotation.y = 2.6
      world.add(rabbit)
      const rabbitBlob = shadowBlob(0.55)
      rabbitBlob.position.set(10.4, 0.02, -5.6)
      world.add(rabbitBlob)

      const butterflies = []
      for (let i = 0; i < (isMobile ? 2 : 3); i += 1) {
        const butterfly = makeButterfly({
          scale: 0.9 + i * 0.15,
          colorA: i % 2 === 0 ? '#ff6fb5' : '#b19dff',
          colorB: '#ffd23f',
        })
        const side = i % 2 === 0 ? -1 : 1
        butterfly.position.set(side * (6.5 + i * 1.5), 0.9 + i * 0.25, 2.4 + i)
        world.add(butterfly)
        butterflies.push({ butterfly, phase: i * 2.1, base: butterfly.position.clone() })
      }

      const birds = []
      const birdColors = ['#ffd23f', '#ff9f43', '#4d9bff', '#ff6fb5', '#2ee6a6']
      for (let i = 0; i < (isMobile ? 3 : 5); i += 1) {
        const bird = makeBird({ scale: 0.75 + (i % 2) * 0.2, color: birdColors[i % birdColors.length] })
        world.add(bird)
        birds.push({
          bird,
          phase: i * 1.3,
          radius: 6 + (i % 3) * 2.5,
          height: 9.4 + (i % 3),
          speed: 0.09 + (i % 3) * 0.02,
        })
      }

      const sparkles = []
      for (let i = 0; i < (isMobile ? 5 : 8); i += 1) {
        const sparkle = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 8, 6),
          new THREE.MeshStandardMaterial({ color: '#fff2b3', emissive: '#ffd23f', emissiveIntensity: 0.9 }),
        )
        const nearPond = i % 2 === 0
        sparkle.position.set(
          nearPond ? 8.4 + (i % 3) * 0.9 : -6.6 + (i % 3) * 0.8,
          0.75 + (i % 3) * 0.4,
          nearPond ? 3.8 + i * 0.4 : -6.2 - i * 0.4,
        )
        world.add(sparkle)
        sparkles.push({ sparkle, phase: i * 1.1, base: sparkle.position.clone() })
      }

      const cam = { x: 0, y: 5.4, z: 19, lookY: 4.8, lookZ: -6 }

      stage.onFrame((dt, elapsed) => {
        clouds.forEach((item) => {
          const raw = item.base + elapsed * item.speed
          item.cloud.position.x = (((raw + 17) % 34) + 34) % 34 - 17
          item.cloud.rotation.z = Math.sin(elapsed * 0.3 + item.base) * 0.01
        })

        sunGlow.material.opacity = 0.8 + Math.sin(elapsed * 0.5) * 0.1
        sun.rotation.y += dt * 0.05

        swayers.forEach((item) => {
          item.rotation.z = Math.sin(elapsed * 1.1 + (item.userData.phase ?? 0)) * 0.07
        })

        butterflies.forEach(({ butterfly, phase, base }) => {
          const angle = elapsed * 0.5 + phase
          butterfly.position.x = base.x + Math.cos(angle) * 0.9
          butterfly.position.z = base.z + Math.sin(angle) * 0.5
          butterfly.position.y = base.y + Math.sin(elapsed * 1.7 + phase) * 0.25
          butterfly.rotation.y = Math.atan2(-Math.sin(angle), -Math.cos(angle)) + Math.PI / 2
          butterfly.userData.wings?.forEach((wing, index) => {
            wing.rotation.y = (index % 2 === 0 ? 1 : -1) * (0.35 + Math.abs(Math.sin(elapsed * 9 + phase)) * 0.9)
          })
        })

        birds.forEach(({ bird, phase, radius, height, speed }) => {
          const angle = elapsed * speed + phase
          bird.position.set(Math.cos(angle) * radius, height + Math.sin(angle * 1.3) * 1.2, -12 + Math.sin(angle) * 4)
          bird.rotation.y = -angle + Math.PI / 2
          bird.userData.wings?.forEach((wing, index) => {
            wing.rotation.z = (index === 0 ? -1 : 1) * Math.sin(elapsed * 10 + phase) * 0.45
          })
        })

        rabbit.position.y = Math.sin(elapsed * 1.6) * 0.05
        rabbit.rotation.z = Math.sin(elapsed * 1.2) * 0.03
        rabbit.userData.ears?.forEach((ear, index) => {
          ear.rotation.z = (index % 2 === 0 ? 0.13 : -0.13) + Math.sin(elapsed * 2.4 + index) * 0.08
        })

        duck.position.y = 0.05 + Math.sin(elapsed * 1.4) * 0.06
        duck.rotation.y = -0.7 + Math.sin(elapsed * 0.5) * 0.3

        personA.position.y = Math.sin(elapsed * 1.3) * 0.04
        personB.position.y = Math.sin(elapsed * 1.1 + 1) * 0.04
        personA.userData.arms?.forEach((arm, index) => {
          if (arm.rotation) arm.rotation.z = (index % 2 === 0 ? 0.26 : -0.26) + Math.sin(elapsed * 2 + index) * 0.07
        })

        campfire.userData.flames?.forEach((flame, index) => {
          flame.scale.set(1 + Math.sin(elapsed * 9 + index * 2) * 0.18, 1 + Math.sin(elapsed * 7 + index) * 0.25, 1)
          flame.position.y = 0.28 + index * 0.07 + Math.sin(elapsed * 8 + index) * 0.02
        })

        sparkles.forEach(({ sparkle, phase, base }) => {
          sparkle.position.y = base.y + Math.sin(elapsed * 1.8 + phase) * 0.3
          sparkle.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 3.2 + phase) * 0.4
        })

        const shift = Math.min(1.6, scroll.current * 0.0007)
        const targetX = pointer.current.x * 1.3
        const targetY = cam.y + shift - pointer.current.y * 0.35
        stage.camera.position.x += (targetX - stage.camera.position.x) * Math.min(1, dt * 2)
        stage.camera.position.y += (targetY - stage.camera.position.y) * Math.min(1, dt * 2)
        stage.camera.position.z = cam.z
        stage.camera.lookAt(0, cam.lookY + shift * 0.6, cam.lookZ)
      })

      stage.onResize(({ aspect }) => {
        if (aspect < 0.85) {
          cam.x = 0
          cam.y = 7.2
          cam.z = 27
          cam.lookY = 6.2
          cam.lookZ = -8
        } else if (aspect < 1.3) {
          cam.x = 0
          cam.y = 6.2
          cam.z = 22
          cam.lookY = 5.2
          cam.lookZ = -7
        } else {
          cam.x = 0
          cam.y = 5.4
          cam.z = 19
          cam.lookY = 4.8
          cam.lookZ = -6
        }
        stage.camera.position.set(cam.x, cam.y, cam.z)
        stage.camera.lookAt(0, cam.lookY, cam.lookZ)
      })

      return {}
    },
  })

  return <div className="ambient-scene" ref={hostRef} aria-hidden="true" />
}
