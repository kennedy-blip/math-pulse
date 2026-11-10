import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, AlertTriangle, Info, Sparkles, ChevronRight } from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Accent tokens (static classes so Tailwind keeps them)              */
/* ------------------------------------------------------------------ */
export const ACCENTS = {
  violet: {
    text: 'text-violet',
    soft: 'text-violet-soft',
    bg: 'bg-violet/10',
    bgStrong: 'bg-violet/20',
    border: 'border-violet/30',
    ring: 'ring-violet/40',
    dot: 'bg-violet',
    hex: '#8b5cf6',
    grad: 'from-violet/25 via-violet/10 to-transparent',
    solid: 'bg-violet',
    button:
      'bg-violet text-white hover:bg-violet/90 shadow-[0_10px_30px_-12px_rgba(139,92,246,.9)]',
    glow: 'shadow-[0_0_36px_-12px_rgba(139,92,246,.85)]',
  },
  emerald: {
    text: 'text-emerald',
    soft: 'text-emerald',
    bg: 'bg-emerald/10',
    bgStrong: 'bg-emerald/20',
    border: 'border-emerald/30',
    ring: 'ring-emerald/40',
    dot: 'bg-emerald',
    hex: '#10b981',
    grad: 'from-emerald/25 via-emerald/10 to-transparent',
    solid: 'bg-emerald',
    button:
      'bg-emerald text-[#04140f] hover:bg-emerald/90 shadow-[0_10px_30px_-12px_rgba(16,185,129,.9)]',
    glow: 'shadow-[0_0_36px_-12px_rgba(16,185,129,.85)]',
  },
  cyan: {
    text: 'text-cyan',
    soft: 'text-cyan',
    bg: 'bg-cyan/10',
    bgStrong: 'bg-cyan/20',
    border: 'border-cyan/30',
    ring: 'ring-cyan/40',
    dot: 'bg-cyan',
    hex: '#06b6d4',
    grad: 'from-cyan/25 via-cyan/10 to-transparent',
    solid: 'bg-cyan',
    button:
      'bg-cyan text-[#03161a] hover:bg-cyan/90 shadow-[0_10px_30px_-12px_rgba(6,182,212,.9)]',
    glow: 'shadow-[0_0_36px_-12px_rgba(6,182,212,.85)]',
  },
  amber: {
    text: 'text-amber',
    soft: 'text-amber',
    bg: 'bg-amber/10',
    bgStrong: 'bg-amber/20',
    border: 'border-amber/30',
    ring: 'ring-amber/40',
    dot: 'bg-amber',
    hex: '#f59e0b',
    grad: 'from-amber/25 via-amber/10 to-transparent',
    solid: 'bg-amber',
    button:
      'bg-amber text-[#1a1204] hover:bg-amber/90 shadow-[0_10px_30px_-12px_rgba(245,158,11,.9)]',
    glow: 'shadow-[0_0_36px_-12px_rgba(245,158,11,.85)]',
  },
  rose: {
    text: 'text-rose',
    soft: 'text-rose',
    bg: 'bg-rose/10',
    bgStrong: 'bg-rose/20',
    border: 'border-rose/30',
    ring: 'ring-rose/40',
    dot: 'bg-rose',
    hex: '#f43f5e',
    grad: 'from-rose/25 via-rose/10 to-transparent',
    solid: 'bg-rose',
    button:
      'bg-rose text-white hover:bg-rose/90 shadow-[0_10px_30px_-12px_rgba(244,63,94,.9)]',
    glow: 'shadow-[0_0_36px_-12px_rgba(244,63,94,.85)]',
  },
  slate: {
    text: 'text-slate-300',
    soft: 'text-slate-300',
    bg: 'bg-white/5',
    bgStrong: 'bg-white/10',
    border: 'border-white/10',
    ring: 'ring-white/20',
    dot: 'bg-slate-400',
    hex: '#94a3b8',
    grad: 'from-white/10 via-white/5 to-transparent',
    solid: 'bg-slate-500',
    button: 'bg-white/10 text-white hover:bg-white/15',
    glow: '',
  },
}

export const accent = (name) => ACCENTS[name] || ACCENTS.violet

/* ------------------------------------------------------------------ */
/* Badge                                                              */
/* ------------------------------------------------------------------ */
export function Badge({ children, tone = 'violet', icon: Icon, pulse, className = '', dot }) {
  const a = accent(tone)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${a.border} ${a.bg} px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] ${a.text} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${a.dot} opacity-70`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${a.dot}`} />
        </span>
      )}
      {dot && !pulse && <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />}
      {Icon && <Icon size={11.5} strokeWidth={2.4} />}
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Card & section header                                              */
/* ------------------------------------------------------------------ */
export function Card({ children, className = '', tone, hover, glow, as: Tag = 'div', ...rest }) {
  const a = tone ? accent(tone) : null
  return (
    <Tag
      className={`glass ${hover ? 'card-hover' : ''} ${glow && a ? a.glow : ''} ${
        a ? a.border : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function SectionHeader({ eyebrow, title, sub, icon: Icon, tone = 'violet', right, className = '' }) {
  const a = accent(tone)
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4 ${className}`}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {Icon && (
          <span
            className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${a.border} ${a.bg} ${a.text}`}
          >
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
        <div>
          {eyebrow && <p className={`label ${a.text}`}>{eyebrow}</p>}
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">{title}</h2>
          {sub && <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-400">{sub}</p>}
        </div>
      </div>
      {right && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end">{right}</div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Buttons                                                            */
/* ------------------------------------------------------------------ */
const SIZES = {
  xs: 'h-7 px-2.5 text-[11px] rounded-lg gap-1.5',
  sm: 'h-8 px-3 text-[12px] rounded-lg gap-1.5',
  md: 'h-10 px-4 text-[13px] rounded-xl gap-2',
  lg: 'h-12 px-5 text-sm rounded-xl gap-2',
}
const VARIANTS = {
  primary: 'text-white',
  soft: 'border border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/[0.11] hover:text-white',
  ghost: 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
  outline: 'border border-white/15 text-slate-200 hover:border-white/30 hover:bg-white/[0.05] hover:text-white',
  success: 'text-[#04140f]',
}

export function Button({
  children,
  icon: Icon,
  iconRight: IconRight,
  variant = 'soft',
  tone = 'violet',
  size = 'md',
  className = '',
  active,
  ...rest
}) {
  const a = accent(tone)
  let toneClass = VARIANTS[variant]
  if (variant === 'primary') toneClass = a.button
  if (variant === 'success') toneClass = ACCENTS.emerald.button
  return (
    <button
      className={`focus-ring inline-flex shrink-0 items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${SIZES[size]} ${toneClass} ${
        active ? 'ring-1 ring-white/25' : ''
      } ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'lg' ? 17 : 15} strokeWidth={2.2} />}
      {children}
      {IconRight && <IconRight size={size === 'lg' ? 17 : 15} strokeWidth={2.2} />}
    </button>
  )
}

const ICON_SIZES = { 7: 'h-7 w-7', 8: 'h-8 w-8', 9: 'h-9 w-9', 10: 'h-10 w-10', 11: 'h-11 w-11', 12: 'h-12 w-12' }

export function IconButton({ icon: Icon, label, size = 9, tone = 'slate', className = '', ...rest }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`focus-ring grid ${ICON_SIZES[size] || 'h-9 w-9'} shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white ${className}`}
      {...rest}
    >
      <Icon size={16} strokeWidth={2.1} />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Formula, progress, toggle                                          */
/* ------------------------------------------------------------------ */
export function Formula({ children, className = '', tone, block, size = 'md' }) {
  const a = tone ? accent(tone) : null
  return (
    <code
      className={`font-mono ${
        size === 'sm' ? 'text-[12px]' : size === 'lg' ? 'text-base sm:text-lg' : 'text-[13.5px]'
      } ${block ? 'block' : 'inline-block'} ${
        a ? a.text : 'text-slate-100'
      } ${className}`}
      style={{ fontVariantLigatures: 'none' }}
    >
      {children}
    </code>
  )
}

export function Progress({ value = 0, tone = 'violet', className = '', height = 'h-1.5', stripes }) {
  const a = accent(tone)
  const pct = Math.max(0, Math.min(100, value * 100))
  return (
    <div className={`w-full overflow-hidden rounded-full bg-white/[0.07] ${height} ${className}`}>
      <div
        className={`h-full rounded-full ${a.solid} transition-[width] duration-150 ease-linear ${
          stripes ? 'animate-shimmer' : ''
        }`}
        style={{
          width: `${pct}%`,
          backgroundImage: stripes
            ? 'linear-gradient(90deg, rgba(255,255,255,.05), rgba(255,255,255,.55), rgba(255,255,255,.05))'
            : undefined,
          backgroundSize: stripes ? '200% 100%' : undefined,
        }}
      />
    </div>
  )
}

export function Toggle({ checked, onChange, label, tone = 'violet', hint }) {
  const a = accent(tone)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex items-center gap-2.5 text-left"
    >
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
          checked ? `${a.solid} border-transparent` : 'border-white/15 bg-white/[0.08]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
      <span>
        <span className="block text-[12.5px] font-medium text-slate-200">{label}</span>
        {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Drawer / Modal                                                     */
/* ------------------------------------------------------------------ */
function useDismiss(open, onClose) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])
}

export function Drawer({ open, onClose, title, eyebrow, icon: Icon, children, footer, width = 'max-w-lg' }) {
  useDismiss(open, onClose)
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex h-full w-full ${width} flex-col border-l border-white/10 bg-[#0b1120]/95 shadow-2xl animate-slide-up sm:m-3 sm:h-[calc(100%_-_1.5rem)] sm:rounded-2xl sm:border`}
        style={{ animationDuration: '.3s' }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/[0.07] p-5">
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet/15 text-violet">
                <Icon size={17} />
              </span>
            )}
            <div>
              {eyebrow && <p className="label text-violet">{eyebrow}</p>}
              <h3 className="mt-0.5 text-base font-semibold text-white">{title}</h3>
            </div>
          </div>
          <IconButton icon={X} label="Close panel" onClick={onClose} />
        </header>
        <div className="scroll-fade flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="border-t border-white/[0.07] p-4">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  )
}

export function Modal({ open, onClose, title, eyebrow, icon: Icon, children, footer, width = 'max-w-xl' }) {
  useDismiss(open, onClose)
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${width} overflow-hidden rounded-t-2xl border border-white/10 bg-[#0b1120]/95 shadow-2xl animate-slide-up sm:rounded-2xl`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/[0.07] p-5">
          <div>
            {eyebrow && <p className="label text-violet">{eyebrow}</p>}
            <h3 className="mt-1 flex items-center gap-2 text-base font-semibold text-white">
              {Icon && <Icon size={17} className="text-violet" />}
              {title}
            </h3>
          </div>
          <IconButton icon={X} label="Close dialog" onClick={onClose} />
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && <footer className="border-t border-white/[0.07] bg-white/[0.02] p-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

/* ------------------------------------------------------------------ */
/* Toasts                                                             */
/* ------------------------------------------------------------------ */
const TOAST_ICON = { success: Check, error: AlertTriangle, info: Info, default: Sparkles }

export function ToastStack({ toasts, onDismiss }) {
  return createPortal(
    <div className="pointer-events-none fixed bottom-24 right-3 z-[95] flex w-[min(360px,calc(100vw_-_1.5rem))] flex-col gap-2 sm:bottom-5 sm:right-5">
      {toasts.map((t) => {
        const a = accent(t.tone || 'violet')
        const Icon = TOAST_ICON[t.kind] || TOAST_ICON.default
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${a.border} bg-panel/95 p-3 pr-2 shadow-card backdrop-blur-xl animate-slide-up`}
          >
            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg ${a.bg} ${a.text}`}>
              <Icon size={13} strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold leading-snug text-white">{t.title}</p>
              {t.body && <p className="mt-0.5 text-[11.5px] leading-snug text-slate-400">{t.body}</p>}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="rounded-md p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X size={13} />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}

/* ------------------------------------------------------------------ */
/* Misc                                                              */
/* ------------------------------------------------------------------ */
export function Divider({ className = '' }) {
  return <div className={`divider ${className}`} />
}

export function Stat({ label, value, suffix, tone = 'violet', icon: Icon, hint }) {
  const a = accent(tone)
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
      <div className="flex items-center justify-between">
        <p className="label">{label}</p>
        {Icon && <Icon size={13} className={a.text} />}
      </div>
      <p className={`mt-1.5 font-mono text-lg font-semibold ${a.text}`}>
        {value}
        {suffix && <span className="ml-1 text-[11px] font-normal text-slate-500">{suffix}</span>}
      </p>
      {hint && <p className="mt-0.5 text-[10.5px] leading-snug text-slate-500">{hint}</p>}
    </div>
  )
}

export function EmptyHint({ icon: Icon = Info, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] text-slate-500">
        <Icon size={20} />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-200">{title}</p>
      {body && <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ListRow({ children, onClick, className = '', chevron, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition hover:border-white/15 hover:bg-white/[0.05] disabled:opacity-60 ${className}`}
    >
      {children}
      {chevron && (
        <ChevronRight size={15} className="ml-auto shrink-0 text-slate-600 transition group-hover:text-slate-300" />
      )}
    </button>
  )
}
