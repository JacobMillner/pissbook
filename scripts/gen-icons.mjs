// scripts/gen-icons.mjs
// Requires: npm install --save-dev sharp
import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(__dirname, '../public')

// Create a simple blue square with white text as a placeholder icon
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" fill="#3b5998"/>
  <text x="50%" y="54%" font-family="Georgia,serif" font-size="180"
    fill="white" text-anchor="middle" dominant-baseline="middle">P</text>
</svg>`

const svgBuffer = Buffer.from(svgIcon)

for (const size of [192, 512]) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(resolve(PUBLIC, `pwa-${size}x${size}.png`))
  console.log(`Generated pwa-${size}x${size}.png`)
}

await sharp(svgBuffer).resize(180, 180).png().toFile(resolve(PUBLIC, 'apple-touch-icon.png'))
console.log('Generated apple-touch-icon.png')
