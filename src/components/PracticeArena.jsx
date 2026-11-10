import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  Flame,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { useApp } from '../lib/appContext.jsx'
import { generateAdaptiveQuiz } from '../lib/generateQuiz.js'
import { Badge, Button, Card, Progress, accent } from './ui.jsx'

function Donut({ value, size = 108, stroke = 9, tone = '#10b981', label }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,.15)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          style={{ transition: 'stroke-dasharray .6s cubic-bezier(.2,.7,.3,1)', filter: `drop-shadow(0 0 6px ${tone}66)` }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-mono text-xl font-semibold text-white">{Math.round(value)}%</p>
        <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default function PracticeArena() {
  const { session, setTab, pushToast } = useApp()
  const [questions, setQuestions] = useState(session?.quiz || [])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)
  const [answers, setAnswers] = useState([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [finished, setFinished] = useState(false)

  const baseQuestions = session?.quiz || []

  const reset = (qs) => {
    setQuestions(qs || baseQuestions)
    setIndex(0)
    setSelected(null)
    setChecked(false)
    setAnswers([])
    setStreak(0)
    setBestStreak(0)
    setFinished(false)
  }

  useEffect(() => {
    reset(baseQuestions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])

  const q = questions[index]
  const correctCount = answers.filter((a) => a.correct).length
  const accuracy = answers.length ? (correctCount / answers.length) * 100 : 0

  const skills = useMemo(() => {
    const map = {}
    answers.forEach((a) => {
      const k = a.skill || 'Reasoning'
      map[k] = map[k] || { total: 0, correct: 0 }
      map[k].total += 1
      if (a.correct) map[k].correct += 1
    })
    return Object.entries(map).map(([name, v]) => ({ name, ...v }))
  }, [answers])

  if (!session) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-slate-400">Load a session to unlock the practice arena.</p>
      </Card>
    )
  }

  const choose = (i) => {
    if (checked) return
    setSelected(i)
  }

  const check = () => {
    if (selected == null || !q) return
    const isCorrect = selected === q.correct
    setChecked(true)
    setAnswers((a) => [...a, { qid: q.id, correct: isCorrect, skill: q.skill, question: q.question, selected, correctIdx: q.correct, explain: q.explain, trap: q.trap, options: q.options }])
    const nextStreak = isCorrect ? streak + 1 : 0
    setStreak(nextStreak)
    if (nextStreak > bestStreak) setBestStreak(nextStreak)
  }

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setSelected(null)
      setChecked(false)
    } else {
      setFinished(true)
    }
  }

  const newAdaptiveSet = () => {
    const qs = generateAdaptiveQuiz(session, 5)
    reset(qs)
    pushToast({
      title: 'Adaptive set generated',
      body: `Fresh ${session.disciplineMeta?.short} variants targeted at your current topic.`,
      tone: 'emerald',
      kind: 'success',
    })
  }

  const retryMissed = () => {
    const missed = answers.filter((a) => !a.correct)
    if (!missed.length) return
    const qs = missed.map((a) => ({
      id: `retry-${a.qid}`,
      question: a.question,
      options: a.options,
      correct: a.correctIdx,
      explain: a.explain,
      trap: a.trap,
      skill: a.skill,
    }))
    reset(qs)
  }

  const isCorrect = checked && selected === q?.correct

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] bg-gradient-to-r from-emerald/[0.08] to-transparent px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-emerald/25 bg-emerald/10 text-emerald">
            <Brain size={15} />
          </span>
          <div>
            <p className="text-[12.5px] font-semibold text-white">Adaptive Practice Arena</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              targeted at {session.disciplineMeta?.short} · {questions.length} questions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge tone="emerald" icon={Target} dot>
            scored
          </Badge>
          <Button size="xs" variant="outline" icon={Sparkles} onClick={newAdaptiveSet}>
            New set
          </Button>
          <Button size="xs" variant="ghost" icon={RotateCcw} onClick={() => reset()}>
            Restart
          </Button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
        {/* question */}
        <div className="border-white/[0.07] p-4 sm:p-5 lg:border-r">
          {!finished ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {questions.map((_, i) => {
                    const a = answers[i]
                    return (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === index
                            ? 'w-5 bg-violet'
                            : a
                              ? a.correct
                                ? 'w-1.5 bg-emerald'
                                : 'w-1.5 bg-rose'
                              : 'w-1.5 bg-white/15'
                        }`}
                      />
                    )
                  })}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  question {index + 1} / {questions.length}
                  {q?.generated && <span className="ml-2 rounded border border-cyan/25 px-1 py-px text-[8.5px] text-cyan">generated</span>}
                </span>
              </div>

              <h3 className="mt-3 text-[15px] font-semibold leading-relaxed text-white sm:text-base">{q?.question}</h3>
              {q?.skill && (
                <span className="mt-1.5 inline-block rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-slate-500">
                  skill · {q.skill}
                </span>
              )}

              <div className="mt-4 space-y-2">
                {q?.options.map((opt, i) => {
                  const state = !checked
                    ? selected === i
                      ? 'selected'
                      : 'idle'
                    : i === q.correct
                      ? 'correct'
                      : selected === i
                        ? 'wrong'
                        : 'muted'
                  const styles = {
                    idle: 'border-white/[0.08] bg-white/[0.025] text-slate-200 hover:border-violet/40 hover:bg-violet/[0.07] hover:text-white',
                    selected: 'border-violet/50 bg-violet/[0.12] text-white ring-1 ring-violet/25',
                    correct: 'border-emerald/45 bg-emerald/[0.1] text-white',
                    wrong: 'border-rose/45 bg-rose/[0.1] text-white',
                    muted: 'border-white/[0.05] bg-white/[0.015] text-slate-500',
                  }[state]
                  const letterStyle = {
                    idle: 'border-white/15 text-slate-500 group-hover:border-violet/40 group-hover:text-violet-soft',
                    selected: 'border-violet/50 bg-violet/20 text-violet-soft',
                    correct: 'border-emerald/50 bg-emerald/20 text-emerald',
                    wrong: 'border-rose/50 bg-rose/20 text-rose',
                    muted: 'border-white/10 text-slate-600',
                  }[state]
                  return (
                    <button
                      key={opt}
                      onClick={() => choose(i)}
                      disabled={checked}
                      className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-[12.5px] leading-snug transition ${styles} disabled:cursor-default`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border font-mono text-[10.5px] ${letterStyle}`}>
                        {state === 'correct' ? <Check size={12} strokeWidth={3} /> : state === 'wrong' ? <X size={12} strokeWidth={3} /> : String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {state === 'selected' && !checked && <ChevronRight size={13} className="text-violet-soft" />}
                    </button>
                  )
                })}
              </div>

              {checked && (
                <div
                  className={`mt-3.5 rounded-xl border p-3 animate-slide-up ${
                    isCorrect ? 'border-emerald/30 bg-emerald/[0.07]' : 'border-rose/30 bg-rose/[0.07]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`grid h-5 w-5 place-items-center rounded-full ${isCorrect ? 'bg-emerald/20 text-emerald' : 'bg-rose/20 text-rose'}`}>
                      {isCorrect ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
                    </span>
                    <p className={`text-[12px] font-semibold ${isCorrect ? 'text-emerald' : 'text-rose'}`}>
                      {isCorrect ? 'Correct — well reasoned' : 'Not quite — read the trap'}
                    </p>
                    {isCorrect && streak > 1 && (
                      <span className="ml-auto flex items-center gap-1 rounded-full border border-amber/30 bg-amber/10 px-2 py-0.5 font-mono text-[9.5px] text-amber">
                        <Flame size={9} /> {streak} streak
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-300">{q?.explain}</p>
                  {q?.trap && (
                    <p className="mt-1.5 text-[10.5px] leading-relaxed text-rose/90">
                      <span className="font-semibold uppercase tracking-wider">trap · </span>
                      {q.trap}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!checked ? (
                  <Button variant="primary" tone="emerald" icon={Check} onClick={check} disabled={selected == null}>
                    Check answer
                  </Button>
                ) : (
                  <Button variant="primary" tone="emerald" iconRight={ArrowRight} onClick={next}>
                    {index + 1 < questions.length ? 'Next question' : 'See results'}
                  </Button>
                )}
                <span className="font-mono text-[10px] text-slate-600">
                  {checked ? (isCorrect ? '+1 correct' : 'review the explanation above') : 'select one option'}
                </span>
              </div>
            </>
          ) : (
            <div className="animate-slide-up">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="label text-emerald">Arena report</p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    {accuracy >= 80 ? 'Strong command.' : accuracy >= 50 ? 'Solid, but gaps remain.' : 'Worth another pass.'}
                  </h3>
                  <p className="mt-1 max-w-md text-[12px] leading-relaxed text-slate-400">
                    You answered {correctCount} of {answers.length} correctly. Best streak: {bestStreak}. Missed questions
                    come with the trap that caught you — that is the highest-value revision list you can have.
                  </p>
                </div>
                <Donut value={accuracy} tone={accuracy >= 70 ? '#10b981' : accuracy >= 40 ? '#f59e0b' : '#f43f5e'} label="accuracy" />
              </div>

              <div className="mt-4 space-y-2">
                {answers.map((a, i) => (
                  <div key={i} className={`rounded-xl border p-3 ${a.correct ? 'border-emerald/20 bg-emerald/[0.04]' : 'border-rose/20 bg-rose/[0.04]'}`}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${a.correct ? 'bg-emerald/15 text-emerald' : 'bg-rose/15 text-rose'}`}>
                        {a.correct ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-slate-200">{a.question}</p>
                        {!a.correct && (
                          <>
                            <p className="mt-1 font-mono text-[11px] text-rose">your answer: {a.options[a.selected]}</p>
                            <p className="font-mono text-[11px] text-emerald">correct: {a.options[a.correctIdx]}</p>
                            <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">{a.explain}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary" tone="emerald" icon={RotateCcw} onClick={retryMissed} disabled={answers.every((a) => a.correct)}>
                  Retry missed
                </Button>
                <Button variant="outline" icon={Sparkles} onClick={newAdaptiveSet}>
                  New adaptive set
                </Button>
                <Button variant="ghost" icon={ArrowRight} onClick={() => setTab('flashcards')}>
                  Build flashcards
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* analytics */}
        <div className="space-y-3 bg-white/[0.015] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={13} className="text-emerald" />
              <p className="label text-emerald">Scoring analytics</p>
            </div>
            <Badge tone="slate">live</Badge>
          </div>

          <div className="flex items-center gap-3">
            <Donut value={accuracy} size={92} stroke={8} tone={accuracy >= 70 ? '#10b981' : '#f59e0b'} label="accuracy" />
            <div className="grid flex-1 grid-cols-2 gap-1.5">
              {[
                { k: 'correct', v: correctCount, c: 'text-emerald' },
                { k: 'wrong', v: answers.length - correctCount, c: 'text-rose' },
                { k: 'streak', v: streak, c: 'text-amber' },
                { k: 'best', v: bestStreak, c: 'text-violet-soft' },
              ].map((s) => (
                <div key={s.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
                  <p className={`font-mono text-[14px] font-semibold ${s.c}`}>{s.v}</p>
                  <p className="font-mono text-[8.5px] uppercase tracking-wider text-slate-500">{s.k}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center justify-between">
              <p className="label">Skill breakdown</p>
              <span className="font-mono text-[9.5px] text-slate-500">{skills.length} tracked</span>
            </div>
            <div className="mt-2 space-y-2">
              {skills.length === 0 && <p className="text-[10.5px] text-slate-600">Answer a question to see skill analytics.</p>}
              {skills.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="truncate text-slate-400">{s.name}</span>
                    <span className="font-mono text-slate-500">
                      {s.correct}/{s.total}
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${s.correct === s.total ? 'bg-emerald' : 'bg-amber'}`}
                      style={{ width: `${(s.correct / s.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-violet/15 bg-violet/[0.05] p-3">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-violet-soft" />
              <p className="label text-violet-soft">Adaptive engine</p>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-400">
              Generated variants keep the same skill but change the numbers, so you can’t pattern-match your way through.
              Two of every five questions are freshly synthesized.
            </p>
          </div>

          <div className="rounded-xl border border-amber/15 bg-amber/[0.04] p-3">
            <div className="flex items-center gap-2">
              <Flame size={12} className="text-amber" />
              <p className="label text-amber">Exam readiness</p>
            </div>
            <Progress value={accuracy / 100} tone={accuracy >= 70 ? 'emerald' : 'amber'} className="mt-2" />
            <p className="mt-1.5 text-[10.5px] text-slate-500">
              {accuracy >= 80
                ? 'You can handle this topic under time pressure.'
                : accuracy >= 50
                  ? 'Re-run the missed traps before an exam.'
                  : 'Return to the narrated steps, then retry.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
