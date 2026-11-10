import { PROBLEMS, DISCIPLINES } from '../data/problems.js'

/* ------------------------------------------------------------------ */
/* Keyword scoring rules                                              */
/* ------------------------------------------------------------------ */
const RULES = [
  {
    discipline: 'calculus',
    base: 'derivative-power',
    strong: ['derivative', 'differentiate', "d/dx", 'power rule', 'tangent', 'slope of the curve'],
    weak: ['rate of change', 'instantaneous', 'f(x)', 'f′(x)', 'gradient of a curve', 'maximum slope'],
  },
  {
    discipline: 'integral',
    base: 'definite-integral',
    strong: ['integral', 'integrate', 'antiderivative', '∫', 'area under', 'definite integral'],
    weak: ['riemann', 'accumulation', 'area between', 'dx', 'fundamental theorem'],
  },
  {
    discipline: 'multivariable',
    base: 'lagrange-constraint',
    strong: ['lagrange', 'multiplier', 'subject to', 'maximise', 'maximize', 'minimise', 'minimize constraint'],
    weak: ['partial', 'gradient', 'f(x, y)', 'constraint', 'two variables', 'level curve', 'contour'],
  },
  {
    discipline: 'linear',
    base: 'linear-system',
    strong: ['system', 'simultaneous', 'matrix', 'determinant', 'elimination', 'eigen'],
    weak: ['linear', 'two equations', 'x and y', 'solve', 'row reduce', 'vector', 'intersection of lines', 'simultaneous'],
  },
  {
    discipline: 'probability',
    base: 'normal-probability',
    strong: ['probability', 'normal distribution', 'z-score', 'binomial', 'poisson', 'random variable', 'bayes'],
    weak: ['chance', 'mean', 'standard deviation', 'distribution', 'expected value', 'p(x', 'likelihood'],
  },
  {
    discipline: 'geometry',
    base: 'triangle-angles',
    strong: ['triangle', 'angle', 'polygon', 'congruent', 'similar triangles', 'circumcircle'],
    weak: ['geometry', 'ratio of angles', 'degrees', 'isosceles', 'equilateral', 'theorem of pythagoras'],
  },
]

const norm = (s) => (s || '').toLowerCase().replace(/[−–]/g, '-').replace(/\s+/g, ' ').trim()

/* ------------------------------------------------------------------ */
/* Math-aware helpers                                                 */
/* ------------------------------------------------------------------ */
const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }
const SUPERSCRIPT = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }

const clean = (s) =>
  (s || '')
    .replace(/^[\s[({]+/, '')
    .replace(/[\s\])}]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()

const SUPER_CARET = { '⁰': '^0', '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4', '⁵': '^5', '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9' }

function mathKey(s) {
  return norm(s)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (m) => SUPER_CARET[m])
    .replace(/×/g, '*')
    .replace(/\s+/g, '')
}

const FINGERPRINTS = [
  { id: 'derivative-power', test: (k) => k.includes('3x^2+2x') && !k.includes('∫') },
  { id: 'definite-integral', test: (k) => k.includes('∫') && k.includes('3x^2+2x') },
  { id: 'lagrange-constraint', test: (k) => k.includes('x^2y') && k.includes('x+y=6') },
  { id: 'linear-system', test: (k) => k.includes('2x+3y=12') || (k.includes('2x') && k.includes('x-y=1')) },
  { id: 'normal-probability', test: (k) => k.includes('n(500') && k.includes('650') },
  { id: 'triangle-angles', test: (k) => k.includes('2:3:4') && k.includes('angle') },
]

/* Extracts the actual mathematical object from a natural-language prompt. */
export function extractExpression(text) {
  const raw = (text || '').replace(/[−–]/g, '-').trim()
  if (!raw) return ''
  let m = raw.match(
    /f\s*\(\s*x\s*(?:,\s*y\s*)?\)\s*=\s*([^,;?]+?)(?:\s*,|\s+and\b|\s+subject\b|\s+where\b|\s+for\b|[.;?]|$)/i,
  )
  if (m) return clean(m[1])
  m = raw.match(/(?:d\s*\/\s*dx|dy\s*\/\s*dx)\s*[\[(]?\s*([^\])]{2,60})[\])]?/i)
  if (m) return clean(m[1])
  m = raw.match(/(∫[^,;?=]{0,60}?d\s*x)/i)
  if (m) return clean(m[1])
  m = raw.match(
    /(?:antiderivative|derivative|differentiate|integral|integrate|evaluate|solve|simplify)\s+(?:of\s+)?([^,;?]{2,60}?)(?:\s+and\b|\s+at\b|\s+for\b|\s+from\b|\s+subject\b|[.;?]|$)/i,
  )
  if (m) return clean(m[1])
  return ''
}

function shapeProblem(text, discipline) {
  const primary = extractExpression(text)
  let formula = primary
  const t = (text || '').replace(/[−–]/g, '-')
  if (discipline === 'calculus' && primary) formula = `d/dx [ ${primary} ]`
  if (discipline === 'integral' && primary && !primary.includes('∫')) formula = `∫ ${primary} dx`
  if (discipline === 'multivariable' && primary) {
    const cons = t.match(/subject to\s+([^,;?]+)/i)
    formula = `${primary}${cons ? `   s.t.   ${clean(cons[1])}` : ''}`
  }
  if (discipline === 'linear') {
    const eqs = t.match(/[0-9a-z]+\s*[+\-]\s*[0-9a-z]+\s*=\s*-?\d+/gi)
    if (eqs && eqs.length) formula = eqs.slice(0, 2).join('   ·   ')
  }
  return { primary, formula }
}

/* Lightweight polynomial engine — handles a·xⁿ terms only. */
function parsePolynomial(expr) {
  if (!expr || /[a-wyzA-WYZ√∫^a-wyz]/.test(expr.replace(/\^/g, ''))) return null
  if (/[()/]/.test(expr)) return null
  const s = expr
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (m) => `^${SUP[m]}`)
    .replace(/\s+/g, '')
    .replace(/\*/g, '')
    .replace(/-/g, '+-')
  if (!s) return null
  const parts = s.split('+').filter(Boolean)
  if (!parts.length) return null
  const terms = []
  for (const part of parts) {
    const m = part.match(/^([+-]?)(\d*\.?\d*)(?:x(?:\^(-?\d+))?)?$/)
    if (!m) return null
    const hasX = /x/.test(part)
    const coefRaw = m[2]
    const coef = coefRaw === '' || coefRaw === '.' ? 1 : Number(coefRaw)
    if (!Number.isFinite(coef)) return null
    const pow = hasX ? (m[3] !== undefined ? Number(m[3]) : 1) : 0
    terms.push({ c: m[1] === '-' ? -coef : coef, p: pow })
  }
  return terms
}

const supStr = (n) =>
  String(n)
    .split('')
    .map((ch) => SUPERSCRIPT[ch] || ch)
    .join('')

function polyToString(terms) {
  const kept = terms.filter((t) => Math.abs(t.c) > 1e-9)
  if (!kept.length) return '0'
  return kept
    .map((t, i) => {
      const sign = t.c < 0 ? '−' : i === 0 ? '' : '+'
      const abs = Math.abs(t.c)
      const coef = abs === 1 && t.p !== 0 ? '' : Number(abs.toFixed(3)).toString()
      const x = t.p === 0 ? '' : t.p === 1 ? 'x' : `x${supStr(t.p)}`
      return `${sign}${coef}${x}`
    })
    .join(' ')
    .replace(/^\+/, '')
    .replace(/\+/g, '+ ')
    .replace(/−/g, '− ')
    .replace(/\s+/g, ' ')
    .trim()
}

const pretty = (v) =>
  (v || '')
    .replace(/\s+-\s+/g, ' − ')
    .replace(/(\d|\))\s*-\s*(?=\d)/g, '$1 − ')

const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '-': '₋', '.': '.' }
const numSub = (n) => String(n).split('').map((c) => SUB[c] || c).join('')
const boundsNotation = ([a, b]) =>
  Number.isInteger(a) && Number.isInteger(b) && a >= 0 && a < 10 && b >= 0 && b < 10
    ? `∫${numSub(a)}${SUPERSCRIPT[b]}`
    : `∫[${a}, ${b}]`

function evalPolynomialAt(terms, x) {
  return terms.reduce((sum, t) => sum + t.c * Math.pow(x, t.p), 0)
}

function evalAntiderivativeAt(terms, x) {
  return terms.reduce((sum, t) => sum + (t.c / (t.p + 1)) * Math.pow(x, t.p + 1), 0)
}

const fmtNum = (n) => {
  if (!Number.isFinite(n)) return '—'
  const rounded = Math.round(n * 10000) / 10000
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

export function functionModel(expr) {
  const terms = parsePolynomial(expr)
  if (!terms || !terms.length) return null
  return {
    terms,
    f: (x) => evalPolynomialAt(terms, x),
    df: (x) => terms.reduce((sum, t) => (t.p === 0 ? sum : sum + t.c * t.p * Math.pow(x, t.p - 1)), 0),
    F: (x) => evalAntiderivativeAt(terms, x),
  }
}

function parseEquation(eq) {
  const [lhsRaw, rhsRaw] = eq.split('=')
  if (lhsRaw === undefined || rhsRaw === undefined) return null
  const lhs = lhsRaw.replace(/\s+/g, '')
  const rhs = Number(rhsRaw.replace(/\s+/g, ''))
  if (!Number.isFinite(rhs)) return null
  let a = 0
  let b = 0
  let constant = 0
  const parts = lhs.replace(/-/g, '+-').split('+').filter(Boolean)
  if (!parts.length) return null
  for (const part of parts) {
    const m = part.match(/^([+-]?)(\d*\.?\d*)([xy])$/)
    if (m) {
      const coef = m[2] === '' || m[2] === '.' ? 1 : Number(m[2])
      const val = m[1] === '-' ? -coef : coef
      if (m[3] === 'x') a += val
      else b += val
      continue
    }
    if (/^[+-]?\d*\.?\d+$/.test(part)) {
      constant += Number(part)
      continue
    }
    return null
  }
  return { a, b, c: rhs - constant }
}

export function solveLinearSystem(text) {
  const t = (text || '').replace(/[−–]/g, '-')
  const matches = [...t.matchAll(/[+-]?\s*\d*\.?\d*\s*[xy](?:\s*[+-]\s*\d*\.?\d*\s*[xy])?\s*=\s*-?\d+\.?\d*/g)]
  if (matches.length < 2) return null
  const eqs = matches.slice(0, 2).map((m) => parseEquation(m[0].replace(/\s+/g, '')))
  if (eqs.some((e) => !e)) return null
  const [e1, e2] = eqs
  const det = e1.a * e2.b - e1.b * e2.a
  if (Math.abs(det) < 1e-9) return null
  const x = (e1.c * e2.b - e1.b * e2.c) / det
  const y = (e1.a * e2.c - e1.c * e2.a) / det
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return { x, y, det }
}

export function derivativeOf(expr) {
  const terms = parsePolynomial(expr)
  if (!terms) return null
  return polyToString(terms.filter((t) => t.p !== 0).map((t) => ({ c: t.c * t.p, p: t.p - 1 })))
}

export function antiderivativeOf(expr) {
  const terms = parsePolynomial(expr)
  if (!terms) return null
  return polyToString(terms.map((t) => ({ c: t.c / (t.p + 1), p: t.p + 1 })))
}

/* Detects the discipline of a free-text prompt. Returns a rich object. */
export function classifyTopic(text) {
  const t = norm(text)
  if (!t) {
    return {
      discipline: 'calculus',
      disciplineMeta: DISCIPLINES.calculus,
      confidence: 0,
      problemId: 'derivative-power',
      signals: [],
      reason: 'Awaiting a problem statement.',
      empty: true,
    }
  }

  let best = { score: 0, rule: RULES[0], signals: [] }

  for (const rule of RULES) {
    let score = 0
    const signals = []
    for (const kw of rule.strong) {
      if (kw === 'derivative' && t.includes('antiderivative')) continue
      if (t.includes(norm(kw))) {
        score += 4
        signals.push(kw)
      }
    }
    for (const kw of rule.weak) {
      if (kw === 'dx' && t.includes('d/dx')) continue
      if (t.includes(norm(kw))) {
        score += 1.4
        signals.push(kw)
      }
    }
    // structural hints
    if (rule.discipline === 'calculus' && /d\s*\/\s*dx|f\s*'|y\s*'|dy\s*\/\s*dx/.test(t)) {
      score += 4
      signals.push('differential notation')
    }
    if (rule.discipline === 'integral' && /∫|\\int|integral/.test(t)) {
      score += 4
      signals.push('integral sign')
    }
    if (rule.discipline === 'multivariable' && /λ|lambda|∇|partial/.test(t)) {
      score += 3.5
      signals.push('∇/λ notation')
    }
    if (rule.discipline === 'linear') {
      const hasEquation = /[xyz][^=]{0,14}=[^=]{0,14}[xyz0-9]/i.test(t)
      const vars = new Set(t.match(/[xyz]/g) || [])
      if (hasEquation && vars.size >= 2) score += 4.2
    }
    if (rule.discipline === 'probability' && /n\s*\(|σ|sigma|μ/.test(t)) {
      score += 1.2
    }
    if (rule.discipline === 'geometry' && /°|degrees?|triangle/.test(t)) {
      score += 1.2
    }
    if (score > best.score) best = { score, rule, signals }
  }

  // Exact expression fingerprint against a fully authored worked problem
  const key = mathKey(text)
  const finger = FINGERPRINTS.find((f) => f.test(key))
  const fingerProblem = finger ? PROBLEMS.find((p) => p.id === finger.id) : null

  // Otherwise a keyword overlap of two or more
  const knownMatch =
    fingerProblem ||
    PROBLEMS.find((p) => {
      const kws = p.keywords.filter((k) => norm(k).length > 3)
      const hits = kws.filter((k) => t.includes(norm(k)))
      return hits.length >= 2
    })

  if (best.score < 1.2) {
    return {
      discipline: 'calculus',
      disciplineMeta: DISCIPLINES.calculus,
      confidence: 48,
      problemId: 'derivative-power',
      signals: ['no strong keyword match'],
      reason: 'No decisive keyword — defaulting to the calculus reasoning engine.',
      generic: true,
    }
  }

  const rawConf = 70 + Math.min(26, best.score * 3.6)
  const meta = DISCIPLINES[best.rule.discipline]
  const expr = extractExpression(text)
  return {
    discipline: best.rule.discipline,
    disciplineMeta: meta,
    confidence: Math.round(fingerProblem ? 97 : Math.min(93, rawConf + (expr ? 4 : 0))),
    problemId: knownMatch ? knownMatch.id : best.rule.base,
    matchedProblem: knownMatch || null,
    fingerprint: Boolean(fingerProblem),
    expression: expr,
    signals: [...new Set(best.signals)].slice(0, 4),
    reason: `Matched ${[...new Set(best.signals)].slice(0, 2).join(', ') || 'structural notation'}${
      expr ? ` · expression “${expr.slice(0, 34)}”` : ''
    }.`,
    generic: !knownMatch,
  }
}

/* ------------------------------------------------------------------ */
/* Generic teaching skeletons for prompts outside the worked library  */
/* ------------------------------------------------------------------ */
const SKELETONS = {
  calculus: {
    formula: (expr) => `d/dx [ ${expr} ]`,
    steps: (expr) => [
      {
        eyebrow: 'Step 1 · Decompose',
        title: 'Identify the structure of the expression',
        formula: expr,
        narration:
          'Begin by inspecting the structure of your expression before touching any rule. Are the pieces added, multiplied, nested inside one another, or divided? Addition lets you differentiate term by term using linearity. Products need the product rule, quotients the quotient rule, and compositions the chain rule. Naming the structure first tells you which machinery to load.',
        insight:
          'Run the checklist: sum, product, quotient, composition. The structure dictates the rule set.',
        analogy:
          'Before cooking, look at the ingredients to decide which pan and technique you need — not the other way round.',
        hint: 'Split the expression at its outermost operation.',
      },
      {
        eyebrow: 'Step 2 · Rules',
        title: 'Apply the power rule to each polynomial term',
        formula: 'd/dx [a·xⁿ] = a·n·xⁿ⁻¹',
        narration:
          'For each power term, multiply by the exponent, then reduce the exponent by one. Constant multipliers stay out front, and standalone constants vanish entirely because they do not change. If a variable sits in a denominator or under a root, rewrite it with a negative or fractional exponent so the same rule still applies.',
        insight:
          'Rewrite roots and reciprocals as powers first: 1/x = x⁻¹, √x = x^(1/2). Then the power rule never fails.',
        analogy:
          'Every term pays a tax equal to its own exponent, and the exponent then steps down one level.',
        hint: 'Bring the exponent down as a multiplier, then subtract one from it.',
      },
      {
        eyebrow: 'Step 3 · Combine',
        title: 'Simplify the differentiated expression',
        formula: "f'(x) = …",
        narration:
          'Collect like terms and tidy the algebra. Differentiation lowers polynomial degree by one, so expect a simpler expression than you started with. Check for any surviving constant term — if you have one, you have made an error. The cleaned-up expression is the derivative function, ready to be evaluated.',
        insight:
          'A differentiated polynomial cannot contain a pure constant unless a rule was misapplied.',
        analogy:
          'Tidying your desk after the work: same information, far easier to use under pressure.',
        hint: 'Combine like terms; hunt for stray constants.',
      },
      {
        eyebrow: 'Step 4 · Evaluate',
        title: 'Substitute the point and interpret',
        formula: "f'(a) = slope at x = a",
        narration:
          'If a point is given, substitute it into the derivative only after differentiating. That number is the instantaneous rate of change, the slope of the tangent line. State its units explicitly: output units per input unit. A positive value means increasing, negative means decreasing, zero means a horizontal tangent and a possible turning point.',
        insight:
          'Differentiate first, substitute second. The value is a tangent slope, not a function value.',
        analogy:
          'The speedometer reading at one instant, not the total distance travelled.',
        hint: 'Evaluate f′, never f, when a slope is requested.',
      },
    ],
    answer: (expr) => `d/dx [ ${expr} ] — simplified and interpreted`,
    diagram: 'tangent',
    diagramCaption: 'A representative curve shows how the tangent slope tracks the derivative.',
    summary: {
      theorem: 'Linearity & the Power Rule',
      formula: '(u + v)′ = u′ + v′ · d/dx[xⁿ] = n·xⁿ⁻¹',
      takeaways: [
        'Classify the structure before choosing a rule.',
        'Power rule: exponent becomes a multiplier, then drops by one.',
        'Simplify, then evaluate at the requested point.',
        'Interpret the result as an instantaneous rate with units.',
      ],
    },
  },
  integral: {
    formula: (expr) => `∫ ${expr} dx`,
    steps: (expr) => [
      {
        eyebrow: 'Step 1 · Interpret',
        title: 'Read the integral as accumulated area',
        formula: `∫ ${expr} dx`,
        narration:
          'Picture your expression as the height of infinitely thin vertical strips. The integral adds every strip’s area, so the answer carries square units. Identify the limits if any are given; they define the left and right walls of the region. Sketch the curve first — the picture prevents sign and complement mistakes later.',
        insight: 'An integral is a limit of Riemann sums, not merely an “opposite derivative”.',
        analogy: 'A stack of infinitely thin floor tiles, each contributing height times width.',
        hint: 'Sketch the region and shade it before integrating.',
      },
      {
        eyebrow: 'Step 2 · Antidifferentiate',
        title: 'Reverse the power rule term by term',
        formula: '∫ a·xⁿ dx = a·xⁿ⁺¹/(n+1) + C',
        narration:
          'Reverse each term independently. Raise the exponent by one, then divide by the new exponent. Undo any constant multiplier by keeping it out front. Constants integrate to a constant times x, since the derivative of that product is the constant. Add one constant of integration at the very end, not one per term.',
        insight: 'Degrees rise when you integrate. One C per integral, not per term.',
        analogy: 'Rebuilding the odometer from a series of speed snapshots.',
        hint: 'Raise the power and divide by the new power; verify by differentiating back.',
      },
      {
        eyebrow: 'Step 3 · Evaluate',
        title: 'Apply the Fundamental Theorem of Calculus',
        formula: '[F(x)]ₐᵇ = F(b) − F(a)',
        narration:
          'Take your antiderivative and evaluate it at the upper limit minus the lower limit. The constant of integration cancels, so it is irrelevant for definite integrals. Watch the signs on the lower limit, especially when it is negative. A sensible magnitude check comes next.',
        insight: 'Bounds convert a family of antiderivatives into one exact number.',
        analogy: 'Reading the odometer at two moments and subtracting.',
        hint: 'Top minus bottom, with parentheses around negative limits.',
      },
      {
        eyebrow: 'Step 4 · Verify',
        title: 'Check the sign and magnitude',
        formula: 'area ≈ base × average height',
        narration:
          'A positive answer corresponds to net area above the axis, a negative answer to area below. Estimate with a triangle or rectangle to catch arithmetic slips: the exact value should sit between sensible bounds. If you were asked for total geometric area, split the interval wherever the curve crosses the axis and add absolute values.',
        insight: 'Signed area versus geometric area: the wording decides which you report.',
        analogy: 'Eyeballing the bill before the receipt arrives.',
        hint: 'If your answer is wildly outside your sketch’s estimate, recheck the antiderivative.',
      },
    ],
    answer: (expr) => `Antiderivative of ${expr}, then evaluated at the bounds`,
    diagram: 'area',
    diagramCaption: 'Shaded accumulation with Riemann rectangles converging to the exact area.',
    summary: {
      theorem: 'Fundamental Theorem of Calculus',
      formula: '∫ₐᵇ f = F(b) − F(a),  F′ = f',
      takeaways: [
        'Integrals accumulate; sketch before computing.',
        'Raise the exponent, divide by the new exponent, add one C.',
        'For definite integrals, evaluate F(top) − F(bottom).',
        'Check sign and magnitude against a rough shape.',
      ],
    },
  },
  multivariable: {
    formula: (expr) => `optimise ${expr} subject to a constraint`,
    steps: (expr) => [
      {
        eyebrow: 'Step 1 · Frame',
        title: 'Separate the objective from the constraint',
        formula: 'f(x, y) — objective,  g(x, y) = 0 — constraint',
        narration:
          'Name the function you want to optimise and the fence you must stay on. Rewrite the constraint in zero form, g equals zero, because the multiplier method requires it. Think of the objective as altitude and the constraint as a trail across the surface; you can only walk the trail.',
        insight: 'Every constrained problem has exactly one objective and one feasible set.',
        analogy: 'Altitude on a hillside, constrained to a fenced walking path.',
        hint: 'Move every term of the constraint to one side.',
      },
      {
        eyebrow: 'Step 2 · Lagrangian',
        title: 'Form the Lagrangian with a multiplier',
        formula: 'ℒ = f + λg',
        narration:
          'Add lambda times the constraint to the objective. Lambda is a shadow price: it reports how much the optimum would improve if the constraint were relaxed by one unit. Stationary points of this new function automatically respect the constraint, which converts a constrained problem into an unconstrained one.',
        insight: 'The multiplier is not decoration — it encodes the constraint’s price.',
        analogy: 'A toll per unit of extra trail width, priced by λ.',
        hint: 'Use exactly one λ, paired with g in zero form.',
      },
      {
        eyebrow: 'Step 3 · Stationarity',
        title: 'Set all partial derivatives to zero',
        formula: '∂ℒ/∂x = ∂ℒ/∂y = ∂ℒ/∂λ = 0',
        narration:
          'Differentiate with respect to each variable and each constraint coordinate, then set everything to zero. The derivative with respect to lambda recovers the original constraint as a safety net. The other equations say the gradients of objective and constraint are parallel — the geometric heart of the method.',
        insight: '∇f = λ∇g plus feasibility: three equations for x, y, λ.',
        analogy: 'Forces balancing at the highest point of the trail.',
        hint: 'Do not forget the λ-equation; it is the constraint itself.',
      },
      {
        eyebrow: 'Step 4 · Solve & interpret',
        title: 'Eliminate λ, then compare candidates',
        formula: '∇f = λ∇g,  g = 0',
        narration:
          'Eliminate lambda to get a relation between the variables, substitute into the constraint, and list every candidate. Compare interior stationary points against boundary values, since a maximum may sit on the edge of the feasible set. Finally report the optimal point, the optimal value, and the sign and size of lambda.',
        insight: 'Interior candidates plus boundary checks. Then quote the optimum value, not just the point.',
        analogy: 'Finding the peak of the trail and checking both gates at its ends.',
        hint: 'Report (x, y), f(x, y) and λ together.',
      },
    ],
    answer: (expr) => `Optimal point and value for ${expr}`,
    diagram: 'contour',
    diagramCaption: 'Level curves meet the constraint where the gradients align.',
    summary: {
      theorem: 'Lagrange Multiplier Theorem',
      formula: '∇f = λ∇g and g = 0',
      takeaways: [
        'Objective and constraint must be kept separate.',
        'The Lagrangian converts constraints into extra variables.',
        'Parallel gradients encode tangency of level sets.',
        'Compare boundaries; interpret λ as a shadow price.',
      ],
    },
  },
  linear: {
    formula: (expr) => expr,
    steps: (expr) => [
      {
        eyebrow: 'Step 1 · Geometry',
        title: 'Read each equation as a line or plane',
        formula: expr,
        narration:
          'Each linear equation describes a flat object: a line in two dimensions, a plane in three. Solving the system means finding the point or set of points lying on all of them at once. Compare the slopes or normals first — different directions guarantee a unique intersection.',
        insight: 'Unique solution ⇔ full rank ⇔ non-zero determinant.',
        analogy: 'Two roads crossing at a single junction.',
        hint: 'Rewrite in slope-intercept form to compare slopes.',
      },
      {
        eyebrow: 'Step 2 · Eliminate',
        title: 'Scale equations so a variable cancels',
        formula: 'R₂ ← R₂ − k·R₁',
        narration:
          'Choose a variable and multiply one equation until its coefficient matches the other. Subtracting the rows then removes that variable, reducing the system by one dimension. Distribute the minus sign across the whole equation — this is where most marks are lost.',
        insight: 'Elementary row operations preserve the solution set.',
        analogy: 'Aligning two rulers so the same mark appears on both.',
        hint: 'Match coefficients first; subtract second.',
      },
      {
        eyebrow: 'Step 3 · Solve',
        title: 'Back-substitute to recover every variable',
        formula: 'x = …, y = …',
        narration:
          'With one variable known, substitute into the simplest original equation and solve for the next. Work upward until all variables are determined. If elimination produced a contradiction, the system is inconsistent; if it produced an identity, there are infinitely many solutions and you should describe them with a parameter.',
        insight: 'Contradiction → no solution. Identity → infinitely many. Otherwise unique.',
        analogy: 'Once one coordinate of the junction is known, the other follows.',
        hint: 'Use the simplest equation for the cleanest arithmetic.',
      },
      {
        eyebrow: 'Step 4 · Verify',
        title: 'Check every equation and describe the solution set',
        formula: 'Ax = b satisfies all rows',
        narration:
          'Substitute your solution into each original equation. Every row must hold, not just the one you back-substituted into. Then state the geometry: a single intersection point, parallel lines with no meeting, or coincident lines with infinitely many shared points.',
        insight: 'A candidate is a solution only if it satisfies all equations simultaneously.',
        analogy: 'Confirm the junction lies on both roads.',
        hint: 'Verify in all rows and name the geometric case.',
      },
    ],
    answer: (expr) => `Solution set of ${expr}`,
    diagram: 'linear',
    diagramCaption: 'The plotted constraints intersect at the solution point.',
    summary: {
      theorem: 'Invertible Matrix Theorem',
      formula: 'Ax = b unique ⇔ det A ≠ 0',
      takeaways: [
        'Each equation is a hyperplane; the solution is their intersection.',
        'Row operations preserve solutions.',
        'Back-substitute and verify in every original equation.',
        'Report the geometric case: unique, none, or infinite.',
      ],
    },
  },
  probability: {
    formula: (expr) => `P( ${expr} )`,
    steps: (expr) => [
      {
        eyebrow: 'Step 1 · Frame',
        title: 'Define the random variable and the event',
        formula: `P( ${expr} )`,
        narration:
          'Write down exactly what the random variable measures and which event you want. Shade the event on the distribution. Being explicit about strict versus non-strict inequalities avoids later confusion, especially with continuous variables where endpoints carry no probability.',
        insight: 'Name the variable, its distribution and the event before computing.',
        analogy: 'Marking the target population on a stadium height chart.',
        hint: 'Sketch the distribution and shade the requested region.',
      },
      {
        eyebrow: 'Step 2 · Standardise',
        title: 'Convert to a standard score or canonical form',
        formula: 'z = (x − μ)/σ',
        narration:
          'Subtract the mean to recentre and divide by the standard deviation to rescale. The result counts how many typical spreads the value sits from average. For other distributions, use the appropriate canonical form: hypergeometric for sampling without replacement, binomial for fixed-trial success counts, Poisson for rare events.',
        insight: 'Standardisation is unit-free, so different scales become comparable.',
        analogy: 'Converting prices to one currency before comparing.',
        hint: 'Use σ, not σ². Sign matters: above the mean is positive.',
      },
      {
        eyebrow: 'Step 3 · Compute',
        title: 'Use the appropriate tail or counting formula',
        formula: 'P = 1 − Φ(z)  ·  or combinatorial counting',
        narration:
          'Tables and software usually return left tails, so a right tail needs one minus that value. For sampling problems, count favourable outcomes and divide by total outcomes, or use the hypergeometric formula directly. Keep the sample space consistent: if order matters in the numerator, it must matter in the denominator too.',
        insight: 'Right tail = 1 − left tail. Count and total must use the same sample space.',
        analogy: 'If thirty percent are shorter than you, seventy percent are taller.',
        hint: 'Decide whether “at least one” is easier via the complement.',
      },
      {
        eyebrow: 'Step 4 · Verify',
        title: 'Sanity-check with bounds and interpretations',
        formula: '0 ≤ P ≤ 1,  empirical rule check',
        narration:
          'Every probability lies between zero and one, and your answer should look plausible on the shaded sketch. Use the empirical rule, or complement checks, to catch factor-of-two and complement errors. Finish by interpreting the number in the language of the original problem — a probability, a percentage, and a plain-English sentence.',
        insight: 'Interpretation is part of the answer: percentage plus meaning.',
        analogy: 'A rough estimate before the exact receipt.',
        hint: 'Convert to a percentage and state the event in words.',
      },
    ],
    answer: (expr) => `Probability of ${expr}`,
    diagram: 'bell',
    diagramCaption: 'The shaded area is the probability of the requested event.',
    summary: {
      theorem: 'Normalisation & Standardisation',
      formula: 'Z = (X − μ)/σ,  P(X > x₀) = 1 − Φ(z₀)',
      takeaways: [
        'Define the variable, distribution and event explicitly.',
        'Standardise with σ, not variance.',
        'Right tails require the complement.',
        'Verify with bounds and interpret in plain language.',
      ],
    },
  },
  geometry: {
    formula: (expr) => expr,
    steps: (expr) => [
      {
        eyebrow: 'Step 1 · Identify',
        title: 'Extract the given relationships',
        formula: expr,
        narration:
          'List what is given and what must be found. Translate ratios into a scale factor, lengths into equations, and angle relationships into sums or equalities. A labelled sketch is not optional: it reveals which theorem applies and catches impossible configurations early.',
        insight: 'Given facts plus a labelled diagram narrow the theorem to one or two candidates.',
        analogy: 'Surveying a plot before measuring anything.',
        hint: 'Introduce a scale factor for every ratio.',
      },
      {
        eyebrow: 'Step 2 · Theorems',
        title: 'Invoke the governing theorem',
        formula: 'angle sum · similarity · Pythagoras',
        narration:
          'Choose the theorem that links your givens. Triangles contribute an angle sum of one hundred eighty degrees; similar triangles grant proportional sides; right triangles bring Pythagoras. State the theorem by name as you use it — examiners award method marks for named theorems.',
        insight: 'Name the theorem when you apply it; it secures method marks.',
        analogy: 'Using the right tool from a labelled toolbox.',
        hint: 'Angle sum for angles, similarity for proportions, Pythagoras for right triangles.',
      },
      {
        eyebrow: 'Step 3 · Solve',
        title: 'Form and solve the equation',
        formula: 'sum of parts = total',
        narration:
          'Combine the relationships into one equation, substitute, and solve. Keep track of units and degrees throughout. If the result violates a geometric constraint — an angle exceeding one hundred eighty degrees, or a negative length — revisit the equation rather than forcing the answer.',
        insight: 'Solutions must be geometrically feasible; discard impossible roots.',
        analogy: 'Cutting the slices until they exactly fill the pie.',
        hint: 'Check each computed value against the geometry.',
      },
      {
        eyebrow: 'Step 4 · Classify',
        title: 'Verify and classify the figure',
        formula: 'acute / right / obtuse · scalene / isosceles',
        narration:
          'Substitute back and confirm the totals. Then classify the figure: all angles acute, one right, or one obtuse; sides all different, two equal, or all equal. Classification often carries its own mark, and it demonstrates that you understand the result rather than merely computed it.',
        insight: 'Verification plus classification is the complete answer.',
        analogy: 'Labelling the finished dish, not just cooking it.',
        hint: 'State the classification explicitly with reasons.',
      },
    ],
    answer: (expr) => `Complete geometric description for ${expr}`,
    diagram: 'triangle',
    diagramCaption: 'An angle-accurate triangle shows the proportion between the angles.',
    summary: {
      theorem: 'Triangle Angle Sum & Similarity',
      formula: 'A + B + C = 180°,  sides scale proportionally',
      takeaways: [
        'Translate ratios using a scale factor.',
        'Name the theorem you apply.',
        'Reject geometrically impossible values.',
        'Verify totals and classify explicitly.',
      ],
    },
  },
}

export function buildSession(prompt) {
  const text = (prompt || '').trim()
  const cls = classifyTopic(text)
  const base = PROBLEMS.find((p) => p.id === cls.problemId) || PROBLEMS[0]
  const meta = DISCIPLINES[cls.discipline] || DISCIPLINES.calculus

  // Direct hit on a fully authored problem (exact expression fingerprint)
  if (cls.matchedProblem && cls.fingerprint) {
    return {
      ...cls.matchedProblem,
      disciplineMeta: meta,
      detected: cls,
      userPrompt: text,
      confidence: cls.fingerprint ? 97 : Math.max(88, cls.confidence),
      generated: false,
    }
  }

  const shape = shapeProblem(text, cls.discipline)
  let primary = shape.primary
  const noExpression = !primary
  if (noExpression) primary = base.formula

  // Definite-integral bounds, when stated in words or in the ∫ notation
  let bounds = null
  if (cls.discipline === 'integral' && !noExpression) {
    const bm =
      text.match(/from\s*(-?\d+(?:\.\d+)?)\s*to\s*(-?\d+(?:\.\d+)?)/i) ||
      text.match(/∫\s*_?\{?\s*(-?\d+(?:\.\d+)?)\s*\}?\s*\^?\{?\s*(-?\d+(?:\.\d+)?)\s*\}?/) ||
      text.match(/∫\s*[₀₁₂₃₄₅₆₇₈₉]+\s*[⁰¹²³⁴⁵⁶⁷⁸⁹]+/)
    if (bm && bm[1] !== undefined) bounds = [Number(bm[1]), Number(bm[2])]
    else if (bm && text.match(/∫\s*([₀₁₂₃₄₅₆₇₈₉])\s*([⁰¹²³⁴⁵⁶⁷⁸⁹])/)) {
      const subs = { '₀': 0, '₁': 1, '₂': 2, '₃': 3, '₄': 4, '₅': 5, '₆': 6, '₇': 7, '₈': 8, '₉': 9 }
      const sups = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 }
      const mm = text.match(/∫\s*([₀₁₂₃₄₅₆₇₈₉])\s*([⁰¹²³⁴⁵⁶⁷⁸⁹])/)
      bounds = [subs[mm[1]], sups[mm[2]]]
    }
  }

  // A discipline-level question with no extractable expression → concept walkthrough
  if (noExpression) {
    return {
      ...base,
      disciplineMeta: meta,
      detected: cls,
      userPrompt: text,
      prompt: text || base.prompt,
      title: `${meta.short}: guided concept walkthrough`,
      confidence: Math.max(74, cls.confidence),
      generated: true,
      conceptLesson: true,
    }
  }

  const skel = SKELETONS[cls.discipline] || SKELETONS.calculus
  const expr = primary.length > 64 ? `${primary.slice(0, 61).trimEnd()}…` : primary
  const shortExpr = primary.length > 44 ? `${primary.slice(0, 41).trimEnd()}…` : primary

  const verb =
    cls.discipline === 'calculus'
      ? 'Differentiate'
      : cls.discipline === 'integral'
        ? 'Evaluate'
        : cls.discipline === 'multivariable'
          ? 'Optimise'
          : cls.discipline === 'linear'
            ? 'Solve'
            : cls.discipline === 'probability'
              ? 'Compute probability'
              : 'Reason geometrically about'

  const steps = skel.steps(expr).map((s, i) => ({
    ...s,
    id: `gen-${i}`,
    accent: ['violet', 'violet', 'emerald', 'cyan'][i] || 'violet',
    insight: s.insight || 'Connect the rule you used to the structure you identified in step one.',
    hint: s.hint || 'Slow down and name the rule before applying it.',
  }))

  // Make calculus explanations concrete when the polynomial is parseable
  const derived = cls.discipline === 'calculus' ? derivativeOf(primary) : null
  const anti = cls.discipline === 'integral' ? antiderivativeOf(primary) : null
  if (derived) {
    steps[0].formula = `d/dx [ ${expr} ]`
    if (steps[2]) steps[2].formula = `f'(x) = ${derived}`
    if (steps[3]) steps[3].formula = `f'(a) = ${derived.replace(/x/g, 'a')}`
  }
  if (anti && steps[1]) {
    steps[1].formula = `∫ ${expr} dx = ${anti} + C`
    if (steps[2]) steps[2].formula = `[ ${anti} ] from a to b`
  }

  const polyTerms = parsePolynomial(primary)
  let definiteValue = null
  if (bounds && polyTerms) {
    definiteValue = evalAntiderivativeAt(polyTerms, bounds[1]) - evalAntiderivativeAt(polyTerms, bounds[0])
  }

  const left = bounds ? boundsNotation(bounds) : '∫'
  const formula =
    cls.discipline === 'integral'
      ? bounds
        ? `${left} ${pretty(expr)} dx`
        : `∫ ${pretty(expr)} dx`
      : pretty(shape.formula || skel.formula(expr))

  const linearSolution = cls.discipline === 'linear' ? solveLinearSystem(text) : null
  const answer =
    linearSolution
      ? `x = ${fmtNum(linearSolution.x)},  y = ${fmtNum(linearSolution.y)}`
      : derived
      ? `f′(x) = ${derived}`
      : anti
        ? bounds && definiteValue !== null
          ? `${left} ${pretty(expr)} dx = ${fmtNum(definiteValue)}`
          : `∫ ${pretty(expr)} dx = ${anti} + C`
        : skel.answer(expr)

  const answerNote = linearSolution
    ? `Solved by elimination with determinant ${pretty(fmtNum(linearSolution.det))} ≠ 0, so the intersection is unique.`
    : derived
    ? 'Derivative computed term by term with the power rule — narrate the process, not just the result.'
    : anti
      ? bounds && definiteValue !== null
        ? 'Evaluated with the fundamental theorem: F(b) − F(a). The constant of integration cancels.'
        : 'Antiderivative computed by reversing the power rule. Add one constant of integration.'
      : `Reasoned with the ${meta.name.toLowerCase()} engine. Authored exemplars below share this discipline.`

  const prettyPrompt = pretty(text)
  const prettyShort = pretty(shortExpr.length > 48 ? `${shortExpr.slice(0, 45)}…` : shortExpr)
  const title =
    cls.discipline === 'linear'
      ? prettyPrompt.length > 72
        ? `${prettyPrompt.slice(0, 69).trimEnd()}…`
        : prettyPrompt
      : cls.discipline === 'integral' && bounds
        ? `Evaluate ${left} ${prettyShort} dx`
        : `${verb} ${prettyShort}`

  const diagramTitle =
    cls.discipline === 'integral'
      ? bounds
        ? `Accumulated area under ${pretty(expr)} on [${fmtNum(bounds[0])}, ${fmtNum(bounds[1])}]`
        : `Accumulated area under ${pretty(expr)}`
      : cls.discipline === 'calculus'
        ? `Tangent slope along f(x) = ${pretty(expr)}`
        : base.diagram.title
  const diagramFormula =
    cls.discipline === 'integral'
      ? bounds && definiteValue !== null
        ? `${left} ${pretty(expr)} dx = ${fmtNum(definiteValue)}`
        : anti
          ? `∫ ${pretty(expr)} dx = ${anti} + C`
          : base.diagram.formula
      : derived
        ? `f'(x) = ${derived}`
        : base.diagram.formula

  return {
    ...base,
    id: `generated-${base.id}`,
    title,
    prompt: text,
    formula,
    answer,
    answerNote,
    discipline: cls.discipline,
    disciplineMeta: meta,
    confidence: cls.confidence,
    steps,
    diagram: {
      ...base.diagram,
      kind: skel.diagram,
      caption: skel.diagramCaption,
      title: diagramTitle,
      formula: diagramFormula,
      fn: primary,
      bounds: bounds || null,
    },
    summary: {
      ...base.summary,
      ...skel.summary,
      terms: base.summary.terms,
    },
    detected: cls,
    userPrompt: text,
    generated: true,
    minutes: Math.max(3, steps.length),
  }
}

export function seededSession() {
  return buildSession(PROBLEMS[0].prompt)
}
