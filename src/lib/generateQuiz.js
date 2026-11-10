/* Adaptive quiz generation — numeric variants of the current skill. */

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function mcq({ question, correct, distractors, explain, trap, skill, suffix = '' }) {
  const unique = []
  for (const d of distractors) {
    const label = `${d}${suffix}`
    if (label !== `${correct}${suffix}` && !unique.includes(label)) unique.push(label)
  }
  while (unique.length < 3) unique.push(`${Number(correct) + unique.length + 1}${suffix}`)
  const options = shuffle([`${correct}${suffix}`, ...unique.slice(0, 3)])
  return {
    id: `gen-${Math.random().toString(36).slice(2, 9)}`,
    question,
    options,
    correct: options.indexOf(`${correct}${suffix}`),
    explain,
    trap,
    skill,
    generated: true,
  }
}

const GENERATORS = {
  calculus: () => {
    const a = rand(2, 6)
    const b = rand(1, 9)
    return mcq({
      question: `Differentiate f(x) = ${a}x² + ${b}x.`,
      correct: `${2 * a}x + ${b}`,
      distractors: [`${a}x + ${b}`, `${2 * a}x`, `${a}x² + ${b}`, `${2 * a}x − ${b}`],
      explain: `Power rule term by term: d/dx[${a}x²] = ${2 * a}x and d/dx[${b}x] = ${b}.`,
      trap: 'Lowering the exponent without multiplying by the original coefficient.',
      skill: 'Power rule',
    })
  },
  integral: () => {
    const a = rand(1, 4)
    const b = rand(1, 5)
    const k = rand(2, 4)
    const value = a * k * k + b * k
    return mcq({
      question: `Evaluate ∫₀^${k} (2·${a}x + ${b}) dx.`,
      correct: value,
      distractors: [a * k * k + b * k, value + k, a * k + b, value - b],
      explain: `Antiderivative ${a}x² + ${b}x, evaluated from 0 to ${k}, gives ${a}·${k}² + ${b}·${k} = ${value}.`,
      trap: 'Forgetting to multiply by the upper bound, or omitting the + b term.',
      skill: 'Definite integrals',
    })
  },
  linear: () => {
    const x = rand(1, 5)
    const y = rand(1, 5)
    const a = rand(2, 4)
    const b = rand(1, 3)
    const c = a * x + b * y
    const s = x + y
    return mcq({
      question: `Solve the system ${a}x + ${b}y = ${c} and x + y = ${s}. What is x?`,
      correct: x,
      distractors: [y, s, x + 1],
      explain: `Elimination or substitution yields x = ${x} and y = ${y}; verify ${a}(${x}) + ${b}(${y}) = ${c}.`,
      trap: 'Reporting y instead of x, or stopping after finding the sum.',
      skill: 'Linear systems',
    })
  },
  probability: () => {
    const mu = pick([400, 500, 600, 700])
    const sigma = pick([50, 80, 100])
    const z = pick([0.5, 1, 1.5, 2])
    const x0 = mu + z * sigma
    return mcq({
      question: `For X ~ N(${mu}, ${sigma}²), what is the z-score of x = ${x0}?`,
      correct: z.toFixed(1),
      distractors: [(z + 0.5).toFixed(1), (z - 0.5).toFixed(1), sigma.toString(), (x0 - mu).toString()],
      explain: `z = (${x0} − ${mu})/${sigma} = ${z}.`,
      trap: 'Dividing by the variance σ² instead of the standard deviation σ.',
      skill: 'Standardisation',
    })
  },
  geometry: () => {
    const [p, q, r] = pick([
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
      [1, 1, 2],
      [2, 3, 5],
      [1, 2, 6],
    ])
    const k = 180 / (p + q + r)
    const largest = Math.round(r * k)
    return mcq({
      question: `A triangle has angles in the ratio ${p} : ${q} : ${r}. What is the largest angle?`,
      correct: largest,
      distractors: [r, Math.round(p * k), Math.round(q * k), largest + k * 2].map((n) => Math.round(n)),
      explain: `Total parts ${p + q + r}, one part ${k}°, so the largest is ${r} × ${k} = ${largest}°.`,
      trap: 'Treating the ratio number itself as an angle.',
      skill: 'Angle ratios',
      suffix: '°',
    })
  },
  multivariable: () => {
    const c = rand(4, 9)
    const x = Math.round((2 * c) / 3)
    const y = c - x
    return mcq({
      question: `For f(x, y) = x²y with constraint x + y = ${c}, eliminating λ gives x = 2y. What is the optimum point?`,
      correct: `${x}, ${y}`,
      distractors: [`${y}, ${x}`, `${c}, 0`, `${x + 1}, ${y - 1}`],
      explain: `x = 2y and x + y = ${c} give y = ${y}, x = ${x}.`,
      trap: 'Swapping x and y, or ignoring the constraint after eliminating λ.',
      skill: 'Lagrange multipliers',
    })
  },
}

export function generateAdaptiveQuiz(session, count = 4) {
  const gen = GENERATORS[session.discipline] || GENERATORS.calculus
  const generated = Array.from({ length: Math.min(3, count) }, () => gen())

  const base = shuffle(session.quiz || []).slice(0, Math.max(1, count - generated.length))
  return shuffle([...generated, ...base])
}
