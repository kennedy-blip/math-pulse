import { useCallback, useMemo, useRef, useState } from 'react'
import { GraduationCap, Heart, Sigma, Sparkles } from 'lucide-react'
import Header, { MobileNav } from './components/Header.jsx'
import VoiceTutor from './components/VoiceTutor.jsx'
import SocraticMode from './components/SocraticMode.jsx'
import HandwritingView, { PrintSheet } from './components/HandwritingView.jsx'
import AutoDiagram, { DIAGRAM_META } from './components/AutoDiagram.jsx'
import SummaryHub from './components/SummaryHub.jsx'
import FlashcardHub from './components/FlashcardHub.jsx'
import { ToastStack } from './components/ui.jsx'
import { AppContext } from './lib/appContext.jsx'
import { buildSession, seededSession } from './lib/classify.js'
import { emit } from './lib/bus.js'

let toastSeq = 0

export default function App() {
  const [session, setSession] = useState(() => seededSession())
  const [tab, setTabRaw] = useState('voice')
  const [voiceOn, setVoiceOn] = useState(true)
  const [coreState, setCoreState] = useState('listening')
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const pushToast = useCallback(
    (toast) => {
      const id = ++toastSeq
      setToasts((t) => [...t.slice(-3), { id, tone: 'violet', kind: 'default', ...toast }])
      timers.current[id] = setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id))
        delete timers.current[id]
      }, 4800)
    },
    [],
  )

  const setTab = useCallback((next) => {
    setTabRaw(next)
    if (next !== 'voice') emit('pause-narration')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const solve = useCallback(
    (text) => {
      const next = buildSession(text)
      emit('stop-narration')
      setSession(next)
      setTabRaw('voice')
      setCoreState('listening')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      const meta = next.disciplineMeta
      pushToast({
        title: `Topic detected · ${meta?.name}`,
        body: `${next.confidence}% confidence. ${next.generated ? 'Nearest exemplar loaded with an adaptive skeleton.' : 'Worked solution graph matched.'}`,
        tone: meta?.accent || 'violet',
        kind: 'success',
      })
      const kind = next.diagram?.kind
      const dm = DIAGRAM_META[kind]
      if (dm) {
        setTimeout(() => {
          pushToast({
            title: 'Auto-diagram synthesized',
            body: `${dm.label} rendered without a prompt — open the Auto-Diagram tab to interact with it.`,
            tone: 'cyan',
            kind: 'info',
          })
        }, 700)
      }
      return next
    },
    [pushToast],
  )

  const newSession = useCallback(() => {
    emit('stop-narration')
    setSession(null)
    setTabRaw('voice')
    setCoreState('listening')
    pushToast({
      title: 'New session started',
      body: 'Describe a problem by text or voice — the topic detector is listening.',
      tone: 'violet',
      kind: 'default',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pushToast])

  const exportPdf = useCallback(() => {
    if (!session) {
      pushToast({ title: 'Nothing to export yet', body: 'Solve a problem first.', tone: 'amber', kind: 'info' })
      return
    }
    pushToast({
      title: 'Preparing handwritten sheet',
      body: 'In the print dialog choose “Save as PDF” for an A4 ink note.',
      tone: 'cyan',
      kind: 'info',
    })
    setTimeout(() => {
      try {
        window.print()
      } catch {
        pushToast({ title: 'Printing unavailable', body: 'Your browser blocked the print dialog.', tone: 'rose', kind: 'error' })
      }
    }, 350)
  }, [session, pushToast])

  const value = useMemo(
    () => ({
      session,
      setSession,
      tab,
      setTab,
      voiceOn,
      setVoiceOn,
      coreState,
      setCoreState,
      toasts,
      pushToast,
      dismissToast,
      solve,
      newSession,
      exportPdf,
    }),
    [session, tab, setTab, voiceOn, coreState, toasts, pushToast, dismissToast, solve, newSession, exportPdf],
  )

  return (
    <AppContext.Provider value={value}>
      <div className="relative min-h-screen text-slate-200">
        <div className="app-bg" aria-hidden />

        <div id="app-shell" className="relative z-10 flex min-h-screen flex-col">
          <Header />

          <main className="mx-auto w-full max-w-[1500px] flex-1 px-3 pb-28 pt-4 sm:px-5 sm:pt-5 md:pb-10">
            <div className={tab === 'voice' ? 'animate-fade-in' : 'hidden'}>
              <VoiceTutor />
            </div>
            <div className={tab === 'socratic' ? 'animate-fade-in' : 'hidden'}>
              <SocraticMode />
            </div>
            <div className={tab === 'handwriting' ? 'animate-fade-in' : 'hidden'}>
              <HandwritingView />
            </div>
            <div className={tab === 'diagram' ? 'animate-fade-in' : 'hidden'}>
              <AutoDiagram />
            </div>
            <div className={tab === 'summary' ? 'animate-fade-in' : 'hidden'}>
              <SummaryHub />
            </div>
            <div className={tab === 'flashcards' ? 'animate-fade-in' : 'hidden'}>
              <FlashcardHub />
            </div>
          </main>

          <footer className="no-print relative z-10 border-t border-white/[0.05] px-4 py-4">
            <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md border border-violet/25 bg-violet/10 text-violet-soft">
                  <Sigma size={12} />
                </span>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  MathPulse · socratic-first math tutoring
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-slate-600">
                <span className="flex items-center gap-1">
                  <GraduationCap size={11} /> voice · ink · diagrams
                </span>
                <span className="hidden items-center gap-1 sm:flex">
                  <Sparkles size={11} /> simulated tutoring engine
                </span>
                <span className="flex items-center gap-1">
                  built for learners <Heart size={10} className="text-rose/70" />
                </span>
              </div>
            </div>
          </footer>

          <MobileNav />
        </div>

        <PrintSheet />
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </div>
    </AppContext.Provider>
  )
}
