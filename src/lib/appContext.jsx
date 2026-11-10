import { createContext, useContext } from 'react'

export const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside the AppContext provider')
  return ctx
}

export const TABS = [
  { id: 'voice', label: 'AI Solver & Voice', short: 'Solver', icon: 'AudioLines', accent: 'violet' },
  { id: 'socratic', label: 'Socratic Mode', short: 'Socratic', icon: 'MessagesSquare', accent: 'amber' },
  { id: 'handwriting', label: 'Handwriting Studio', short: 'Notes', icon: 'PenTool', accent: 'cyan' },
  { id: 'diagram', label: 'Auto-Diagram View', short: 'Diagrams', icon: 'Shapes', accent: 'cyan' },
  { id: 'summary', label: 'Summary & Quiz Hub', short: 'Hub', icon: 'BookOpenCheck', accent: 'emerald' },
  { id: 'flashcards', label: 'Flashcards', short: 'Cards', icon: 'Layers', accent: 'violet' },
]
