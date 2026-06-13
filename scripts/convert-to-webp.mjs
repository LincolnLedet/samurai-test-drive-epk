// One-off image converter: JPG/PNG → WebP, resize to a sensible max width,
// then delete the originals. Run with: node scripts/convert-to-webp.mjs
import sharp from 'sharp'
import { readdir, unlink } from 'node:fs/promises'
import { join, extname, basename } from 'node:path'

const DIRS = ['public/photos', 'public/posters']
const MAX_WIDTH = 1600
const QUALITY = 80

for (const dir of DIRS) {
  let files
  try {
    files = await readdir(dir)
  } catch {
    console.log(`(skip) ${dir} not found`)
    continue
  }
  for (const file of files) {
    const ext = extname(file).toLowerCase()
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue
    const input = join(dir, file)
    const output = join(dir, basename(file, ext) + '.webp')
    const before = (await sharp(input).metadata()).size ?? 0
    await sharp(input)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(output)
    await unlink(input)
    const after = (await sharp(output).metadata()).size ?? 0
    console.log(
      `✓ ${file} → ${basename(output)} (${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB)`,
    )
  }
}
