import { useCallback, useEffect, useRef, useState } from 'react'

export function useVoiceInput({ onTranscript } = {}) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const recRef = useRef(null)
  const baseRef = useRef('')
  const cbRef = useRef(onTranscript)
  cbRef.current = onTranscript

  const Ctor =
    typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
  const supported = Boolean(Ctor)

  const stop = useCallback(() => {
    try {
      recRef.current?.stop()
    } catch {
      /* noop */
    }
    setListening(false)
  }, [])

  const start = useCallback(
    (initialText = '') => {
      if (!Ctor) {
        setError('Voice input is not supported in this browser. Try Chrome or Edge.')
        return
      }
      stop()
      setError('')
      baseRef.current = initialText ? `${initialText.trim()} ` : ''
      const rec = new Ctor()
      rec.lang = 'en-US'
      rec.continuous = true
      rec.interimResults = true
      rec.maxAlternatives = 1
      rec.onresult = (event) => {
        let finalText = ''
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i]
          if (r.isFinal) finalText += r[0].transcript
          else interim += r[0].transcript
        }
        cbRef.current?.(`${baseRef.current}${finalText || interim}`.trim(), Boolean(finalText))
        if (finalText) baseRef.current = `${baseRef.current}${finalText} `
      }
      rec.onerror = (e) => {
        const map = {
          'not-allowed': 'Microphone permission was blocked. Allow mic access and retry.',
          'service-not-allowed': 'Speech recognition is unavailable in this environment.',
          'no-speech': 'No speech detected — try again a little closer to the mic.',
          'audio-capture': 'No microphone found.',
          network: 'Speech recognition needs a network connection.',
        }
        setError(map[e.error] || `Voice input error: ${e.error}`)
        setListening(false)
      }
      rec.onend = () => setListening(false)
      try {
        rec.start()
        recRef.current = rec
        setListening(true)
      } catch {
        setError('Could not start the microphone.')
        setListening(false)
      }
    },
    [Ctor, stop],
  )

  useEffect(() => () => {
    try {
      recRef.current?.abort?.()
    } catch {
      /* noop */
    }
  }, [])

  return { supported, listening, error, start, stop, toggle: (text) => (listening ? stop() : start(text)) }
}
