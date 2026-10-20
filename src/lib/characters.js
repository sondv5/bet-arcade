import * as THREE from 'three'
import { makeTextSprite } from './threeKit'

const SKINS = ['#ffd9b8', '#f7c29a', '#e0a473', '#bd7d52', '#93613f', '#6e462f']
const HAIRS = ['#2b211d', '#53382a', '#8a5a34', '#d6a04a', '#3a3550', '#b14b5e']
const HATS = ['#ff4d6d', '#4d9bff', '#ffd23f', '#2ee6a6', '#9b7bff']
const SHIRTS = ['#ff6fb5', '#4d9bff', '#ffd23f', '#2ee6a6', '#9b7bff', '#ff9f43']

const standard = (color, roughness = 0.62) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.01 })

const capsule = (radius, length, material) => {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 4, 10), material)
  mesh.castShadow = true
  return mesh
}

const sphere = (radius, material, segments = 16) => {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, Math.max(8, segments - 4)), material)
  mesh.castShadow = true
  return mesh
}

/**
 * Cute, low-poly-ish person. Feet sit at y = 0.
 */
export function makePerson({
  shirt = '#ff6fb5',
  pants = '#31314a',
  skin = SKINS[0],
  hair = HAIRS[0],
  accent = '#fffaf1',
  hat = null,
  backpack = false,
  glasses = false,
  scale = 1,
} = {}) {
  const group = new THREE.Group()
  const skinMat = standard(skin, 0.7)
  const hairMat = standard(hair, 0.7)
  const shirtMat = standard(shirt, 0.6)
  const pantsMat = standard(pants, 0.7)
  const shoeMat = standard('#282631', 0.6)
  const accentMat = standard(accent, 0.55)
  const arms = []

  for (const side of [-1, 1]) {
    const leg = capsule(0.055, 0.2, pantsMat)
    leg.position.set(side * 0.095, 0.24, 0)
    group.add(leg)
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), shoeMat)
    shoe.scale.set(1.25, 0.62, 1.5)
    shoe.position.set(side * 0.095, 0.05, 0.035)
    shoe.castShadow = true
    group.add(shoe)
  }

  const body = capsule(0.19, 0.24, shirtMat)
  body.scale.z = 0.86
  body.position.y = 0.57
  group.add(body)

  for (const side of [-1, 1]) {
    const arm = capsule(0.048, 0.22, shirtMat)
    arm.position.set(side * 0.235, 0.62, 0)
    arm.rotation.z = side * 0.26
    group.add(arm)
    arms.push(arm)
    const hand = sphere(0.055, skinMat, 10)
    hand.position.set(side * 0.29, 0.44, 0.01)
    group.add(hand)
  }

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.08, 10), skinMat)
  neck.position.y = 0.79
  group.add(neck)

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 6, 16), accentMat)
  collar.rotation.x = Math.PI / 2
  collar.position.y = 0.81
  group.add(collar)

  const head = sphere(0.2, skinMat, 20)
  head.scale.set(1, 0.98, 0.96)
  head.position.y = 0.98
  group.add(head)

  const hairMesh = sphere(0.205, hairMat, 16)
  hairMesh.scale.set(1.01, 0.72, 1)
  hairMesh.position.set(0, 1.06, -0.03)
  group.add(hairMesh)

  if (hat) {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.035, 16), standard(hat, 0.55))
    brim.position.y = 1.1
    group.add(brim)
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.16, 14), standard(hat, 0.55))
    crown.position.y = 1.17
    crown.castShadow = true
    group.add(crown)
  }

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), standard('#17161a', 0.35))
    eye.position.set(side * 0.072, 0.995, 0.185)
    group.add(eye)
    if (glasses) {
      const lens = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 6, 14), standard('#17161a', 0.4))
      lens.position.set(side * 0.072, 0.995, 0.19)
      group.add(lens)
    }
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 5), standard('#ff9a9a', 0.7))
    cheek.scale.z = 0.35
    cheek.position.set(side * 0.12, 0.925, 0.168)
    group.add(cheek)
  }

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.008, 5, 10, Math.PI), standard('#7b3c3c', 0.6))
  smile.rotation.z = Math.PI
  smile.position.set(0, 0.925, 0.184)
  group.add(smile)

  const nose = sphere(0.022, skinMat, 8)
  nose.scale.z = 0.7
  nose.position.set(0, 0.965, 0.201)
  group.add(nose)

  if (backpack) {
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.14), standard(hair === HAIRS[5] ? '#ff9f43' : '#ffd23f', 0.65))
    bag.position.set(0, 0.62, -0.18)
    bag.castShadow = true
    group.add(bag)
  }

  group.scale.setScalar(scale)
  group.userData.head = head
  group.userData.arms = arms
  return group
}

export function makePlayerAvatar(player, index, { height = 1.28, labelHeight = 0.3, labelBackground = '#fffaf1' } = {}) {
  const group = new THREE.Group()
  const hat = index % 3 === 0 ? HATS[index % HATS.length] : null
  const person = makePerson({
    shirt: player.color,
    pants: ['#31314a', '#5a432f', '#2d3f57', '#493854'][index % 4],
    skin: SKINS[index % SKINS.length],
    hair: HAIRS[(index + 2) % HAIRS.length],
    accent: SHIRTS[(index + 3) % SHIRTS.length],
    hat,
    backpack: index % 5 === 0,
    glasses: index % 4 === 0,
    scale: 1,
  })
  const naturalHeight = 1.2
  const factor = height / naturalHeight
  person.scale.multiplyScalar(factor)
  group.add(person)

  const label = makeTextSprite(player.name, {
    height: labelHeight,
    color: '#17161a',
    background: labelBackground,
    border: '#17161a',
    borderWidth: 3,
    paddingX: 12,
    paddingY: 6,
    radius: 12,
    fontSize: 50,
    maxWidth: 260,
  })
  label.position.set(0, height + labelHeight * 0.75, 0)
  group.add(label)

  group.userData.body = person
  group.userData.label = label
  group.userData.player = player
  return group
}

export function makeRabbit({ scale = 1, color = '#fff4e3', accent = '#ffb3c7' } = {}) {
  const group = new THREE.Group()
  const fur = standard(color, 0.72)
  const pink = standard(accent, 0.6)
  const ink = standard('#17161a', 0.35)

  const body = sphere(0.3, fur, 18)
  body.scale.set(1, 1.12, 1.18)
  body.position.y = 0.34
  group.add(body)

  const head = sphere(0.23, fur, 18)
  head.position.set(0, 0.72, 0.09)
  group.add(head)

  for (const side of [-1, 1]) {
    const ear = capsule(0.06, 0.3, fur)
    ear.position.set(side * 0.1, 1.05, 0.08)
    ear.rotation.z = side * 0.13
    group.add(ear)
    const inner = capsule(0.031, 0.22, pink)
    inner.position.set(side * 0.1, 1.05, 0.125)
    inner.rotation.z = side * 0.13
    group.add(inner)
    const eye = sphere(0.028, ink, 8)
    eye.position.set(side * 0.082, 0.76, 0.27)
    group.add(eye)
    const foot = sphere(0.09, fur, 10)
    foot.scale.set(1.25, 0.6, 1.6)
    foot.position.set(side * 0.12, 0.08, 0.16)
    group.add(foot)
  }

  const nose = sphere(0.035, pink, 8)
  nose.scale.z = 0.7
  nose.position.set(0, 0.7, 0.3)
  group.add(nose)

  const tail = sphere(0.1, fur, 10)
  tail.position.set(0, 0.32, -0.33)
  group.add(tail)

  group.scale.setScalar(scale)
  group.userData.ears = group.children.filter((child) => child.geometry?.type === 'CapsuleGeometry')
  return group
}

export function makeBird({ scale = 1, color = '#ffd23f', accent = '#ff9f43' } = {}) {
  const group = new THREE.Group()
  const bodyMat = standard(color, 0.62)
  const accentMat = standard(accent, 0.55)
  const ink = standard('#17161a', 0.35)

  const body = sphere(0.17, bodyMat, 14)
  body.scale.set(1, 1.05, 1.25)
  body.position.y = 0.26
  group.add(body)

  const head = sphere(0.13, bodyMat, 14)
  head.position.set(0, 0.44, 0.12)
  group.add(head)

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 6), accentMat)
  beak.rotation.x = Math.PI / 2
  beak.position.set(0, 0.43, 0.27)
  beak.castShadow = true
  group.add(beak)

  const wings = []
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), bodyMat)
    wing.scale.set(0.3, 0.5, 1)
    wing.position.set(side * 0.15, 0.28, 0)
    wing.rotation.z = side * 0.35
    wing.castShadow = true
    group.add(wing)
    wings.push(wing)
    const eye = sphere(0.02, ink, 6)
    eye.position.set(side * 0.07, 0.47, 0.23)
    group.add(eye)
  }

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 5), bodyMat)
  tail.rotation.x = -Math.PI / 2.8
  tail.position.set(0, 0.28, -0.19)
  group.add(tail)

  group.scale.setScalar(scale)
  group.userData.wings = wings
  return group
}

export function makeDuck({ scale = 1 } = {}) {
  const group = new THREE.Group()
  const yellow = standard('#ffd23f', 0.65)
  const orange = standard('#ff9f43', 0.55)
  const ink = standard('#17161a', 0.35)

  const body = sphere(0.3, yellow, 16)
  body.scale.set(1, 0.8, 1.3)
  body.position.y = 0.24
  group.add(body)
  const head = sphere(0.18, yellow, 16)
  head.position.set(0, 0.52, 0.23)
  group.add(head)
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 6), orange)
  beak.rotation.x = Math.PI / 2
  beak.position.set(0, 0.5, 0.42)
  group.add(beak)
  for (const side of [-1, 1]) {
    const eye = sphere(0.02, ink, 6)
    eye.position.set(side * 0.075, 0.56, 0.37)
    group.add(eye)
    const wing = sphere(0.14, yellow, 10)
    wing.scale.set(0.35, 0.6, 1.1)
    wing.position.set(side * 0.26, 0.26, 0)
    group.add(wing)
  }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 5), yellow)
  tail.rotation.x = -Math.PI / 2.5
  tail.position.set(0, 0.34, -0.34)
  group.add(tail)
  group.scale.setScalar(scale)
  return group
}

export function makeCat({ scale = 1, color = '#fff2dd', accent = '#ff6fb5' } = {}) {
  const group = new THREE.Group()
  const fur = standard(color, 0.72)
  const pink = standard(accent, 0.55)
  const ink = standard('#17161a', 0.35)

  const body = sphere(0.28, fur, 16)
  body.scale.set(1, 1.15, 0.95)
  body.position.y = 0.34
  group.add(body)
  const head = sphere(0.23, fur, 18)
  head.position.set(0, 0.73, 0.02)
  group.add(head)
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 4), fur)
    ear.position.set(side * 0.14, 0.95, 0.02)
    ear.rotation.z = side * -0.18
    group.add(ear)
    const eye = sphere(0.025, ink, 6)
    eye.position.set(side * 0.08, 0.77, 0.21)
    group.add(eye)
    const cheek = sphere(0.03, pink, 6)
    cheek.scale.z = 0.4
    cheek.position.set(side * 0.13, 0.68, 0.19)
    group.add(cheek)
  }
  const nose = sphere(0.035, pink, 8)
  nose.scale.z = 0.6
  nose.position.set(0, 0.71, 0.235)
  group.add(nose)
  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 8, 22, Math.PI * 1.4), fur)
  tail.position.set(0.28, 0.33, -0.16)
  tail.rotation.set(0.3, 0, -0.2)
  group.add(tail)
  const paw = capsule(0.07, 0.16, fur)
  paw.position.set(-0.28, 0.56, 0.13)
  paw.rotation.z = 0.7
  group.add(paw)
  group.scale.setScalar(scale)
  group.userData.paw = paw
  return group
}

export function makeButterfly({ scale = 1, colorA = '#ff6fb5', colorB = '#ffd23f' } = {}) {
  const group = new THREE.Group()
  const bodyMat = standard('#3c3048', 0.6)
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.13, 4, 8), bodyMat)
  body.rotation.x = Math.PI / 2
  group.add(body)

  const wingGeo = new THREE.CircleGeometry(0.12, 10)
  const wings = []
  for (const side of [-1, 1]) {
    for (const [dy, color, size] of [
      [0.045, colorA, 1],
      [-0.035, colorB, 0.8],
    ]) {
      const holder = new THREE.Group()
      const wing = new THREE.Mesh(
        wingGeo,
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }),
      )
      wing.scale.set(size, size * 0.7, 1)
      wing.position.set(side * 0.11, dy, 0)
      wing.rotation.y = side * 0.35
      holder.add(wing)
      group.add(holder)
      wings.push(holder)
    }
  }
  group.scale.setScalar(scale)
  group.userData.wings = wings
  return group
}
