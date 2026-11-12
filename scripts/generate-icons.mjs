import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(path.join(root, 'public', 'lamed-icon.svg'))
const outDir = path.join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

for (const size of [180, 192, 512]) {
  await sharp(source)
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`))
}

console.log('PNG icons generated in public/icons/')
