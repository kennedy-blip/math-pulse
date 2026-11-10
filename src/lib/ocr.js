/**
 * Image import helpers: cropping and on-device OCR.
 *
 * The Tesseract worker, WASM core and English model are self-hosted under
 * `/ocr` (copied from node_modules by scripts/copy-ocr-assets.mjs), so nothing
 * leaves the browser and no API key is required.
 */

export const OCR_ROOT = '/ocr'

let workerPromise = null
let progressListener = null

const STATUS_COPY = {
  'loading tesseract core': 'Loading OCR engine',
  'initializing tesseract': 'Starting OCR engine',
  'initializing api': 'Starting OCR engine',
  'loading language traineddata': 'Loading English model',
  'loaded language traineddata': 'English model ready',
  'recognizing text': 'Reading the question',
}

function describe(message) {
  if (!message) return { label: 'Preparing', value: 0 }
  const label = STATUS_COPY[message.status] || (message.status || 'Working').replace(/^\w/, (c) => c.toUpperCase())
  return { label, value: typeof message.progress === 'number' ? message.progress : 0 }
}

function emitProgress(message) {
  if (!progressListener) return
  try {
    progressListener(describe(message))
  } catch {
    /* a listener must never break recognition */
  }
}

export function setOcrProgressListener(fn) {
  progressListener = fn || null
}

async function ensureWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js')
      return createWorker('eng', 1, {
        workerPath: `${OCR_ROOT}/worker.min.js`,
        corePath: OCR_ROOT,
        langPath: `${OCR_ROOT}/lang`,
        logger: emitProgress,
      })
    })().catch((error) => {
      workerPromise = null
      throw error
    })
  }
  return workerPromise
}

export async function disposeOcrWorker() {
  const pending = workerPromise
  workerPromise = null
  if (!pending) return
  try {
    const worker = await pending
    await worker.terminate()
  } catch {
    /* already gone */
  }
}

/**
 * Warm the engine up while the user is still cropping (best effort).
 */
export function preloadOcr() {
  ensureWorker().catch(() => {})
}

/**
 * Recognise the text in a cropped data URL.
 * Resolves with { text, raw, confidence }.
 */
export async function recognizeQuestion(dataUrl, { onProgress } = {}) {
  setOcrProgressListener(onProgress)
  try {
    const worker = await ensureWorker()
    const { data } = await worker.recognize(dataUrl)
    const raw = (data?.text || '').trim()
    return {
      raw,
      text: cleanExtractedText(raw),
      confidence: Math.round(data?.confidence || 0),
      lines: (data?.lines || []).map((l) => l.text).filter(Boolean),
    }
  } catch (error) {
    const message = String(error?.message || error)
    if (/fetch|network|Failed to load|importScripts|404/i.test(message)) {
      throw new Error('The OCR engine could not be loaded. Check your connection, or type the question instead.')
    }
    throw new Error(`Reading the image failed (${message.slice(0, 90)}). You can type the question instead.`)
  } finally {
    setOcrProgressListener(null)
  }
}

/* ------------------------------------------------------------------ */
/* Text cleanup                                                        */
/* ------------------------------------------------------------------ */

const SUPERSCRIPTS = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }

/**
 * Turn messy OCR output into something the solver can parse.
 * Deliberately conservative: the user can always edit the result.
 */
export function cleanExtractedText(raw) {
  if (!raw) return ''
  let text = String(raw)
    .replace(/\r/g, '\n')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/[−–—]/g, '-')
    .replace(/[✕✖]/g, '×')
    .replace(/÷/g, '/')
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[|¦]/g, ' ')
    .replace(/[ \t]+/g, ' ')

  // Normalise line breaks early so label stripping sees the first line
  text = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')

  // Strip a leading question marker: "3.", "Q4)", "(b) Problem 2:"
  text = text
    .replace(/^(?:question|problem|q|ex(?:ercise)?)\s*\d+\s*[).:-]\s*/i, '')
    .replace(/^\d{1,2}\s*[).:-]\s+/, '')
    .replace(/^\(?[a-hA-H]\)\s+/, '')

  // x2 / x3 read by OCR from x², x³ (variables only, single digit, not part of a number)
  text = text.replace(/([xyznt])([2-9])(?![0-9])/g, (_, letter, digit) => `${letter}${SUPERSCRIPTS[digit]}`)

  // Common OCR look-alikes inside derivatives/integrals
  text = text
    .replace(/d\s*\/\s*d\s*([a-zA-Z])/g, 'd/d$1')
    .replace(/\bintegr(?:al|rate)\b/gi, 'integrate')
    .replace(/\bderiv(?:at)?ive\s+of\b/gi, 'derivative of')

  return text.replace(/\s+/g, ' ').trim()
}

/* ------------------------------------------------------------------ */
/* Image helpers                                                       */
/* ------------------------------------------------------------------ */

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type || '')) {
      reject(new Error('Please choose an image file (PNG, JPG, WebP or HEIC).'))
      return
    }
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () =>
      resolve({ url, width: image.naturalWidth, height: image.naturalHeight, name: file.name || 'photo' })
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file could not be read as an image.'))
    }
    image.src = url
  })
}

export function loadImageFromDataUrl(dataUrl, name = 'screenshot.png') {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ url: dataUrl, width: image.naturalWidth, height: image.naturalHeight, name })
    image.onerror = () => reject(new Error('The capture could not be read.'))
    image.src = dataUrl
  })
}

/** Grab one frame from a screen/window share as a PNG data URL. */
export async function captureScreenFrame() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Screen capture is not supported in this browser — paste a screenshot instead.')
  }
  let stream
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 1 }, audio: false })
  } catch (error) {
    if (/denied|NotAllowed|Permission/i.test(String(error?.name || error))) {
      throw new Error('Screen capture was blocked. Paste a screenshot with ⌘/Ctrl + V instead.')
    }
    throw new Error('Screen capture is unavailable here — paste or upload a screenshot instead.')
  }
  try {
    const video = document.createElement('video')
    video.srcObject = stream
    video.muted = true
    await video.play()
    await new Promise((resolve) => setTimeout(resolve, 350))
    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) throw new Error('The screen capture was empty.')
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(video, 0, 0, width, height)
    return canvas.toDataURL('image/png')
  } finally {
    stream.getTracks().forEach((track) => track.stop())
  }
}

/**
 * Crop an <img> element using fractional coordinates (0–1) and return
 * a high-resolution PNG for OCR plus a small thumbnail for the session card.
 */
export function cropImageElement(imgEl, crop, { maxSize = 1800, thumbSize = 420 } = {}) {
  const naturalW = imgEl.naturalWidth || imgEl.width
  const naturalH = imgEl.naturalHeight || imgEl.height
  const sx = Math.max(0, Math.round(crop.x * naturalW))
  const sy = Math.max(0, Math.round(crop.y * naturalH))
  const sw = Math.max(8, Math.round(crop.w * naturalW))
  const sh = Math.max(8, Math.round(crop.h * naturalH))

  // Upscale tiny crops (small screenshots) so the OCR model sees enough pixels.
  const scale = sw < 700 ? Math.min(2, 700 / sw) : Math.min(1, maxSize / Math.max(sw, sh))
  const width = Math.max(1, Math.round(sw * scale))
  const height = Math.max(1, Math.round(sh * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, width, height)

  const thumbScale = Math.min(1, thumbSize / Math.max(width, height))
  const thumb = document.createElement('canvas')
  thumb.width = Math.max(1, Math.round(width * thumbScale))
  thumb.height = Math.max(1, Math.round(height * thumbScale))
  const thumbCtx = thumb.getContext('2d')
  thumbCtx.imageSmoothingQuality = 'high'
  thumbCtx.drawImage(canvas, 0, 0, thumb.width, thumb.height)

  return {
    dataUrl: canvas.toDataURL('image/png'),
    thumb: thumb.toDataURL('image/jpeg', 0.82),
    width,
    height,
  }
}
