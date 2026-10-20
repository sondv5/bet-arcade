import sharp from 'sharp'
import { readFile, copyFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const iconsDir = fileURLToPath(new URL('../public/icons/', import.meta.url))
const source = await readFile(fileURLToPath(new URL('../public/icons/icon.svg', import.meta.url)))
await mkdir(iconsDir, { recursive: true })

const outputs = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-maskable-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
]

for (const output of outputs) {
  await sharp(source, { density: 384 })
    .resize(output.size, output.size)
    .png({ compressionLevel: 9 })
    .toFile(`${iconsDir}${output.file}`)
  console.log(`icon written: ${output.file}`)
}

await copyFile(`${iconsDir}icon.svg`, `${iconsDir}favicon.svg`)
console.log('icon written: favicon.svg')
