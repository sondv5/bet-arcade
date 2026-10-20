import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export const PALETTE = [
  '#ff4d6d',
  '#ffd23f',
  '#2ee6a6',
  '#4d9bff',
  '#9b7bff',
  '#ff6fb5',
  '#ff9f43',
  '#22d3ee',
  '#b6f04a',
  '#f25ecb',
  '#2dd4bf',
  '#ffb27a',
]

export const INK = 0x17161a
export const CREAM = 0xf4efe6

export const isSmallViewport = () =>
  typeof window !== 'undefined' && (window.innerWidth < 760 || window.matchMedia?.('(pointer: coarse)').matches)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
export const lerp = (a, b, t) => a + (b - a) * t

export const easeOutCubic = (t) => 1 - (1 - t) ** 3
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
export const easeOutQuint = (t) => 1 - (1 - t) ** 5
export const easeOutBack = (t) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}
export const easeOutBounce = (t) => {
  const n1 = 7.5625
  const d1 = 2.75
  if (t < 1 / d1) return n1 * t * t
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
  return n1 * (t -= 2.625 / d1) * t + 0.984375
}

const disposeMaterial = (material) => {
  if (!material) return
  for (const value of Object.values(material)) {
    if (value && value.isTexture) value.dispose()
  }
  material.dispose()
}

export function disposeObject(root) {
  root?.traverse((object) => {
    if (object.geometry) object.geometry.dispose()
    if (Array.isArray(object.material)) object.material.forEach(disposeMaterial)
    else if (object.material) disposeMaterial(object.material)
  })
}

export function createStage(
  container,
  { fov = 38, position = [0, 7, 13], lookAt = [0, 1, 0], maxDpr, shadows = true } = {},
) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(0x000000, 0)
  const dprCap = maxDpr ?? (isSmallViewport() ? 1.75 : 2)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap))
  renderer.shadowMap.enabled = shadows
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  renderer.domElement.className = 'three-canvas'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200)
  camera.position.fromArray(position)
  const target = new THREE.Vector3().fromArray(lookAt)
  camera.lookAt(target)

  const frameFns = new Set()
  const resizeFns = new Set()
  let raf = 0
  let disposed = false
  let lastTime = performance.now()
  let elapsedTime = 0

  const resize = () => {
    const width = Math.max(1, container.clientWidth)
    const height = Math.max(1, container.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    resizeFns.forEach((fn) => fn({ width, height, aspect: width / height }))
  }

  const observer = new ResizeObserver(resize)
  observer.observe(container)
  resize()

  const tick = () => {
    if (disposed) return
    raf = requestAnimationFrame(tick)
    const now = performance.now()
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    if (document.hidden) return
    elapsedTime += dt
    frameFns.forEach((fn) => fn(dt, elapsedTime))
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(tick)

  // Keep background dev tabs alive for testing; production tabs stay cheap.
  const backgroundTimer = import.meta.env.DEV
    ? setInterval(() => {
        if (disposed || !document.hidden) return
        frameFns.forEach((fn) => fn(0.1, performance.now() / 1000))
        renderer.render(scene, camera)
      }, 100)
    : 0

  return {
    scene,
    camera,
    renderer,
    mobile: isSmallViewport(),
    onFrame(fn) {
      frameFns.add(fn)
      return () => frameFns.delete(fn)
    },
    onResize(fn) {
      resizeFns.add(fn)
      return () => resizeFns.delete(fn)
    },
    setCamera(nextPosition, nextLookAt) {
      camera.position.fromArray(nextPosition)
      if (nextLookAt) target.fromArray(nextLookAt)
      camera.lookAt(target)
    },
    resize() {
      resize()
    },
    render() {
      renderer.render(scene, camera)
    },
    refresh() {
      resize()
      renderer.render(scene, camera)
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      clearInterval(backgroundTimer)
      observer.disconnect()
      frameFns.clear()
      resizeFns.clear()
      disposeObject(scene)
      scene.clear()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement)
      renderer.forceContextLoss?.()
    },
  }
}

export function setupLights(scene, { shadowMapSize } = {}) {
  const hemi = new THREE.HemisphereLight(0xfff7e9, 0xd8c4ae, 1.25)
  scene.add(hemi)

  const key = new THREE.DirectionalLight(0xfffbf3, 2.35)
  key.position.set(7, 14, 9)
  key.castShadow = true
  const size = shadowMapSize ?? (isSmallViewport() ? 1024 : 2048)
  key.shadow.mapSize.set(size, size)
  key.shadow.camera.left = -14
  key.shadow.camera.right = 14
  key.shadow.camera.top = 14
  key.shadow.camera.bottom = -14
  key.shadow.camera.near = 1
  key.shadow.camera.far = 44
  key.shadow.bias = -0.0007
  key.shadow.normalBias = 0.02
  key.shadow.radius = 3
  scene.add(key)

  const fill = new THREE.DirectionalLight(0xffd9c2, 0.55)
  fill.position.set(-8, 6, -4)
  scene.add(fill)

  const rim = new THREE.DirectionalLight(0xd7e8ff, 0.4)
  rim.position.set(0, 5, -12)
  scene.add(rim)

  return { hemi, key, fill, rim }
}

export function addShadowCatcher(scene, { y = 0, size = 60, opacity = 0.16 } = {}) {
  const material = new THREE.ShadowMaterial({ color: 0x3a281c, opacity })
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = y
  ground.receiveShadow = true
  scene.add(ground)
  return ground
}

export function makeBlock({
  color = '#ff4d6d',
  width = 1,
  height = 1,
  depth = 1,
  radius = 0.14,
  roughness = 0.62,
  metalness = 0.02,
  segments = 3,
} = {}) {
  const safeRadius = Math.min(radius, Math.min(width, height, depth) / 2 - 0.001)
  const geometry = new RoundedBoxGeometry(width, height, depth, segments, Math.max(0.001, safeRadius))
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function roundRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

export function makeTextTexture(
  text,
  {
    color = '#17161a',
    background = null,
    border = null,
    borderWidth = 0,
    fontSize = 64,
    fontWeight = 700,
    fontFamily = '"Be Vietnam Pro", "Segoe UI", system-ui, sans-serif',
    paddingX = 22,
    paddingY = 12,
    radius = 20,
    maxWidth = 860,
  } = {},
) {
  const label = String(text ?? '')
  const measure = document.createElement('canvas').getContext('2d')
  const font = `${fontWeight} ${fontSize}px ${fontFamily}`
  measure.font = font
  let display = label
  let textWidth = measure.measureText(display).width
  if (textWidth > maxWidth) {
    while (display.length > 1 && textWidth > maxWidth) {
      display = `${display.slice(0, -2)}…`
      textWidth = measure.measureText(display).width
    }
  }

  const stroke = border ? borderWidth : 0
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(textWidth + paddingX * 2 + stroke * 2)
  canvas.height = Math.ceil(fontSize * 1.28 + paddingY * 2 + stroke * 2)
  const ctx = canvas.getContext('2d')
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (background || border) {
    roundRectPath(ctx, stroke / 2, stroke / 2, canvas.width - stroke, canvas.height - stroke, radius)
    if (background) {
      ctx.fillStyle = background
      ctx.fill()
    }
    if (border) {
      ctx.lineWidth = stroke
      ctx.strokeStyle = border
      ctx.stroke()
    }
  }

  ctx.fillStyle = color
  ctx.fillText(display, canvas.width / 2, canvas.height / 2 + fontSize * 0.03)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true

  return { texture, aspect: canvas.width / canvas.height, canvas }
}

export function makeTextSprite(text, { height = 0.6, depthTest = true, renderOrder = 8, ...options } = {}) {
  const { texture, aspect } = makeTextTexture(text, options)
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest,
    toneMapped: false,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(height * aspect, height, 1)
  sprite.renderOrder = renderOrder
  return sprite
}

export function makeTextPlane(text, { height = 0.6, renderOrder = 8, ...options } = {}) {
  const { texture, aspect } = makeTextTexture(text, options)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(height * aspect, height), material)
  mesh.renderOrder = renderOrder
  return mesh
}

export function makePlayerBlock(
  player,
  { size = 1.2, labelHeight = 0.46, labelBackground = '#fffaf1', labelColor = '#17161a' } = {},
) {
  const group = new THREE.Group()
  const body = makeBlock({
    width: size,
    height: size,
    depth: size,
    radius: size * 0.14,
    color: player.color,
  })
  body.position.y = size / 2
  group.add(body)

  const label = makeTextSprite(player.name, {
    height: labelHeight,
    color: labelColor,
    background: labelBackground,
    paddingX: 16,
    paddingY: 9,
    radius: 16,
    fontSize: 60,
  })
  label.position.set(0, size + labelHeight * 0.72, 0)
  group.add(label)

  group.userData.body = body
  group.userData.player = player
  return group
}

export function addContactRing(scene, { inner = 8, outer = 8.4, color = '#e2d5c3', y = -0.02, opacity = 0.55 } = {}) {
  const geometry = new THREE.RingGeometry(inner, outer, 96)
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const ring = new THREE.Mesh(geometry, material)
  ring.rotation.x = -Math.PI / 2
  ring.position.y = y
  scene.add(ring)
  return ring
}
