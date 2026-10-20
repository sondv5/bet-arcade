import * as THREE from 'three'
import { makeBlock, makeTextPlane } from './threeKit'

const mat = (color, { roughness = 0.75, flat = false, emissive = null, emissiveIntensity = 0 } = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness,
    flatShading: flat,
    emissive: emissive ?? 0x000000,
    emissiveIntensity,
  })

const mesh = (geometry, material, castShadow = true) => {
  const item = new THREE.Mesh(geometry, material)
  item.castShadow = castShadow
  item.receiveShadow = false
  return item
}

export function makeCloud({ scale = 1, color = '#fffaf1' } = {}) {
  const group = new THREE.Group()
  const material = mat(color, { roughness: 0.95, flat: false })
  const puffs = [
    [-0.9, 0.1, 0, 0.75],
    [-0.2, 0.35, 0.15, 1],
    [0.7, 0.15, 0.02, 0.8],
    [1.3, -0.05, -0.05, 0.55],
    [0.1, -0.12, 0.32, 0.65],
  ]
  for (const [x, y, z, s] of puffs) {
    const puff = mesh(new THREE.SphereGeometry(0.66 * s, 14, 10), material, false)
    puff.scale.set(1.35, 0.82, 1)
    puff.position.set(x, y, z)
    group.add(puff)
  }
  group.scale.setScalar(scale)
  return group
}

export function makePineTree({ scale = 1, hue = 0 } = {}) {
  const group = new THREE.Group()
  const trunk = mesh(new THREE.CylinderGeometry(0.13, 0.18, 1.1, 7), mat('#8a5a34'))
  trunk.position.y = 0.55
  group.add(trunk)
  const greens = ['#2fbf7a', '#23a86a', '#1b8d5a']
  const layers = [
    [0.95, 1.1, 0.85],
    [0.75, 1.2, 1.25],
    [0.52, 1.15, 1.65],
  ]
  layers.forEach(([radius, height, y], index) => {
    const cone = mesh(new THREE.ConeGeometry(radius, height, 7), mat(greens[(index + hue) % greens.length], { flat: true }))
    cone.position.y = y
    group.add(cone)
  })
  group.scale.setScalar(scale)
  return group
}

export function makeBlossomTree({ scale = 1, color = '#ffb3d2' } = {}) {
  const group = new THREE.Group()
  const trunk = mesh(new THREE.CylinderGeometry(0.13, 0.2, 1.4, 7), mat('#8a5a34'))
  trunk.position.y = 0.7
  group.add(trunk)
  const branchGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.8, 6)
  for (const side of [-1, 1]) {
    const branch = mesh(branchGeo, mat('#8a5a34'))
    branch.position.set(side * 0.28, 1.35, 0)
    branch.rotation.z = side * -0.65
    group.add(branch)
  }
  const blossomMat = mat(color, { roughness: 0.85 })
  const puffs = [
    [0, 1.75, 0, 0.85],
    [-0.6, 1.55, 0.08, 0.6],
    [0.65, 1.5, -0.05, 0.62],
    [0.2, 2.05, 0.1, 0.55],
    [-0.25, 1.95, -0.2, 0.45],
  ]
  for (const [x, y, z, s] of puffs) {
    const puff = mesh(new THREE.SphereGeometry(s, 12, 9), blossomMat)
    puff.position.set(x, y, z)
    group.add(puff)
  }
  group.scale.setScalar(scale)
  return group
}

export function makeRoundTree({ scale = 1, color = '#4fdd83' } = {}) {
  const group = new THREE.Group()
  const trunk = mesh(new THREE.CylinderGeometry(0.12, 0.17, 1.3, 7), mat('#8a5a34'))
  trunk.position.y = 0.65
  group.add(trunk)
  const leafMat = mat(color, { roughness: 0.8 })
  for (const [x, y, z, s] of [
    [0, 1.65, 0, 0.8],
    [-0.55, 1.45, 0.06, 0.55],
    [0.55, 1.5, 0.04, 0.58],
    [0.12, 1.9, -0.12, 0.45],
  ]) {
    const puff = mesh(new THREE.SphereGeometry(s, 12, 9), leafMat)
    puff.position.set(x, y, z)
    group.add(puff)
  }
  group.scale.setScalar(scale)
  return group
}

export function makeBush({ scale = 1, color = '#3bd879' } = {}) {
  const group = new THREE.Group()
  const material = mat(color, { roughness: 0.85, flat: true })
  for (const [x, y, z, s] of [
    [0, 0.22, 0, 0.35],
    [-0.32, 0.18, 0.04, 0.24],
    [0.3, 0.2, -0.04, 0.27],
  ]) {
    const puff = mesh(new THREE.SphereGeometry(s, 10, 8), material)
    puff.position.set(x, y, z)
    group.add(puff)
  }
  group.scale.setScalar(scale)
  return group
}

export function makeMountain({ radius = 6, height = 11, color = '#8d86ff', snow = true } = {}) {
  const group = new THREE.Group()
  const rock = mesh(new THREE.ConeGeometry(radius, height, 6), mat(color, { flat: true }))
  rock.position.y = height / 2
  group.add(rock)
  if (snow) {
    const cap = mesh(new THREE.ConeGeometry(radius * 0.34, height * 0.3, 6), mat('#fff7e7', { flat: true }))
    cap.position.y = height * 0.85
    group.add(cap)
  }
  return group
}

export function makeRock({ scale = 1, color = '#c9b9a7' } = {}) {
  const rock = mesh(new THREE.DodecahedronGeometry(0.5, 0), mat(color, { flat: true }))
  rock.scale.set(1.2, 0.75, 1)
  rock.position.y = 0.25
  rock.rotation.y = Math.random() * Math.PI
  const group = new THREE.Group()
  group.add(rock)
  group.scale.setScalar(scale)
  return group
}

export function makeGrassClump({ color = '#45d97c', scale = 1 } = {}) {
  const positions = []
  const bladeCount = 5
  for (let i = 0; i < bladeCount; i += 1) {
    const angle = (i / bladeCount) * Math.PI * 2
    const x = Math.cos(angle) * 0.12
    const z = Math.sin(angle) * 0.12
    const height = 0.32 + (i % 3) * 0.12
    positions.push(
      x, 0, z,
      x + 0.035, height, z,
      x - 0.025, 0.02, z,
    )
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  const material = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.9 })
  const blades = mesh(geometry, material)
  const group = new THREE.Group()
  group.add(blades)
  group.scale.setScalar(scale)
  return group
}

function flowerShape(radius) {
  const shape = new THREE.Shape()
  const points = 60
  for (let i = 0; i <= points; i += 1) {
    const angle = (i / points) * Math.PI * 2
    const wave = 0.74 + Math.cos(angle * 5) * 0.26
    const x = Math.cos(angle) * radius * wave
    const y = Math.sin(angle) * radius * wave
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  return shape
}

export function makeFlower({ color = '#ff6fb5', scale = 1, center = '#ffd23f' } = {}) {
  const group = new THREE.Group()
  const stem = mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.55, 5), mat('#2fbf7a'))
  stem.position.y = 0.275
  group.add(stem)

  const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.1, 5), mat('#2fbf7a', { roughness: 0.9 }))
  leaf.scale.set(0.5, 1.3, 1)
  leaf.rotation.set(-Math.PI / 2, 0.5, 0.4)
  leaf.position.set(0.07, 0.3, 0.01)
  group.add(leaf)

  const petal = new THREE.Mesh(new THREE.ExtrudeGeometry(flowerShape(0.18), { depth: 0.03, bevelEnabled: false }), mat(color, { roughness: 0.7 }))
  petal.rotation.x = -Math.PI / 2
  petal.position.y = 0.58
  petal.castShadow = true
  group.add(petal)

  const middle = mesh(new THREE.SphereGeometry(0.055, 10, 8), mat(center, { roughness: 0.6 }))
  middle.position.y = 0.61
  group.add(middle)
  group.scale.setScalar(scale)
  group.userData.flowerHead = petal
  return group
}

export function makeTent() {
  const group = new THREE.Group()
  const fabric = mat('#ff5f7a', { roughness: 0.88 })
  const stripe = mat('#fff0d8', { roughness: 0.85 })
  const left = makeBlock({ width: 1.25, height: 1.15, depth: 0.08, radius: 0.04, color: '#ff5f7a', roughness: 0.9 })
  left.position.set(-0.35, 0.58, 0)
  left.rotation.z = -0.5
  group.add(left)
  const right = makeBlock({ width: 1.25, height: 1.15, depth: 0.08, radius: 0.04, color: '#fff0d8', roughness: 0.9 })
  right.position.set(0.35, 0.58, 0)
  right.rotation.z = 0.5
  group.add(right)
  const door = new THREE.Mesh(new THREE.CircleGeometry(0.28, 3), mat('#38303d', { roughness: 0.9 }))
  door.rotation.z = Math.PI / 2
  door.position.set(0, 0.45, 0.06)
  group.add(door)
  const pole = mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.35, 5), mat('#5d4431'))
  pole.position.set(0, 0.67, -0.08)
  group.add(pole)
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.22), mat('#ffd23f', { roughness: 0.8 }))
  flag.position.set(0.22, 1.3, -0.08)
  group.add(flag)
  group.rotation.y = 0.12
  group.userData.fabric = [fabric, stripe]
  return group
}

export function makeCampfire({ scale = 1 } = {}) {
  const group = new THREE.Group()
  const logMat = mat('#7a4b2a', { roughness: 0.9 })
  for (let i = 0; i < 4; i += 1) {
    const log = mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.9, 6), logMat)
    log.rotation.z = Math.PI / 2
    log.rotation.y = (i / 4) * Math.PI
    log.position.y = 0.08
    group.add(log)
  }
  const flames = []
  const flameColors = ['#ff9f43', '#ffd23f', '#ff5f7a']
  for (let i = 0; i < 3; i += 1) {
    const flame = mesh(
      new THREE.ConeGeometry(0.16 - i * 0.03, 0.5 - i * 0.08, 5),
      mat(flameColors[i], { emissive: flameColors[i], emissiveIntensity: 0.55, roughness: 0.35 }),
      false,
    )
    flame.position.set((i - 1) * 0.06, 0.28 + i * 0.07, 0)
    group.add(flame)
    flames.push(flame)
  }
  const light = new THREE.PointLight('#ff9f43', 1.4, 6)
  light.position.y = 0.5
  group.add(light)
  group.scale.setScalar(scale)
  group.userData.flames = flames
  return group
}

export function makeSign(text = 'BÉT!') {
  const group = new THREE.Group()
  const post = mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.7, 7), mat('#8a5a34'))
  post.position.y = 0.85
  group.add(post)
  const board = makeBlock({ width: 1.35, height: 0.55, depth: 0.1, radius: 0.08, color: '#ffd23f', roughness: 0.7 })
  board.position.y = 1.55
  group.add(board)
  const face = makeTextPlane(text, {
    height: 0.34,
    color: '#17161a',
    background: '#ffd23f',
    border: '#17161a',
    borderWidth: 4,
    paddingX: 12,
    paddingY: 5,
    fontSize: 72,
    fontWeight: 800,
  })
  face.position.set(0, 1.55, 0.06)
  group.add(face)
  group.rotation.y = -0.18
  return group
}

export function makeLilyPad({ scale = 1 } = {}) {
  const group = new THREE.Group()
  const pad = new THREE.Mesh(new THREE.CircleGeometry(0.3, 10, 0.25, Math.PI * 2 - 0.5), mat('#2ee6a6', { roughness: 0.8 }))
  pad.rotation.x = -Math.PI / 2
  pad.position.y = 0.03
  group.add(pad)
  const flower = makeFlower({ color: '#fff3fa', scale: 0.45 })
  flower.position.y = 0
  group.add(flower)
  group.scale.setScalar(scale)
  return group
}

export function makeStonePath(count = 6) {
  const group = new THREE.Group()
  const stoneMat = mat('#e7dccb', { roughness: 0.95, flat: true })
  for (let i = 0; i < count; i += 1) {
    const stone = mesh(new THREE.CylinderGeometry(0.45 - i * 0.02, 0.5 - i * 0.02, 0.08, 7), stoneMat, false)
    stone.position.set(Math.sin(i * 0.9) * 0.9, 0.03, i * 1.2)
    stone.rotation.y = i * 0.7
    group.add(stone)
  }
  return group
}
