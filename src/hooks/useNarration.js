import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const WPS = 2.65 // words per second at rate 1.0 (≈159 wpm)

const HANDSOME_VOICES = [
  'Google UK English Female',
  'Samantha',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Google US English',
  'Karen',
  'Daniel',
]

export function splitWords(text) {
  return (text || '').split(/\s+/).filter(Boolean)
}

const estimate = (wordCount, rate) =>
  Math.max(2400, (wordCount / (WPS * Math.max(0.5, rate))) * 1000 + 450)

function pickVoice(voices) {
  if (!voices.length) return null
  const english = voices.filter((v) => (v.lang || '').toLowerCase().startsWith('en'))
  const pool = english.length ? english : voices
  for (const name of HANDSOME_VOICES) {
    const found = pool.find((v) => v.name === name)
    if (found) return found
  }
  const natural = pool.find((v) => /natural|neural|premium|enhanced/i.test(v.name))
  return natural || pool[0]
}

/* One-off utterance used outside the step player (Socratic feedback, toasts) */
export function speakOnce(text, { rate = 1, cancel = true } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  try {
    if (cancel) window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = rate
    u.pitch = 1.02
    u.volume = 1
    const v = pickVoice(window.speechSynthesis.getVoices())
    if (v) u.voice = v
    window.speechSynthesis.speak(u)
    return true
  } catch {
    return false
  }
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* noop */
    }
  }
}

/**
 * Drives a multi-step spoken lesson.
 * Karaoke highlighting is driven by a timer so it animates consistently even
 * when the browser blocks speech synthesis; boundary events refine the sync
 * whenever the engine reports them.
 */
export function useNarration({ steps, voiceOn = true, rate = 1, autoAdvance = true }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const [status, setStatus] = useState('idle') // idle | playing | paused
  const [activeIndex, setActiveIndex] = useState(-1)
  const [wordIndex, setWordIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [voices, setVoices] = useState([])
  const [voiceURI, setVoiceURI] = useState('')
  const [speechReady, setSpeechReady] = useState(false)
  const [voicesChecked, setVoicesChecked] = useState(false)

  const words = useMemo(
    () => (activeIndex >= 0 && steps[activeIndex] ? splitWords(steps[activeIndex].narration) : []),
    [activeIndex, steps],
  )

  const box = useRef({
    timer: null,
    tickStart: 0,
    elapsed: 0,
    duration: 1,
    startWord: 0,
    boundaryWord: -1,
    playId: 0,
    active: -1,
    status: 'idle',
    autoAdvance: true,
    rate: 1,
    voiceOn: true,
    suspended: false,
  })

  const cfg = useRef({ rate, autoAdvance, voiceOn, steps })
  cfg.current = { rate, autoAdvance, voiceOn, steps }

  /* ---------------- voices ---------------- */
  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    const load = () => {
      const list = synth.getVoices() || []
      setVoicesChecked(true)
      if (list.length) {
        setVoices(list)
        setSpeechReady(true)
        setVoiceURI((prev) => {
          if (prev && list.some((v) => v.voiceURI === prev)) return prev
          const v = pickVoice(list)
          return v ? v.voiceURI : ''
        })
      }
    }
    load()
    synth.addEventListener?.('voiceschanged', load)
    const t = setTimeout(load, 600)
    return () => {
      synth.removeEventListener?.('voiceschanged', load)
      clearTimeout(t)
    }
  }, [supported])

  const voiceOf = useCallback(
    (uri) => {
      if (!supported) return null
      const list = window.speechSynthesis.getVoices() || []
      return list.find((v) => v.voiceURI === uri) || pickVoice(list)
    },
    [supported],
  )

  const clearTimer = () => {
    if (box.current.timer) {
      clearInterval(box.current.timer)
      box.current.timer = null
    }
  }

  const cancelSpeech = useCallback(() => {
    if (!supported) return
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* noop */
    }
  }, [supported])

  /* ---------------- core loop ---------------- */
  const finish = useCallback(() => {
    const b = box.current
    if (b.status !== 'playing') return
    clearTimer()
    b.boundaryWord = -1
    if (b.autoAdvance && b.active >= 0 && b.active + 1 < (cfg.current.steps?.length || 0)) {
      const upcoming = b.active + 1
      b.status = 'paused'
      setStatus('paused')
      b.pendingNext = upcoming
      const id = b.playId
      setTimeout(() => {
        if (box.current.pendingNext === upcoming && box.current.playId === id) {
          box.current.pendingNext = null
          playStepRef.current?.(upcoming, 0)
        }
      }, 650)
      return
    }
    b.status = 'idle'
    setStatus('idle')
    setWordIndex(words.length - 1)
    setProgress(1)
  }, [words.length])

  const tick = useCallback(() => {
    const b = box.current
    if (b.status !== 'playing') return
    const now = performance.now()
    const elapsed = b.elapsed + (now - b.tickStart)
    const p = Math.min(1, elapsed / b.duration)
    const step = cfg.current.steps?.[b.active]
    const allWords = splitWords(step?.narration || '')
    const fromTime = Math.floor(p * allWords.length)
    const idx = Math.max(b.boundaryWord, fromTime)
    setProgress(p)
    setWordIndex(Math.max(0, Math.min(allWords.length - 1, idx)))
    if (p >= 1) finish()
  }, [finish])

  const startTicker = useCallback(() => {
    clearTimer()
    box.current.tickStart = performance.now()
    box.current.timer = setInterval(tick, 55)
  }, [tick])

  const playStep = useCallback(
    (index, startWord = 0, viaId) => {
      const list = cfg.current.steps || []
      const step = list[index]
      if (!step) return

      const b = box.current
      const id = viaId ?? b.playId + 1
      b.playId = id
      b.pendingNext = null
      clearTimer()
      cancelSpeech()

      const allWords = splitWords(step.narration)
      const sw = Math.max(0, Math.min(allWords.length - 1, Math.floor(startWord)))
      b.active = index
      b.startWord = sw
      b.duration = estimate(allWords.length, cfg.current.rate)
      b.elapsed = (b.duration * sw) / Math.max(1, allWords.length)
      b.boundaryWord = sw
      b.status = 'playing'
      b.tickStart = performance.now()

      setActiveIndex(index)
      setWordIndex(sw)
      setProgress(sw / Math.max(1, allWords.length))
      setStatus('playing')

      startTicker()

      if (supported && cfg.current.voiceOn) {
        try {
          window.speechSynthesis.cancel()
          const remaining = allWords.slice(sw).join(' ')
          if (!remaining) {
            b.elapsed = b.duration
            return
          }
          const u = new SpeechSynthesisUtterance(remaining)
          u.rate = cfg.current.rate
          u.pitch = 1.02
          u.volume = 1
          const v = voiceOf(voiceURI)
          if (v) {
            u.voice = v
            u.lang = v.lang
          }
          u.onboundary = (e) => {
            if (!box.current.playId || box.current.playId !== id) return
            if (e.name && e.name !== 'word') return
            const slice = remaining.slice(0, e.charIndex)
            const w = sw + splitWords(slice).length
            box.current.boundaryWord = Math.min(allWords.length - 1, w)
          }
          u.onend = () => {
            if (box.current.playId !== id) return
            // let the timer finish naturally so the highlight completes smoothly
            if (box.current.duration - box.current.elapsed < 300) {
              box.current.elapsed = box.current.duration
            }
          }
          u.onerror = () => {
            /* falls back to the timed highlight */
          }
          window.speechSynthesis.speak(u)
        } catch {
          /* silent karaoke continues */
        }
      }
    },
    [cancelSpeech, startTicker, supported, voiceOf, voiceURI],
  )

  const playStepRef = useRef(playStep)
  playStepRef.current = playStep

  const toggle = useCallback(() => {
    const b = box.current
    if (b.status === 'playing') {
      b.pendingNext = null
      b.elapsed += performance.now() - b.tickStart
      b.status = 'paused'
      setStatus('paused')
      clearTimer()
      if (supported) {
        try {
          window.speechSynthesis.pause()
        } catch {
          /* noop */
        }
      }
      return
    }
    if (b.status === 'paused' && b.active >= 0) {
      const step = cfg.current.steps?.[b.active]
      const allWords = splitWords(step?.narration || '')
      const at = Math.floor((b.elapsed / b.duration) * allWords.length)
      playStep(b.active, Math.max(0, Math.min(allWords.length - 1, at)))
      return
    }
    playStep(0, 0)
  }, [playStep, supported])

  const stop = useCallback(() => {
    const b = box.current
    b.playId += 1
    b.status = 'idle'
    b.pendingNext = null
    b.elapsed = 0
    b.boundaryWord = -1
    clearTimer()
    cancelSpeech()
    setStatus('idle')
    setActiveIndex(-1)
    setWordIndex(-1)
    setProgress(0)
  }, [cancelSpeech])

  const pause = useCallback(() => {
    const b = box.current
    if (b.status !== 'playing') return
    b.pendingNext = null
    b.elapsed += performance.now() - b.tickStart
    b.status = 'paused'
    setStatus('paused')
    clearTimer()
    if (supported) {
      try {
        window.speechSynthesis.pause()
      } catch {
        /* noop */
      }
    }
  }, [supported])

  const next = useCallback(() => {
    const b = box.current
    const list = cfg.current.steps || []
    const target = b.active < 0 ? 0 : Math.min(list.length - 1, b.active + 1)
    playStep(target, 0)
  }, [playStep])

  const prev = useCallback(() => {
    const b = box.current
    const target = b.active <= 0 ? 0 : b.active - 1
    playStep(target, 0)
  }, [playStep])

  const replayWord = useCallback(
    (w) => {
      const b = box.current
      if (b.active < 0) {
        playStep(0, w)
        return
      }
      playStep(b.active, w)
    },
    [playStep],
  )

  /* voice off → pause */
  useEffect(() => {
    if (!voiceOn) {
      const b = box.current
      if (b.status === 'playing') pause()
      cancelSpeech()
    }
  }, [voiceOn, pause, cancelSpeech])

  /* pause when the tab is hidden so no audio keeps playing in the background */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) pause()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [pause])

  /* rate change while playing → restart from the current word */
  const prevRate = useRef(rate)
  useEffect(() => {
    if (prevRate.current === rate) return
    prevRate.current = rate
    const b = box.current
    if (b.status !== 'playing' || b.active < 0) return
    const step = cfg.current.steps?.[b.active]
    const allWords = splitWords(step?.narration || [])
    const at = Math.round((b.elapsed / b.duration) * allWords.length)
    playStep(b.active, Math.max(0, Math.min(allWords.length - 1, at)))
  }, [rate, playStep])

  /* steps changed (new session) → hard stop */
  const stepsKey = useMemo(() => (steps || []).map((s) => s.id).join('|'), [steps])
  useEffect(() => {
    stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepsKey])

  useEffect(() => {
    return () => {
      clearTimer()
      cancelSpeech()
    }
  }, [cancelSpeech])

  return {
    status,
    isPlaying: status === 'playing',
    activeIndex,
    wordIndex,
    progress,
    words,
    voices,
    voiceURI,
    setVoiceURI,
    speechReady: voicesChecked && !speechReady ? 'none' : speechReady,
    voicesChecked,
    supported,
    toggle,
    pause,
    playStep,
    stop,
    next,
    prev,
    replayWord,
    totalSteps: steps?.length || 0,
  }
}
