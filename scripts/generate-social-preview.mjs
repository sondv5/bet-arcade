import fs from 'node:fs'
import sharp from 'sharp'

const svg = fs.readFileSync(new URL('./social-preview.svg', import.meta.url))

await sharp(svg, { density: 144 }).resize(1280, 640).png().toFile('docs/images/social-preview.png')
await sharp(svg, { density: 144 }).resize(640, 320).png().toFile('public/icons/social-preview.png')

console.log('✓ social preview generated')
