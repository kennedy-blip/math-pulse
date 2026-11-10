import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Crop,
  ImagePlus,
  Keyboard,
  Loader2,
  MonitorUp,
  RotateCcw,
  ScanText,
  Sparkles,
  X,
} from 'lucide-react'
import { classifyTopic } from '../lib/classify.js'
import {
  cropImageElement,
  loadImageFromFile,
  preloadOcr,
  recognizeQuestion,
} from '../lib/ocr.js'
import { Badge, Button } from './ui.jsx'

const DEFAULT_CROP = { x: 0.08, y: 0.08, w: 0.84, h: 0.84 }
const MIN_SIZE = 0.06

const STEPS = [
  { id: 'source', label: 'Source' },
  { id: 'crop', label: 'Crop' },
  { id: 'review', label: 'Check' },
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function nextCrop(drag, dx, dy) {
  const s = drag.start
  if (drag.mode === 'move') {
    return {
      ...s,
      x: clamp(s.x + dx, 0, 1 - s.w),
      y: clamp(s.y + dy, 0, 1 - s.h),
    }
  }
  let { x, y, w, h } = s
  const right = s.x + s.w
  const bottom = s.y + s.h
  if (drag.handle.includes('w')) {
    x = clamp(s.x + dx, 0, right - MIN_SIZE)
    w = right - x
  }
  if (drag.handle.includes('e')) {
    w = clamp(s.w + dx, MIN_SIZE, 1 - s.x)
  }
  if (drag.handle.includes('n')) {
    y = clamp(s.y + dy, 0, bottom - MIN_SIZE)
    h = bottom - y
  }
  if (drag.handle.includes('s')) {
    h = clamp(s.h + dy, MIN_SIZE, 1 - s.y)
  }
  return { x, y, w, h }
}

function StepDots({ step }) {
  const current = STEPS.findIndex((s) => s.id === step)
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => (
        <span
          key={s.id}
          className={`flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] ${
            i === current ? 'text-violet-soft' : i < current ? 'text-emerald' : 'text-slate-600'
          }`}
        >
          <span
            className={`grid h-4 w-4 place-items-center rounded-full border text-[8.5px] ${
              i === current
                ? 'border-violet/50 bg-violet/15'
                : i < current
                  ? 'border-emerald/40 bg-emerald/10'
                  : 'border-white/10'
            }`}
          >
            {i < current ? <Check size={9} strokeWidth={3} /> : i + 1}
          </span>
          <span className="hidden sm:inline">{s.label}</span>
          {i < STEPS.length - 1 && <span className="mx-0.5 h-px w-3 bg-white/10" />}
        </span>
      ))}
    </div>
  )
}

export default function ImageImportDialog({ open, initialImage, initialError = '', onClose, onSolve }) {
  const [step, setStep] = useState('source')
  const [image, setImage] = useState(null)
  const [crop, setCrop] = useState(DEFAULT_CROP)
  const [drag, setDrag] = useState(null)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [fileError, setFileError] = useState('')
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [ocrConfidence, setOcrConfidence] = useState(null)

  const boxRef = useRef(null)
  const imgRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const overlayRef = useRef(null)

  const reset = useCallback(() => {
    setStep('source')
    setImage(null)
    setCrop(DEFAULT_CROP)
    setBusy(null)
    setError('')
    setFileError('')
    setText('')
    setResult(null)
    setOcrConfidence(null)
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    setError(initialError || '')
    setFileError('')
    if (initialImage) {
      setImage(initialImage)
      setCrop(DEFAULT_CROP)
      setStep('crop')
      setText('')
      setResult(null)
      setOcrConfidence(null)
      preloadOcr()
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialImage, initialError])

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => overlayRef.current?.focus(), 60)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, onClose])

  const ingestFile = useCallback(async (file) => {
    if (!file) return
    setFileError('')
    setError('')
    try {
      const meta = await loadImageFromFile(file)
      setImage(meta)
      setCrop(DEFAULT_CROP)
      setText('')
      setResult(null)
      setOcrConfidence(null)
      setStep('crop')
      preloadOcr()
    } catch (err) {
      setFileError(err.message || 'That image could not be opened.')
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onPaste = (event) => {
      const file = [...(event.clipboardData?.files || [])].find((f) => /^image\//.test(f.type))
      if (file) {
        event.preventDefault()
        ingestFile(file)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [open, ingestFile])

  useEffect(() => {
    if (!drag) return undefined
    const onMove = (event) => {
      const dx = (event.clientX - drag.startX) / Math.max(1, drag.rect.width)
      const dy = (event.clientY - drag.startY) / Math.max(1, drag.rect.height)
      setCrop(nextCrop(drag, dx, dy))
    }
    const stop = () => setDrag(null)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [drag])

  const startDrag = (mode, handle = '') => (event) => {
    if (event.button !== undefined && event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    const rect = boxRef.current?.getBoundingClientRect()
    if (!rect) return
    setDrag({ mode, handle, startX: event.clientX, startY: event.clientY, rect, start: crop })
  }

  const readQuestion = async () => {
    if (!imgRef.current) return
    setError('')
    setBusy({ label: 'Preparing image', value: 0.02 })
    let cropped = null
    try {
      cropped = cropImageElement(imgRef.current, crop)
      const res = await recognizeQuestion(cropped.dataUrl, {
        onProgress: (p) => setBusy({ label: p.label, value: p.value }),
      })
      setResult({ ...cropped, confidence: res.confidence })
      setOcrConfidence(res.confidence)
      setText(res.text || '')
      setStep('review')
      if (!res.text) {
        setError('No readable text was found in that crop. Try a tighter crop on the question, or type it below.')
      }
    } catch (err) {
      if (cropped) setResult({ ...cropped, confidence: null })
      setOcrConfidence(null)
      setText('')
      setStep('review')
      setError(err.message || 'Reading the image failed. Type the question below instead.')
    } finally {
      setBusy(null)
    }
  }

  if (!open) return null

  const detected = text.trim().length > 2 ? classifyTopic(text) : null
  const canSolve = text.trim().length > 1
  const chosen = image ? (crop.w * (imgRef.current?.naturalWidth || image.width) || 0) : 0

  return (
    <div
      ref={overlayRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-import-title"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#03060d]/80 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/[0.09] bg-[#0a101d] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] sm:max-h-[90vh] sm:rounded-2xl">
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] bg-gradient-to-r from-cyan/[0.08] via-transparent to-violet/[0.07] px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan/30 bg-cyan/[0.12] text-cyan">
              <ScanText size={17} />
            </span>
            <div className="min-w-0">
              <h2 id="image-import-title" className="text-[15px] font-semibold tracking-tight text-white">
                Import a question from an image
              </h2>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-400">
                Upload, paste or screenshot — crop to the question and MathPulse reads it on-device.
              </p>
              <div className="mt-2">
                <StepDots step={step} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image import"
            className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-white/25 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {step === 'source' && (
            <div className="space-y-3">
              <div
                className="group flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-8 text-center transition hover:border-violet/40 hover:bg-violet/[0.04]"
                onDragOver={(event) => {
                  event.preventDefault()
                  event.currentTarget.classList.add('border-violet/60', 'bg-violet/[0.07]')
                }}
                onDragLeave={(event) => {
                  event.currentTarget.classList.remove('border-violet/60', 'bg-violet/[0.07]')
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  event.currentTarget.classList.remove('border-violet/60', 'bg-violet/[0.07]')
                  const file = [...(event.dataTransfer?.files || [])].find((f) => /^image\//.test(f.type))
                  if (file) ingestFile(file)
                  else setFileError('Drop an image file — PNG, JPG or WebP.')
                }}
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-violet/25 bg-violet/[0.12] text-violet-soft">
                  <ImagePlus size={22} />
                </span>
                <p className="mt-3 text-[13.5px] font-semibold text-white">Drop a photo or screenshot here</p>
                <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-slate-400">
                  Or paste from your clipboard with <span className="font-mono text-slate-300">⌘/Ctrl + V</span>. The
                  image never leaves your browser.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <Button size="sm" variant="primary" icon={ImagePlus} onClick={() => fileInputRef.current?.click()}>
                    Choose image
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Camera}
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    Take photo
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-cyan/20 bg-cyan/[0.05] p-3">
                <MonitorUp size={14} className="mt-0.5 shrink-0 text-cyan" />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-white">Screenshot a quiz or worksheet</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                    Use the <span className="text-slate-200">Screenshot</span> button in the composer to capture your
                    screen, or paste a snip. Works with any exercise, PDF or online test you can see.
                  </p>
                </div>
              </div>

              {(fileError || error) && (
                <p className="flex items-start gap-2 rounded-xl border border-rose/30 bg-rose/[0.08] p-2.5 text-[11.5px] leading-relaxed text-rose">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  {fileError || error}
                </p>
              )}
            </div>
          )}

          {step === 'crop' && image && (
            <div className="space-y-3">
              <div
                ref={boxRef}
                className="relative mx-auto w-fit max-w-full touch-none select-none overflow-hidden rounded-xl border border-white/[0.08] bg-[#060b14]"
              >
                <img
                  ref={imgRef}
                  src={image.url}
                  alt="Image selected for question import"
                  draggable={false}
                  className="block max-h-[46vh] w-auto max-w-full"
                />
                <div
                  className="absolute border-2 border-violet shadow-[0_0_0_9999px_rgba(2,6,23,0.66)]"
                  style={{
                    left: `${crop.x * 100}%`,
                    top: `${crop.y * 100}%`,
                    width: `${crop.w * 100}%`,
                    height: `${crop.h * 100}%`,
                    cursor: 'move',
                  }}
                  onPointerDown={startDrag('move')}
                >
                  {/* rule-of-thirds guides */}
                  <span className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-white/15" />
                  <span className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-white/15" />
                  <span className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-white/15" />
                  <span className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-white/15" />
                  {['nw', 'ne', 'sw', 'se'].map((handle) => (
                    <span
                      key={handle}
                      onPointerDown={startDrag('resize', handle)}
                      className={`absolute h-3.5 w-3.5 rounded-[3px] border border-obsidian bg-violet shadow ${
                        handle === 'nw'
                          ? '-left-2 -top-2 cursor-nwse-resize'
                          : handle === 'ne'
                            ? '-right-2 -top-2 cursor-nesw-resize'
                            : handle === 'sw'
                              ? '-bottom-2 -left-2 cursor-nesw-resize'
                              : '-bottom-2 -right-2 cursor-nwse-resize'
                      }`}
                    />
                  ))}
                </div>

                {busy && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-obsidian/80 px-6 text-center">
                    <Loader2 size={20} className="animate-spin text-violet-soft" />
                    <p className="text-[12.5px] font-semibold text-white">{busy.label}…</p>
                    <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet to-cyan transition-all duration-300"
                        style={{ width: `${Math.max(4, Math.round((busy.value || 0) * 100))}%` }}
                      />
                    </div>
                    <p className="font-mono text-[10px] text-slate-500">first read loads the bundled 3 MB model</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Crop size={12} className="text-violet-soft" /> Drag the box or its corners
                </span>
                <span className="hidden sm:inline">·</span>
                <span>
                  {image.width} × {image.height}px source
                  {chosen ? ` · crop ≈ ${Math.round(chosen)}px wide` : ''}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="ghost" icon={ArrowLeft} onClick={() => setStep('source')}>
                  Back
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={RotateCcw}
                  onClick={() => setCrop(DEFAULT_CROP)}
                >
                  Reset
                </Button>
                <span className="ml-auto flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Crop}
                    onClick={() => setCrop({ x: 0, y: 0, w: 1, h: 1 })}
                  >
                    Whole image
                  </Button>
                  <Button size="sm" variant="primary" icon={ScanText} onClick={readQuestion} disabled={!!busy}>
                    Read question
                  </Button>
                </span>
              </div>

              {(fileError || error) && (
                <p className="flex items-start gap-2 rounded-xl border border-rose/30 bg-rose/[0.08] p-2.5 text-[11.5px] leading-relaxed text-rose">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  {fileError || error}
                </p>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-3">
              {error && (
                <p className="flex items-start gap-2 rounded-xl border border-amber/30 bg-amber/[0.08] p-2.5 text-[11.5px] leading-relaxed text-amber">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                <div className="space-y-1.5">
                  <p className="label text-cyan">Cropped question</p>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#060b14]">
                    {result?.thumb ? (
                      <img src={result.thumb} alt="Cropped question" className="block max-h-40 w-full object-contain" />
                    ) : (
                      <div className="grid h-28 place-items-center text-[11px] text-slate-500">No crop</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('crop')}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-1 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-500 transition hover:text-violet-soft"
                  >
                    <Crop size={11} /> adjust crop
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="ocr-question" className="label text-violet">
                      Recognised question
                    </label>
                    {ocrConfidence !== null && (
                      <span
                        className={`font-mono text-[9.5px] uppercase tracking-wider ${
                          ocrConfidence >= 70 ? 'text-emerald' : ocrConfidence >= 45 ? 'text-amber' : 'text-rose'
                        }`}
                      >
                        OCR {ocrConfidence}%
                      </span>
                    )}
                  </div>
                  <textarea
                    id="ocr-question"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    rows={4}
                    autoFocus
                    placeholder="e.g. Find the derivative of f(x) = 3x² + 2x at x = 1"
                    className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-obsidian/70 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-slate-100 placeholder:font-sans placeholder:text-slate-600 focus:border-violet/40 focus:outline-none focus:ring-2 focus:ring-violet/20"
                  />
                  <p className="mt-1 flex items-center gap-1.5 text-[10.5px] text-slate-500">
                    <Keyboard size={11} /> Fix any symbol OCR misread before solving.
                  </p>
                </div>
              </div>

              {detected && (
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={12} className="text-violet-soft" />
                      <span className="label">Topic auto-detector</span>
                      <Badge tone={detected.disciplineMeta?.accent || 'violet'}>{detected.disciplineMeta?.name}</Badge>
                    </div>
                    <span className="font-mono text-[10.5px] font-semibold text-violet-soft">
                      {detected.confidence}% confidence
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet to-cyan transition-all duration-500"
                      style={{ width: `${detected.confidence}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] bg-white/[0.02] px-4 py-3 sm:px-5">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-600">
            on-device OCR · nothing uploaded
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {step === 'review' && (
              <Button
                size="sm"
                variant="primary"
                icon={Sparkles}
                iconRight={ArrowRight}
                onClick={() => canSolve && onSolve?.(text.trim(), result?.thumb || null)}
                disabled={!canSolve}
              >
                Solve &amp; narrate
              </Button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          ingestFile(file)
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          ingestFile(file)
        }}
      />
    </div>
  )
}
