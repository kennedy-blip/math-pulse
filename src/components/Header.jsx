import {
  AudioLines,
  BookOpenCheck,
  FileDown,
  Layers,
  MessagesSquare,
  PenTool,
  Plus,
  Shapes,
  Sigma,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useApp, TABS } from '../lib/appContext.jsx'
import { ACCENTS, Button } from './ui.jsx'

const ICONS = {
  AudioLines,
  MessagesSquare,
  PenTool,
  Shapes,
  BookOpenCheck,
  Layers,
}

const CORE = {
  listening: { text: 'AI Tutor Core: Active & Listening', tone: 'emerald' },
  speaking: { text: 'AI Tutor Core: Narrating', tone: 'cyan' },
  muted: { text: 'AI Tutor Core: Voice Muted', tone: 'amber' },
}

export default function Header() {
  const { tab, setTab, voiceOn, setVoiceOn, exportPdf, newSession, session, coreState } = useApp()
  const core = CORE[coreState] || CORE.listening
  const tone = ACCENTS[core.tone]

  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/[0.07] bg-obsidian/80 backdrop-blur-2xl">
      <div className="mx-auto w-full max-w-[1500px] px-3 sm:px-5">
        <div className="flex h-[68px] items-center gap-3">
          {/* brand */}
          <button
            onClick={() => setTab('voice')}
            className="focus-ring group flex min-w-0 items-center gap-3 rounded-xl text-left"
            aria-label="MathPulse home"
          >
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/30 via-violet/10 to-cyan/10 shadow-[0_0_30px_-6px_rgba(139,92,246,.7)]">
              <span className="absolute inset-0 animate-pulse-ring rounded-2xl border border-violet/40" />
              <Sigma size={21} className="relative text-violet-soft drop-shadow-[0_0_8px_rgba(167,139,250,.8)]" strokeWidth={2.4} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald shadow-[0_0_8px_rgba(16,185,129,.9)]" />
            </span>
            <span className="min-w-0">
              <span className="flex items-baseline gap-2">
                <span className="truncate text-[19px] font-extrabold tracking-tight text-white">
                  Math<span className="bg-gradient-to-r from-violet-soft to-cyan bg-clip-text text-transparent">Pulse</span>
                </span>
                <span className="hidden rounded border border-white/10 bg-white/[0.04] px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-slate-400 sm:inline">
                  v2.4
                </span>
              </span>
              <span className="hidden text-[10.5px] font-medium uppercase tracking-[0.19em] text-slate-500 sm:block">
                AI Voice Math Tutor
              </span>
            </span>
          </button>

          {/* live status */}
          <div className="ml-1 hidden min-w-0 flex-1 items-center gap-2 lg:flex">
            <div className={`flex items-center gap-2 rounded-full border ${tone.border} ${tone.bg} px-3 py-1.5`}>
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${tone.dot} opacity-75`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${tone.dot}`} />
              </span>
              <span className={`whitespace-nowrap text-[11px] font-semibold tracking-wide ${tone.text}`}>{core.text}</span>
            </div>
            {session && (
              <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                <span className="truncate font-mono text-[10.5px] text-slate-400">
                  {session.disciplineMeta?.short} · {session.confidence}% match
                </span>
              </div>
            )}
          </div>

          {/* quick actions */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setVoiceOn(!voiceOn)}
              aria-pressed={voiceOn}
              title={voiceOn ? 'Pause the voice tutor' : 'Resume the voice tutor'}
              className={`focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[11.5px] font-semibold transition ${
                voiceOn
                  ? 'border-violet/35 bg-violet/[0.12] text-violet-soft hover:bg-violet/20'
                  : 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-white'
              }`}
            >
              {voiceOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span className="hidden xl:inline">{voiceOn ? 'Voice On' : 'Voice Off'}</span>
            </button>
            <Button
              size="sm"
              icon={FileDown}
              onClick={exportPdf}
              disabled={!session}
              className="h-9"
              aria-label="Export handwritten PDF"
              title="Export the handwritten solution as a PDF"
            >
              <span className="hidden xl:inline">Export Handwritten PDF</span>
              <span className="xl:hidden">PDF</span>
            </Button>
            <Button
              size="sm"
              icon={Plus}
              variant="primary"
              onClick={newSession}
              className="h-9"
              aria-label="Start a new session"
              title="Start a new tutoring session"
            >
              <span className="hidden md:inline">New Session</span>
              <span className="md:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* mobile status ribbon */}
        <div className="flex items-center gap-2 pb-2 md:hidden">
          <div className={`flex min-w-0 items-center gap-1.5 rounded-full border ${tone.border} ${tone.bg} px-2.5 py-1`}>
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${tone.dot} opacity-70`} />
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${tone.dot}`} />
            </span>
            <span className={`truncate text-[10px] font-semibold tracking-wide ${tone.text}`}>{core.text}</span>
          </div>
          {session && (
            <span className="ml-auto shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[9.5px] text-slate-400">
              {session.disciplineMeta?.short} · {session.confidence}%
            </span>
          )}
        </div>

        {/* desktop tabs */}
        <nav className="relative hidden items-center gap-1 pb-2 md:flex" aria-label="Primary navigation">
          {TABS.map((t) => {
            const Icon = ICONS[t.icon]
            const active = tab === t.id
            const a = ACCENTS[t.accent]
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={active ? 'page' : undefined}
                className={`focus-ring group relative flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold transition-all ${
                  active
                    ? 'bg-white/[0.07] text-white'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                }`}
              >
                <Icon size={15} className={active ? a.text : 'text-slate-500 group-hover:text-slate-300'} strokeWidth={2.1} />
                <span className="whitespace-nowrap">{t.label}</span>
                {active && (
                  <span
                    className={`absolute inset-x-2.5 -bottom-2 h-[2px] rounded-full ${a.solid}`}
                    style={{ boxShadow: `0 0 12px ${a.hex}` }}
                  />
                )}
              </button>
            )
          })}
          <div className="ml-auto hidden items-center gap-2 pl-4 lg:flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">voice-first pedagogy</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">socratic engine</span>
          </div>
        </nav>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-violet/30 to-transparent" />
    </header>
  )
}

export function MobileNav() {
  const { tab, setTab } = useApp()
  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#070a12]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-6">
        {TABS.map((t) => {
          const Icon = ICONS[t.icon]
          const active = tab === t.id
          const a = ACCENTS[t.accent]
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={active ? 'page' : undefined}
              aria-label={t.label}
              className={`focus-ring relative flex flex-col items-center gap-0.5 px-0.5 pb-5 pt-2 text-[9px] font-semibold transition ${
                active ? 'text-white' : 'text-slate-500'
              }`}
            >
              {active && <span className={`absolute inset-x-3 top-0 h-[2px] rounded-full ${a.solid}`} />}
              <span className={`grid h-6 w-6 place-items-center rounded-lg ${active ? `${a.bg} ${a.text}` : ''}`}>
                <Icon size={16} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className="leading-none">{t.short}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
