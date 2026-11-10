#!/usr/bin/env node
/**
 * Copies the Tesseract.js runtime pieces into `public/ocr` so the OCR engine is
 * fully self-hosted (same-origin worker, core and English model).
 *
 * The files are generated from node_modules at dev/build time and are ignored by
 * git — nothing binary is committed, and Vercel gets them during `npm run build`.
 */
import { copyFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const modules = path.join(root, 'node_modules')
const out = path.join(root, 'public', 'ocr')

const jobs = [
  ['tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['tesseract.js-core/tesseract-core-simd.wasm.js', 'tesseract-core-simd.wasm.js'],
  ['tesseract.js-core/tesseract-core.wasm.js', 'tesseract-core.wasm.js'],
  ['@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'lang/eng.traineddata.gz'],
]

async function sizeOf(file) {
  try {
    return (await stat(file)).size
  } catch {
    return -1
  }
}

let copied = 0
for (const [from, to] of jobs) {
  const src = path.join(modules, from)
  const dest = path.join(out, to)
  const [srcSize, destSize] = await Promise.all([sizeOf(src), sizeOf(dest)])
  if (srcSize < 0) {
    console.warn(`[ocr] missing ${from} — run npm install`)
    continue
  }
  if (srcSize === destSize) continue
  await mkdir(path.dirname(dest), { recursive: true })
  await copyFile(src, dest)
  copied += 1
}

if (copied) console.log(`[ocr] prepared ${copied} runtime asset${copied === 1 ? '' : 's'} in public/ocr`)
