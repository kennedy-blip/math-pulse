export const DISCIPLINES = {
  calculus: {
    name: 'Single-Variable Calculus',
    short: 'Calculus I',
    accent: 'violet',
    icon: 'Activity',
    blurb: 'Rates of change, accumulation and the geometry of curves.',
  },
  multivariable: {
    name: 'Multivariable Calculus',
    short: 'Calc III',
    accent: 'cyan',
    icon: 'Boxes',
    blurb: 'Gradients, constraints and optimisation on surfaces.',
  },
  linear: {
    name: 'Linear Algebra',
    short: 'Linear Algebra',
    accent: 'emerald',
    icon: 'Grid3x3',
    blurb: 'Vectors, matrices and systems of simultaneous constraints.',
  },
  probability: {
    name: 'Probability & Statistics',
    short: 'Probability',
    accent: 'amber',
    icon: 'Dices',
    blurb: 'Chance, distributions and the mathematics of uncertainty.',
  },
  geometry: {
    name: 'Euclidean Geometry',
    short: 'Geometry',
    accent: 'cyan',
    icon: 'Triangle',
    blurb: 'Angles, congruence and the logic of shapes.',
  },
  integral: {
    name: 'Integral Calculus',
    short: 'Calculus II',
    accent: 'violet',
    icon: 'AreaChart',
    blurb: 'Accumulation, areas and the fundamental theorem.',
  },
}

export const PROBLEMS = [
  /* ------------------------------------------------------------------ */
  {
    id: 'derivative-power',
    discipline: 'calculus',
    difficulty: 'Core',
    minutes: 4,
    confidence: 97,
    title: 'Differentiate f(x) = 3x² + 2x',
    prompt:
      'Find the derivative of f(x) = 3x² + 2x and explain what the derivative means at x = 1.',
    formula: 'f(x) = 3x² + 2x',
    answer: "f'(x) = 6x + 2  ·  f'(1) = 8",
    answerNote:
      'At x = 1 the curve is climbing at 8 units of output per unit of input.',
    tags: ['Power Rule', 'Instantaneous Rate', 'Tangent Line'],
    keywords: ['derivative', 'differentiate', 'd/dx', 'slope', 'tangent', 'rate of change', 'power rule'],
    analogy: {
      title: 'Your car’s speedometer',
      icon: 'Car',
      body:
        'A position graph tells you where the car is. Its derivative tells you the speedometer reading at that exact instant — not the average speed for the whole trip, but how fast you are moving right now.',
    },
    steps: [
      {
        id: 'd1',
        title: 'Identify the structure of the function',
        eyebrow: 'Step 1 · Decompose',
        formula: 'f(x) = 3x² + 2x',
        narration:
          'First, look at the shape of the function. We have two terms added together, a quadratic piece and a linear piece. Because the derivative is linear, we can differentiate each term on its own and simply add the results. This is the sum rule. No product rule, no quotient rule, no chain rule needed here.',
        insight:
          'The sum rule says (u + v)′ = u′ + v′. Splitting a function into atomic terms is the single most reliable first move in calculus.',
        analogy:
          'Like reading a shopping list: total price is the sum of each item, so the rate of change of the total is the sum of each item’s rate of change.',
        hint: 'Is anything multiplied, nested, or divided? If not, differentiate term by term.',
        accent: 'violet',
      },
      {
        id: 'd2',
        title: 'Apply the power rule to 3x²',
        eyebrow: 'Step 2 · Power Rule',
        formula: "d/dx [3x²] = 3 · 2x^(2−1) = 6x",
        narration:
          'Now the power rule. For any term a times x to the n, the derivative is a times n, times x to the n minus one. Here a is three and n is two. Bring the exponent two down in front to multiply with three, giving six, then lower the exponent to one. So three x squared becomes six x. Think of it as the term paying a tax equal to its exponent.',
        insight:
          'The exponent becomes a multiplier, then decreases by one. Constant multipliers simply ride along unchanged.',
        analogy:
          'If a square’s side grows, its area grows at a rate proportional to its perimeter — the exponent 2 becomes the multiplier 2.',
        hint: 'Write the exponent in front, then subtract one from the exponent.',
        accent: 'violet',
      },
      {
        id: 'd3',
        title: 'Differentiate the linear term 2x',
        eyebrow: 'Step 3 · Linear Slope',
        formula: 'd/dx [2x] = 2 · 1x⁰ = 2',
        narration:
          'Next, the linear term, two x. A straight line has the same slope everywhere, so its derivative is just its coefficient, two. In power-rule language, two x to the first power differentiates to two times one, and x to the zero is one. Any constant on its own would differentiate to zero, which is exactly why constant offsets vanish in derivatives.',
        insight:
          'The derivative of mx is m: a straight line’s slope is constant. Pure constants have zero rate of change.',
        analogy:
          'A taxi meter that charges a fixed two dollars per kilometre climbs at a constant rate — the slope is the fare rate.',
        hint: 'The derivative of x is 1, so the derivative of 2x is 2.',
        accent: 'emerald',
      },
      {
        id: 'd4',
        title: 'Combine the terms',
        eyebrow: 'Step 4 · Assemble',
        formula: "f'(x) = 6x + 2",
        narration:
          'Adding the two pieces together gives the finished derivative: f prime of x equals six x plus two. Notice the degree dropped by one, from quadratic to linear, exactly as expected. This new function is the slope factory — feed it any x and it returns the steepness of the original curve at that point.',
        insight:
          'Differentiation lowers degree by one. A quadratic becomes a line, a line becomes a constant, a constant becomes zero.',
        analogy:
          'The speedometer function is one derivative simpler than the position function: a curved journey becomes a straight-line speed reading.',
        hint: 'Add the two differentiated pieces; never mix an x-term with a constant.',
        accent: 'emerald',
      },
      {
        id: 'd5',
        title: 'Interpret the value at x = 1',
        eyebrow: 'Step 5 · Meaning',
        formula: "f'(1) = 6(1) + 2 = 8",
        narration:
          'Finally, substitute x equals one: six times one plus two is eight. So at the instant x equals one, the function is increasing eight times as fast as x. Geometrically, the tangent line there has slope eight. This is the difference between average and instantaneous change — the derivative reads the speedometer at a single moment, not the trip average.',
        insight:
          "f′(a) is the slope of the tangent at x = a. Positive slope means locally increasing; the number 8 means 8 units of output per 1 unit of input.",
        analogy:
          'At the one-minute mark your speedometer reads eight — you are not necessarily eight kilometres away, you are travelling at eight per minute.',
        hint: 'Substitute after differentiating, never before.',
        accent: 'cyan',
        diagramNote: 'The tangent line at x = 1 is drawn on the graph.',
      },
    ],
    diagram: {
      kind: 'tangent',
      title: 'Tangent slope along f(x) = 3x² + 2x',
      caption:
        'Drag the point to watch the tangent slope change. At x = 1 the tangent has slope 8 — the derivative value.',
      formula: "f'(x) = 6x + 2",
    },
    summary: {
      theorem: 'The Power Rule (with linearity)',
      formula: 'd/dx [axⁿ] = a·n·xⁿ⁻¹  and  d/dx [u + v] = u′ + v′',
      takeaways: [
        'Differentiate sums term by term — linearity is your first simplification.',
        'Power rule: multiply by the exponent, then reduce the exponent by one.',
        'A derivative is a function, not a number; evaluate it at a point to get a slope.',
        "f′(1) = 8 means the curve rises 8 units per unit of x at that instant.",
      ],
      terms: [
        { term: 'Instantaneous rate', def: 'The limit of average rates over shrinking intervals — the tangent slope.' },
        { term: 'Tangent line', def: 'The straight line that best matches a curve locally, slope f′(a).' },
        { term: 'Linearity', def: 'Derivatives distribute over sums and constant multiples.' },
      ],
    },
    similar: [
      {
        title: 'Differentiate f(x) = 5x³ − 4x + 7',
        difficulty: 'Warm-up',
        prompt: 'Find f′(x) and evaluate f′(2).',
        hint: 'Power rule on each term; the constant 7 disappears.',
        answer: "f′(x) = 15x² − 4, so f′(2) = 56",
      },
      {
        title: 'Differentiate f(x) = (2x + 1)(x − 3)',
        difficulty: 'Core',
        prompt: 'Find the slope of the tangent at x = 0.',
        hint: 'Expand first, then differentiate term by term — or use the product rule to check.',
        answer: 'f(x) = 2x² − 5x − 3, so f′(x) = 4x − 5 and f′(0) = −5',
      },
      {
        title: 'Differentiate f(x) = 3x² / (x + 1)',
        difficulty: 'Challenge',
        prompt: 'Find f′(x) and all x where the tangent is horizontal.',
        hint: 'Quotient rule; a horizontal tangent needs f′(x) = 0 with a non-zero denominator.',
        answer: 'f′(x) = (3x² + 6x)/(x + 1)², horizontal at x = 0 and x = −2',
      },
    ],
    traps: [
      {
        type: 'Exam Trap',
        title: 'Forgetting the constant multiplier',
        body: 'd/dx[3x²] is 6x, not 2x. Students lower the exponent and forget to multiply by the original coefficient 3.',
      },
      {
        type: 'Conceptual Pitfall',
        title: 'Plugging in x before differentiating',
        body: "f(1) = 5 tells you height, not steepness. Differentiate first, substitute second. f′(1) = 8 is the slope.",
      },
      {
        type: 'Viva Question',
        title: '“What does the derivative physically represent?”',
        body: 'Answer: an instantaneous rate of change — speed if the function is position, current if it is charge, marginal cost if it is cost. Name the units.',
      },
      {
        type: 'Exam Trap',
        title: 'The constant term “surviving”',
        body: 'Derivative of +7 is 0. Leaving a stray constant in f′(x) is one of the most common marking losses.',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is d/dx [4x³]?',
        options: ['12x²', '4x²', '12x³', '3x²'],
        correct: 0,
        explain: 'Bring 3 down to multiply 4 → 12, then lower the exponent: x².',
        trap: 'Forgetting to multiply the coefficient.',
        skill: 'Power rule',
      },
      {
        id: 'q2',
        question: 'If f′(x) = 6x + 2, what is f′(1)?',
        options: ['6', '8', '2', '5'],
        correct: 1,
        explain: 'Substitute x = 1 into the derivative: 6(1) + 2 = 8.',
        trap: 'Substituting into f(x) instead of f′(x) gives 5.',
        skill: 'Evaluation',
      },
      {
        id: 'q3',
        question: 'What is the derivative of the constant term 7?',
        options: ['7', '1', '0', '7x'],
        correct: 2,
        explain: 'A constant has no rate of change, so its derivative is 0.',
        trap: 'Keeping the constant in the derivative.',
        skill: 'Constant rule',
      },
      {
        id: 'q4',
        question: 'A positive derivative at x = a tells you the function is…',
        options: ['Concave up', 'Locally increasing', 'Locally decreasing', 'Constant'],
        correct: 1,
        explain: 'The sign of f′ gives direction: positive → increasing, negative → decreasing.',
        trap: 'Confusing f′ > 0 with concavity, which is f″.',
        skill: 'Interpretation',
      },
      {
        id: 'q5',
        question: 'Differentiate f(x) = x² + 3x − 5.',
        options: ['2x + 3', '2x + 3 − 5', 'x + 3', '2x − 5'],
        correct: 0,
        explain: 'Term by term: 2x + 3 + 0 = 2x + 3.',
        trap: 'Carrying the −5 into the derivative.',
        skill: 'Sum rule',
      },
    ],
    flashcards: [
      { front: 'd/dx [xⁿ]', back: 'n·xⁿ⁻¹', tag: 'Formula' },
      { front: "d/dx [3x² + 2x]", back: '6x + 2', tag: 'Core' },
      { front: 'Derivative at a point, geometrically?', back: 'Slope of the tangent line at that point.', tag: 'Concept' },
      { front: 'd/dx [constant]', back: '0 — constants do not change.', tag: 'Trap' },
      { front: 'f′(a) > 0 means…', back: 'Function is locally increasing at x = a.', tag: 'Concept' },
      { front: 'Units of f′(x) when f is position (metres, seconds)?', back: 'Metres per second — velocity.', tag: 'Application' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'definite-integral',
    discipline: 'integral',
    difficulty: 'Core',
    minutes: 5,
    confidence: 94,
    title: 'Evaluate ∫₀² (3x² + 2x) dx',
    prompt: 'Evaluate the definite integral of 3x² + 2x from 0 to 2 and interpret the result as area.',
    formula: '∫₀² (3x² + 2x) dx',
    answer: '∫₀² (3x² + 2x) dx = 12',
    answerNote: 'The signed area under the curve from x = 0 to x = 2 is exactly 12 square units.',
    tags: ['Fundamental Theorem', 'Definite Integral', 'Area'],
    keywords: ['integral', 'integrate', 'area under', 'antiderivative', 'definite', '∫'],
    analogy: {
      title: 'The odometer on that same car',
      icon: 'Gauge',
      body:
        'If the derivative is your speedometer, the integral is your odometer: it accumulates all the tiny slices of distance travelled. Speed integrated over time gives distance; a curve integrated over x gives area.',
    },
    steps: [
      {
        id: 'i1',
        title: 'Read the integral as accumulated area',
        eyebrow: 'Step 1 · Interpret',
        formula: '∫₀² (3x² + 2x) dx',
        narration:
          'Start by reading the notation out loud. We are slicing the interval from zero to two into infinitely thin vertical strips, each of height three x squared plus two x, and adding up all the areas. The dx is the width of a strip. The integral is an infinite sum of rectangles, which is why the answer is a two-dimensional quantity: square units.',
        insight:
          'A definite integral is a limit of Riemann sums; the bounds give the left and right walls of the region.',
        analogy:
          'Adding up strips under a curve is like tiling a floor: each thin tile contributes height times width, and the integral totals the whole floor.',
        hint: 'Ask: which region between the curve and the x-axis am I measuring?',
        accent: 'violet',
        diagramNote: 'The shaded region is being assembled from thin rectangles.',
      },
      {
        id: 'i2',
        title: 'Find an antiderivative with the power rule',
        eyebrow: 'Step 2 · Antidifferentiate',
        formula: '∫ 3x² dx = x³,  ∫ 2x dx = x²',
        narration:
          'Now reverse the power rule. For a term a x to the n, the antiderivative is a over n plus one, times x to the n plus one. For three x squared we raise the power to three and divide by three, and the threes cancel, giving x cubed. For two x we raise the power to two and divide by two, giving x squared. Notice that antidifferentiation pushes the degree up, the mirror image of differentiation.',
        insight:
          '∫ axⁿ dx = a·xⁿ⁺¹/(n+1) + C for n ≠ −1. Degrees go up when you integrate.',
        analogy:
          'Reversing a speedometer means rebuilding total distance from speed snapshots — the reverse gear of calculus.',
        hint: 'Raise the exponent, divide by the new exponent, then check by differentiating.',
        accent: 'violet',
      },
      {
        id: 'i3',
        title: 'Apply the Fundamental Theorem of Calculus',
        eyebrow: 'Step 3 · Evaluate',
        formula: '[x³ + x²]₀²',
        narration:
          'The fundamental theorem of calculus is the bridge: to find the accumulated area, take any antiderivative and evaluate it at the upper bound minus its value at the lower bound. So we write the bracket x cubed plus x squared, from zero to two. We do not need the constant C, because it cancels in the subtraction.',
        insight:
          '∫ₐᵇ f(x) dx = F(b) − F(a) where F′ = f. Bounds beat constants.',
        analogy:
          'The odometer difference between two moments gives the distance covered — the constant starting offset cancels out.',
        hint: 'Antiderivative first, then F(top) − F(bottom).',
        accent: 'cyan',
      },
      {
        id: 'i4',
        title: 'Compute top minus bottom',
        eyebrow: 'Step 4 · Arithmetic',
        formula: '(8 + 4) − (0 + 0) = 12',
        narration:
          'At the top bound, two cubed is eight and two squared is four, giving twelve. At the bottom bound, everything is zero. Top minus bottom is twelve. That is a positive value, which matches a region sitting above the x-axis over this interval.',
        insight:
          'A positive integral means net area above the axis; a negative integral means net area below it.',
        analogy:
          'Twelve square tiles fit under this curve between the two walls.',
        hint: 'Substitute the bounds into the antiderivative, not into the original integrand.',
        accent: 'emerald',
      },
      {
        id: 'i5',
        title: 'Sanity-check the magnitude',
        eyebrow: 'Step 5 · Verify',
        formula: 'Area ≈ ½ · 2 · 16 = 16 upper bound',
        narration:
          'A quick sanity check. The function climbs from zero to sixteen across the interval, so a triangle with base two and height sixteen would have area sixteen. Our region sits beneath that triangle, and twelve is comfortably below sixteen, so the answer is plausible. Verification by bounding is how professionals avoid silent arithmetic errors under exam pressure.',
        insight:
          'Bound the region with simple shapes before trusting an exact answer. Average height here is 6 over width 2 → 12.',
        analogy:
          'Estimate the floor area with a rough rectangle before trusting the laser measurement.',
        hint: 'Compare with a triangle or rectangle that clearly contains the region.',
        accent: 'amber',
      },
    ],
    diagram: {
      kind: 'area',
      title: 'Accumulated area under f(x) = 3x² + 2x',
      caption:
        'Adjust the upper bound and the rectangle count. As n grows, the Riemann sum converges to 12.',
      formula: '∫₀ᵇ (3x² + 2x) dx = b³ + b²',
    },
    summary: {
      theorem: 'Fundamental Theorem of Calculus',
      formula: '∫ₐᵇ f(x) dx = F(b) − F(a),  where F′ = f',
      takeaways: [
        'Integrals accumulate; derivatives measure. They undo each other.',
        'Antiderivative of axⁿ raises the power to n+1 and divides by n+1.',
        'The constant C cancels in definite integrals — bounds make it irrelevant.',
        'Area under f(x) = 3x² + 2x on [0, 2] is exactly 12 square units.',
      ],
      terms: [
        { term: 'Riemann sum', def: 'A finite rectangle approximation to an integral, converging as width → 0.' },
        { term: 'Antiderivative', def: 'A function F with F′ = f; unique up to an additive constant.' },
        { term: 'Net signed area', def: 'Area above the axis minus area below, as returned by a definite integral.' },
      ],
    },
    similar: [
      {
        title: 'Evaluate ∫₁³ 2x dx',
        difficulty: 'Warm-up',
        prompt: 'Use the fundamental theorem and confirm geometrically.',
        hint: 'Antiderivative is x²; the region is a trapezium.',
        answer: '9 − 1 = 8',
      },
      {
        title: 'Evaluate ∫₀¹ (4x³ − 6x² + 2x) dx',
        difficulty: 'Core',
        prompt: 'Compute the exact net area.',
        hint: 'Term-by-term antiderivatives; watch the zero lower bound.',
        answer: '1 − 2 + 1 = 0',
      },
      {
        title: 'Find d/dx ∫₀^(x²) sin(t) dt',
        difficulty: 'Challenge',
        prompt: 'Differentiate an integral with a variable upper limit.',
        hint: 'Fundamental theorem plus the chain rule for the bound x².',
        answer: '2x·sin(x²)',
      },
    ],
    traps: [
      {
        type: 'Exam Trap',
        title: 'Dropping the bounds',
        body: 'A definite integral is a number. Forgetting to substitute the limits and leaving “+ C” signals a fundamental misconception to markers.',
      },
      {
        type: 'Conceptual Pitfall',
        title: 'Adding instead of subtracting at bounds',
        body: 'It is F(top) − F(bottom). Reversing the order flips the sign of the entire answer.',
      },
      {
        type: 'Viva Question',
        title: '“Does area ever come out negative?”',
        body: 'Yes — a definite integral measures signed area. Regions below the x-axis contribute negative values; ask for absolute area when the wording says “total area”.',
      },
      {
        type: 'Exam Trap',
        title: 'Dividing by the wrong number',
        body: 'For 3x², dividing by the new exponent 3 gives x³. A common slip is dividing by the original exponent 2 and producing 1.5x³.',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'An antiderivative of 6x is…',
        options: ['3x²', '6x²', '6', 'x²'],
        correct: 0,
        explain: 'Raise to x² and divide by 2: 6x²/2 = 3x².',
        trap: 'Multiplying by 2 instead of dividing.',
        skill: 'Antiderivatives',
      },
      {
        id: 'q2',
        question: 'What is ∫₀¹ 2x dx?',
        options: ['2', '1', '0.5', '4'],
        correct: 1,
        explain: '[x²]₀¹ = 1 − 0 = 1.',
        trap: 'Forgetting to evaluate at the bounds.',
        skill: 'Fundamental theorem',
      },
      {
        id: 'q3',
        question: 'For a definite integral, the constant of integration…',
        options: ['Must be added', 'Cancels in F(b) − F(a)', 'Doubles the answer', 'Makes the answer negative'],
        correct: 1,
        explain: 'C appears in both F(b) and F(a), so it cancels.',
        trap: 'Adding “+ C” to a numerical definite integral.',
        skill: 'Definite integrals',
      },
      {
        id: 'q4',
        question: 'If f(x) < 0 on [a, b], then ∫ₐᵇ f(x) dx is…',
        options: ['Positive', 'Zero', 'Negative', 'Undefined'],
        correct: 2,
        explain: 'The integral returns signed area; below-axis regions contribute negatively.',
        trap: 'Assuming area is always positive.',
        skill: 'Interpretation',
      },
    ],
    flashcards: [
      { front: '∫ xⁿ dx (n ≠ −1)', back: 'xⁿ⁺¹/(n+1) + C', tag: 'Formula' },
      { front: 'Fundamental Theorem of Calculus (part 2)', back: '∫ₐᵇ f = F(b) − F(a) where F′ = f.', tag: 'Theorem' },
      { front: '∫₀² (3x² + 2x) dx', back: '12', tag: 'Core' },
      { front: 'Integral of 2x', back: 'x² + C', tag: 'Formula' },
      { front: 'Why does C vanish in definite integrals?', back: 'It appears in both evaluations and cancels on subtraction.', tag: 'Concept' },
      { front: 'Physical reading of ∫ v(t) dt', back: 'Distance travelled — accumulated velocity.', tag: 'Application' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'lagrange-constraint',
    discipline: 'multivariable',
    difficulty: 'Advanced',
    minutes: 7,
    confidence: 91,
    title: 'Maximise f(x, y) = x²y subject to x + y = 6',
    prompt:
      'Use Lagrange multipliers to maximise f(x, y) = x²y on the constraint x + y = 6, x, y > 0.',
    formula: 'max f(x,y) = x²y  s.t.  g(x,y) = x + y − 6 = 0',
    answer: 'max at (x, y) = (4, 2), f = 32',
    answerNote: 'The level curve of f is tangent to the constraint line exactly at (4, 2).',
    tags: ['Lagrange Multipliers', 'Constrained Optimisation', 'Gradients'],
    keywords: ['maximise', 'maximize', 'lagrange', 'constraint', 'subject to', 'multivariable', 'gradient'],
    analogy: {
      title: 'Hiking along a fenced trail',
      icon: 'Mountain',
      body:
        'Your altitude is f(x, y) and you may only walk along the fence x + y = 6. The highest point on the trail is where the hillside’s steepest direction is exactly perpendicular to the fence — that is, where the gradient of the hill is parallel to the gradient of the fence.',
    },
    steps: [
      {
        id: 'm1',
        title: 'Set up objective and constraint',
        eyebrow: 'Step 1 · Frame',
        formula: 'f(x,y) = x²y,  g(x,y) = x + y − 6',
        narration:
          'Every constrained optimisation begins by naming two functions. The objective, f of x y equals x squared y, measures what we want to maximise: think of it as altitude on a hillside. The constraint, g equals x plus y minus six, is the fence along which we are allowed to walk. The minus six puts the constraint in the standard zero form, which Lagrange multipliers require.',
        insight:
          'Write the constraint as g(x, y) = 0. The level set g = 0 is a curve in the plane — our admissible path.',
        analogy:
          'Altitude is the objective; a fenced mountain trail is the constraint. You may only climb along the fence.',
        hint: 'Never mix the objective into the constraint. Keep f and g separate.',
        accent: 'cyan',
      },
      {
        id: 'm2',
        title: 'Form the Lagrangian',
        eyebrow: 'Step 2 · Lagrangian',
        formula: 'ℒ(x,y,λ) = x²y + λ(x + y − 6)',
        narration:
          'We build the Lagrangian by adding the constraint, multiplied by an unknown scalar lambda, to the objective. Lambda is not a nuisance; it is a shadow price. It reports how much the maximum would improve if we relaxed the fence by one unit. Turning a constrained problem into an unconstrained one is the whole trick.',
        insight:
          'ℒ = f + λg. Stationary points of ℒ in all three variables automatically satisfy the constraint.',
        analogy:
          'Lambda is the price of extra trail width: how many metres of altitude one extra metre of fence would buy.',
        hint: 'Use λ(g) exactly once, with the constraint in zero form.',
        accent: 'cyan',
      },
      {
        id: 'm3',
        title: 'Take partial derivatives and set them to zero',
        eyebrow: 'Step 3 · Stationarity',
        formula: '∂ℒ/∂x = 2xy + λ = 0,  ∂ℒ/∂y = x² + λ = 0,  ∂ℒ/∂λ = x + y − 6 = 0',
        narration:
          'Now set every partial derivative to zero. With respect to x we get two x y plus lambda. With respect to y we get x squared plus lambda. With respect to lambda we recover the original constraint, which is the Lagrangian’s built-in safety net. Three equations, three unknowns: x, y and lambda.',
        insight:
          'The first two equations say ∇f = −λ∇g: the gradients are parallel. The third enforces feasibility.',
        analogy:
          'Forces must balance: the pull uphill is exactly cancelled by the fence’s push sideways.',
        hint: 'Differentiate with respect to λ to confirm you recover the constraint.',
        accent: 'violet',
      },
      {
        id: 'm4',
        title: 'Eliminate λ to relate x and y',
        eyebrow: 'Step 4 · Solve',
        formula: '2xy = x²  ⟹  x(2y − x) = 0  ⟹  x = 2y',
        narration:
          'Subtract the two stationarity equations to eliminate lambda. Two x y equals x squared. Since we are told x and y are positive, x is not zero, so we may divide by x and find x equals two y. The tangency condition has collapsed into a simple ratio between the two variables — this is the moment the geometry becomes arithmetic.',
        insight:
          'Eliminating λ yields the tangency relation. Interior solutions assume x ≠ 0, so check boundary cases separately.',
        analogy:
          'The trail’s highest point sits where the hill contour just kisses the fence, which fixes the proportions of x and y.',
        hint: 'Subtract the equations rather than dividing them blindly — keep track of x = 0 possibilities.',
        accent: 'violet',
      },
      {
        id: 'm5',
        title: 'Substitute into the constraint',
        eyebrow: 'Step 5 · Solve',
        formula: 'x + x/2 = 6 ⟹ x = 4 ⟹ y = 2',
        narration:
          'Substitute x equals two y into the constraint. Two y plus y equals six, so y is two and x is four. One candidate point emerges from the interior. Because the constraint is compact and closed in the positive quadrant and the objective is continuous, this stationary point is where the maximum lives, and we still ought to compare any boundary values.',
        insight:
          'For a compact feasible set, compare interior stationary points with the boundary. Here the boundary gives f = 0, far below 32.',
        analogy:
          'Four units of the plentiful ingredient and two of the scarce one — the optimal recipe proportions.',
        hint: 'Always finish by comparing with boundary values or endpoints.',
        accent: 'emerald',
      },
      {
        id: 'm6',
        title: 'Evaluate and interpret λ',
        eyebrow: 'Step 6 · Verify',
        formula: 'f(4,2) = 4²·2 = 32,  λ = −16',
        narration:
          'At four comma two the objective is sixteen times two, thirty two. The multiplier comes out as minus sixteen, so relaxing the constraint by one unit would raise the maximum by about sixteen. The negative sign tells us the constraint is binding: it costs us altitude. That economic reading of lambda is exactly what appears in cost, energy and resource problems.',
        insight:
          'f(4,2) = 32 is the maximum. λ = −16 is the shadow price of the constraint, with sign indicating a binding limit.',
        analogy:
          'Each extra unit of trail width is worth sixteen metres of altitude — that is what λ prices.',
        hint: 'Report the optimum value, not just the point, and interpret λ’s sign.',
        accent: 'emerald',
        diagramNote: 'The tangency of the level curve and the constraint is highlighted.',
      },
    ],
    diagram: {
      kind: 'contour',
      title: 'Level curves of f(x,y) = x²y meeting x + y = 6',
      caption:
        'Drag the candidate point. The maximum occurs where the contour is tangent to the constraint line at (4, 2).',
      formula: '∇f = λ∇g',
    },
    summary: {
      theorem: 'Lagrange Multiplier Theorem',
      formula: '∇f(x₀) = λ∇g(x₀) and g(x₀) = 0',
      takeaways: [
        'At a constrained optimum, gradients of objective and constraint are parallel.',
        'Build ℒ = f + λg and solve the three stationarity equations.',
        'Eliminate λ first — it turns geometry into an algebraic relation.',
        'Compare interior candidates against boundaries; interpret λ as a shadow price.',
      ],
      terms: [
        { term: 'Gradient', def: 'Vector of partial derivatives; points in the steepest ascent direction.' },
        { term: 'Level curve', def: 'A curve where the objective is constant, like a contour on a map.' },
        { term: 'Shadow price', def: 'The rate of change of the optimum with respect to the constraint constant — λ.' },
      ],
    },
    similar: [
      {
        title: 'Minimise x² + y² subject to x + y = 4',
        difficulty: 'Warm-up',
        prompt: 'Find the closest point on the line to the origin.',
        hint: 'Symmetric objective and constraint give x = y.',
        answer: 'Minimum 8 at (2, 2)',
      },
      {
        title: 'Maximise xy subject to x² + y² = 8',
        difficulty: 'Core',
        prompt: 'Use Lagrange multipliers and identify the shape of the constraint.',
        hint: 'Constraint is a circle; expect x = y by symmetry.',
        answer: 'Maximum 4 at (2, 2) and (−2, −2)',
      },
      {
        title: 'Maximise x + 2y + 3z subject to x² + y² + z² = 14',
        difficulty: 'Challenge',
        prompt: 'Three variables, one sphere constraint.',
        hint: 'λ∇g gives x = −1/(2λ) etc.; solve the normalising condition.',
        answer: 'Maximum √196 = 14 at (1, 2, 3)',
      },
    ],
    traps: [
      {
        type: 'Exam Trap',
        title: 'Forgetting the constraint equation',
        body: 'The partial with respect to λ is the constraint. Skipping it leaves two equations for three unknowns — you will solve forever and get nowhere.',
      },
      {
        type: 'Conceptual Pitfall',
        title: 'Dividing by x without checking x = 0',
        body: 'Eliminating λ by dividing by x discards boundary candidates. State the assumption, then verify the boundary separately.',
      },
      {
        type: 'Viva Question',
        title: '“What does λ mean physically?”',
        body: 'The sensitivity of the optimum to the constraint: d(optimum)/d(constant). In economics it is marginal value; in mechanics, a constraint force.',
      },
      {
        type: 'Exam Trap',
        title: 'Reporting the point but not the value',
        body: '“Maximum at (4, 2)” is incomplete. Give f(4, 2) = 32 and, if asked, the multiplier λ = −16.',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'At a constrained optimum, the gradients ∇f and ∇g are…',
        options: ['Perpendicular', 'Parallel', 'Equal in magnitude', 'Both zero'],
        correct: 1,
        explain: 'Tangency means the steepest directions align: ∇f = λ∇g.',
        trap: 'Thinking tangency means perpendicular gradients.',
        skill: 'Geometry of Lagrange',
      },
      {
        id: 'q2',
        question: 'The Lagrangian for max f s.t. g = 0 is…',
        options: ['f − g', 'f + λg', 'fg', 'λf + g'],
        correct: 1,
        explain: 'ℒ = f + λg; the multiplier weights the constraint.',
        trap: 'Dropping λ so the constraint has no influence.',
        skill: 'Construction',
      },
      {
        id: 'q3',
        question: 'For f = x²y, g = x + y − 6, which relation comes from eliminating λ?',
        options: ['x = y', 'x = 2y', 'y = 2x', 'x + y = 0'],
        correct: 1,
        explain: '2xy = x², and with x ≠ 0 this gives x = 2y.',
        trap: 'Cancelling x² incorrectly and getting x = y.',
        skill: 'Algebra',
      },
      {
        id: 'q4',
        question: 'λ = −16 means…',
        options: [
          'The constraint is irrelevant',
          'Relaxing the constraint by 1 unit raises the max by ≈16',
          'The optimum is a minimum',
          'f has no stationary point',
        ],
        correct: 1,
        explain: 'λ measures sensitivity of the optimum to the constraint level; sign shows direction.',
        trap: 'Treating λ as a coordinate.',
        skill: 'Interpretation',
      },
    ],
    flashcards: [
      { front: 'Lagrange condition', back: '∇f = λ∇g together with g = 0.', tag: 'Formula' },
      { front: 'Lagrangian', back: 'ℒ = f + λg, differentiated w.r.t. x, y and λ.', tag: 'Formula' },
      { front: 'Geometric meaning of tangency', back: 'Level curve of f just touches the constraint curve.', tag: 'Concept' },
      { front: 'Shadow price λ', back: 'Rate at which the optimum changes as the constraint constant changes.', tag: 'Concept' },
      { front: 'Max of x²y on x + y = 6', back: '32, at (4, 2), with λ = −16.', tag: 'Core' },
      { front: 'Common Lagrange trap', back: 'Dividing by a variable that may be zero; losing boundary cases.', tag: 'Trap' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'linear-system',
    discipline: 'linear',
    difficulty: 'Core',
    minutes: 4,
    confidence: 95,
    title: 'Solve 2x + 3y = 12 and x − y = 1',
    prompt: 'Solve the simultaneous system 2x + 3y = 12, x − y = 1 and describe the geometry.',
    formula: '2x + 3y = 12  ·  x − y = 1',
    answer: 'x = 3, y = 2',
    answerNote: 'Three times the second equation plus the first isolates x; the lines cross at (3, 2).',
    tags: ['Linear Systems', 'Elimination', 'Intersection'],
    keywords: ['solve', 'system', 'simultaneous', 'linear', 'matrix', 'elimination', 'x and y'],
    analogy: {
      title: 'Two roads crossing',
      icon: 'Route',
      body:
        'Each linear equation is a straight road on a map. Driving along either road satisfies that equation. The solution is the single junction where both roads pass through the same point — the only place your position satisfies both rules at once.',
    },
    steps: [
      {
        id: 'l1',
        title: 'Read each equation as a line',
        eyebrow: 'Step 1 · Geometry',
        formula: 'y = 4 − (2/3)x  and  y = x − 1',
        narration:
          'Rewrite both equations in slope-intercept form to see them as lines. The first becomes y equals four minus two thirds x, a gentle downhill line. The second becomes y equals x minus one, a steeper uphill line. Because the slopes differ, the lines are not parallel, so they must intersect in exactly one point. That is our unique solution.',
        insight:
          'Two lines with different slopes meet exactly once. Equal slopes mean none or infinitely many solutions.',
        analogy:
          'Two roads with different headings must cross somewhere; parallel roads never do.',
        hint: 'Compare slopes first: it tells you whether a unique solution exists at all.',
        accent: 'emerald',
      },
      {
        id: 'l2',
        title: 'Scale one equation to align a variable',
        eyebrow: 'Step 2 · Prepare Elimination',
        formula: '2x − 2y = 2',
        narration:
          'Elimination works by making one variable’s coefficients match, then subtracting. Multiply the second equation by two: two x minus two y equals two. Now both equations carry two x, so subtracting will wipe x out and leave a single equation in y. This is the algebraic equivalent of finding where the roads share a coordinate.',
        insight:
          'You may multiply any equation by a non-zero constant without changing its solution set.',
        analogy:
          'Aligning two measuring scales so the same mark can be read off both at once.',
        hint: 'Choose the multiplier that matches the coefficient of the variable you want gone.',
        accent: 'emerald',
      },
      {
        id: 'l3',
        title: 'Eliminate x by subtraction',
        eyebrow: 'Step 3 · Eliminate',
        formula: '(2x + 3y) − (2x − 2y) = 12 − 2  ⟹  5y = 10',
        narration:
          'Subtract the scaled second equation from the first. The two x terms cancel, three y plus two y gives five y, and twelve minus two gives ten. So five y equals ten and y equals two. Be meticulous with signs here: subtracting a negative two y adds two y. Sign errors in this line account for most lost marks in linear systems.',
        insight:
          'Elimination reduces a 2×2 system to a 1×1 problem. Sign discipline is everything.',
        analogy:
          'Cancelling the shared road coordinate leaves only the difference in elevation.',
        hint: 'Distribute the minus sign across the entire equation, not just the first term.',
        accent: 'cyan',
      },
      {
        id: 'l4',
        title: 'Back-substitute to find x',
        eyebrow: 'Step 4 · Back-Substitute',
        formula: 'x − 2 = 1  ⟹  x = 3',
        narration:
          'With y equal to two, return to the simpler original equation, x minus y equals one, giving x minus two equals one, so x equals three. The candidate solution is three comma two. Back-substituting into the simplest equation keeps the arithmetic clean and reduces the chance of compounding an error.',
        insight:
          'Always substitute into the least complicated equation, then verify in the other one.',
        analogy:
          'Once one road’s coordinate is known, the junction’s other coordinate follows immediately.',
        hint: 'Pick the equation with the smallest coefficients.',
        accent: 'emerald',
      },
      {
        id: 'l5',
        title: 'Verify in both equations',
        eyebrow: 'Step 5 · Verify',
        formula: '2(3) + 3(2) = 12 ✓   3 − 2 = 1 ✓',
        narration:
          'Verification is not optional. Substituting three and two into the first equation gives six plus six, twelve, correct. Into the second, three minus two is one, correct. The solution is three comma two. In matrix language, the determinant of the coefficient matrix is negative five, non-zero, confirming a unique intersection and an invertible matrix.',
        insight:
          'A solution must satisfy every equation. Non-zero determinant ⇔ unique solution.',
        analogy:
          'Confirm the junction lies on both roads, not just one.',
        hint: 'Check both equations; a single satisfied equation proves nothing.',
        accent: 'amber',
        diagramNote: 'Both lines are plotted; the intersection is marked at (3, 2).',
      },
    ],
    diagram: {
      kind: 'linear',
      title: 'Intersection of the two constraint lines',
      caption:
        'Move the candidate point or toggle the normal vectors. The unique solution sits where both lines meet: (3, 2).',
      formula: 'A = [[2, 3], [1, −1]],  det A = −5 ≠ 0',
    },
    summary: {
      theorem: 'Elimination & the Invertible Matrix Theorem',
      formula: 'Ax = b has a unique solution ⇔ det A ≠ 0',
      takeaways: [
        'Each linear equation is a hyperplane; the solution is the common intersection.',
        'Elimination scales equations to cancel variables; signs decide correctness.',
        'A non-zero determinant guarantees exactly one intersection point.',
        'The solution (3, 2) satisfies both equations simultaneously.',
      ],
      terms: [
        { term: 'Determinant', def: 'A scalar encoding area scaling; non-zero means the matrix is invertible.' },
        { term: 'Row reduction', def: 'Systematic elimination to row-echelon form, revealing rank and consistency.' },
        { term: 'Span', def: 'All linear combinations of a set of vectors — the reachable right-hand sides.' },
      ],
    },
    similar: [
      {
        title: 'Solve x + y = 7 and x − y = 3',
        difficulty: 'Warm-up',
        prompt: 'Solve by addition and verify.',
        hint: 'Adding eliminates y immediately.',
        answer: 'x = 5, y = 2',
      },
      {
        title: 'Solve 3x + 2y = 8 and 6x + 4y = 16',
        difficulty: 'Core',
        prompt: 'How many solutions exist, and why?',
        hint: 'The second equation is twice the first.',
        answer: 'Infinitely many: the lines coincide (rank 1)',
      },
      {
        title: 'Solve the 3×3 system x + y + z = 6, 2x − y = 1, y + 2z = 7',
        difficulty: 'Challenge',
        prompt: 'Use Gaussian elimination and state the determinant condition.',
        hint: 'Eliminate x first, then solve the 2×2 sub-system.',
        answer: 'x = 2, y = 3, z = 1',
      },
    ],
    traps: [
      {
        type: 'Exam Trap',
        title: 'Sign errors during subtraction',
        body: 'Subtracting 2x − 2y from 2x + 3y yields +5y, not +y. Distribute the minus across both terms.',
      },
      {
        type: 'Conceptual Pitfall',
        title: 'Stopping after finding one variable',
        body: 'A solution is an ordered pair. An answer of “y = 2” is incomplete and loses marks.',
      },
      {
        type: 'Viva Question',
        title: '“When does a linear system have no solution?”',
        body: 'When elimination produces a contradiction such as 0 = 5 — equivalently, parallel distinct lines, or a coefficient matrix whose rank exceeds the augmented matrix’s consistency.',
      },
      {
        type: 'Exam Trap',
        title: 'Verifying only one equation',
        body: 'Always check both. Satisfying one equation is necessary, never sufficient.',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'The system 2x + 3y = 12, x − y = 1 has…',
        options: ['No solution', 'Exactly one solution', 'Infinitely many', 'Two solutions'],
        correct: 1,
        explain: 'The slopes 2/3 and 1 differ, so the lines intersect exactly once.',
        trap: 'Assuming equal slopes because the coefficients look similar.',
        skill: 'Existence of solutions',
      },
      {
        id: 'q2',
        question: 'Solving the system gives…',
        options: ['x = 2, y = 3', 'x = 3, y = 2', 'x = 1, y = 6', 'x = 4, y = 3'],
        correct: 1,
        explain: 'Verify: 2(3) + 3(2) = 12 and 3 − 2 = 1.',
        trap: 'Swapping x and y in the final answer.',
        skill: 'Elimination',
      },
      {
        id: 'q3',
        question: 'A 2×2 coefficient matrix with determinant 0 implies…',
        options: ['Unique solution', 'Either no solution or infinitely many', 'Always infinitely many', 'A non-linear system'],
        correct: 1,
        explain: 'Singular matrices lose rank, so consistency decides between zero and infinitely many solutions.',
        trap: 'Claiming infinite solutions without checking consistency.',
        skill: 'Matrix theory',
      },
      {
        id: 'q4',
        question: 'Geometrically, the solution to a 2×2 system is…',
        options: ['The area between lines', 'The intersection point', 'The midpoint', 'The slope difference'],
        correct: 1,
        explain: 'Both equations must hold simultaneously, so the solution is where both lines meet.',
        trap: 'Confusing solution with the enclosed region.',
        skill: 'Geometry',
      },
    ],
    flashcards: [
      { front: 'Solution of 2x + 3y = 12, x − y = 1', back: 'x = 3, y = 2', tag: 'Core' },
      { front: 'det [[2,3],[1,−1]]', back: '−5, so the system is uniquely solvable.', tag: 'Formula' },
      { front: 'Unique solution ⇔', back: 'det A ≠ 0 (full rank).', tag: 'Theorem' },
      { front: 'Parallel distinct lines →', back: 'No solution (inconsistent system).', tag: 'Concept' },
      { front: 'Coincident lines →', back: 'Infinitely many solutions.', tag: 'Concept' },
      { front: 'Most common elimination error', back: 'Not distributing the minus sign across the whole equation.', tag: 'Trap' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'normal-probability',
    discipline: 'probability',
    difficulty: 'Advanced',
    minutes: 6,
    confidence: 92,
    title: 'P(X > 650) for X ~ N(500, 100²)',
    prompt:
      'Test scores are normally distributed with mean 500 and standard deviation 100. Find P(X > 650).',
    formula: 'X ~ N(μ = 500, σ = 100)',
    answer: 'P(X > 650) ≈ 0.0668  (6.68%)',
    answerNote: 'A score of 650 is 1.5 standard deviations above the mean; about 6.7% of students beat it.',
    tags: ['Normal Distribution', 'Z-Score', 'Tail Probability'],
    keywords: ['probability', 'normal', 'distribution', 'z-score', 'mean', 'standard deviation', 'chance'],
    analogy: {
      title: 'Height charts at a stadium',
      icon: 'Users',
      body:
        'If you measured everyone in a stadium, most heights cluster near the average with symmetric, thinning tails. The z-score asks: how many “typical spreads” from average is this person? 1.5 spreads out is uncommon but far from impossible.',
    },
    steps: [
      {
        id: 'p1',
        title: 'Name the distribution and what is asked',
        eyebrow: 'Step 1 · Frame',
        formula: 'X ~ N(500, 100²),  want P(X > 650)',
        narration:
          'The notation tells us everything. X is normal with mean five hundred and standard deviation one hundred, so the variance is ten thousand. We want the probability that a randomly chosen student scores strictly above six hundred fifty — a right-tail area under the bell curve. Draw the curve and shade the right tail before doing any algebra.',
        insight:
          'Normal is specified by μ and σ. Always shade the requested region first — it prevents complement errors later.',
        analogy:
          'Mark the average height on a chart and shade everyone taller than your chosen threshold.',
        hint: 'Sketch the bell, mark μ, shade the tail you want.',
        accent: 'amber',
      },
      {
        id: 'p2',
        title: 'Standardise with a z-score',
        eyebrow: 'Step 2 · Standardise',
        formula: 'z = (650 − 500)/100 = 1.5',
        narration:
          'Standardisation converts every normal distribution into the same standard bell curve with mean zero and standard deviation one. Subtract the mean to recentre, then divide by the standard deviation to rescale. Six fifty minus five hundred is one fifty, divided by one hundred gives one point five. So six fifty sits one and a half standard deviations above average, which is a strong but not extraordinary score.',
        insight:
          'z measures distance from the mean in units of σ. It is unit-free, so it compares across different tests.',
        analogy:
          'Converting currencies to a single reference currency so prices can be compared directly.',
        hint: 'z = (x − μ)/σ. Check the sign: above average must be positive.',
        accent: 'amber',
      },
      {
        id: 'p3',
        title: 'Translate to a standard-normal probability',
        eyebrow: 'Step 3 · Transform',
        formula: 'P(X > 650) = P(Z > 1.5) = 1 − Φ(1.5)',
        narration:
          'Because the transformation is monotone and linear, the probability is preserved: the probability that X exceeds six fifty equals the probability that Z exceeds one point five. Tables and software usually give the left-tail cumulative probability, capital phi. So we take one minus phi of one point five. This complement step is where most marks are lost.',
        insight:
          'For a continuous variable P(Z ≥ c) = P(Z > c). Use the complement to get right tails from left-tail tables.',
        analogy:
          'If thirty percent of the stadium is shorter than you, seventy percent is taller — tails are complements.',
        hint: 'Right tail = 1 − left tail. Never forget the complement.',
        accent: 'cyan',
      },
      {
        id: 'p4',
        title: 'Look up the tail and report',
        eyebrow: 'Step 4 · Evaluate',
        formula: 'Φ(1.5) ≈ 0.9332 ⟹ 0.0668',
        narration:
          'From standard normal tables, phi of one point five is approximately zero point nine three three two, meaning about ninety three point three percent score below six fifty. One minus that is zero point zero six six eight, so roughly six point seven percent score above. Reporting the probability, the percentage, and the interpretation together is what distinguishes a complete answer.',
        insight:
          'Φ(1.5) ≈ 0.9332, so the upper tail is 0.0668 ≈ 6.7%. Roughly a 1-in-15 event.',
        analogy:
          'About one person in fifteen in the stadium is taller than your threshold.',
        hint: 'Convert the decimal to a percentage and state the event in words.',
        accent: 'emerald',
        diagramNote: 'The shaded tail updates live as you move the threshold.',
      },
      {
        id: 'p5',
        title: 'Check with the empirical rule',
        eyebrow: 'Step 5 · Sanity Check',
        formula: '1σ → 16%, 2σ → 2.3%, so 1.5σ ≈ 6.7% ✓',
        narration:
          'Sanity-check with the empirical rule. Beyond one standard deviation lies about sixteen percent; beyond two, about two point three percent. Our threshold is between them, so a tail of about six point seven percent is exactly right. This triangulation catches the classic error of reporting ninety three percent instead of six point seven.',
        insight:
          '68–95–99.7 rule: 16% beyond 1σ, 2.5% beyond 2σ, 0.15% beyond 3σ. Use it to validate any tail.',
        analogy:
          'Estimating a bill before the exact total arrives — if the ballpark is wrong, recheck the arithmetic.',
        hint: 'If your answer lies outside 2–16% for a 1.5σ tail, you have complemented incorrectly.',
        accent: 'emerald',
      },
    ],
    diagram: {
      kind: 'bell',
      title: 'Standard normal curve with shaded tail',
      caption:
        'Drag the threshold or change σ. The shaded area, z-score and probability update instantly.',
      formula: 'P(X > x₀) = 1 − Φ((x₀ − μ)/σ)',
    },
    summary: {
      theorem: 'Standardisation of the Normal Distribution',
      formula: 'Z = (X − μ)/σ ~ N(0, 1),  P(X > x₀) = 1 − Φ(z₀)',
      takeaways: [
        'Standardising turns any normal variable into N(0, 1).',
        'The z-score counts standard deviations from the mean.',
        'Tables give left tails; use 1 − Φ(z) for right tails.',
        'P(X > 650) ≈ 0.0668 — about 6.7%, consistent with the empirical rule.',
      ],
      terms: [
        { term: 'Standard deviation', def: 'Typical distance from the mean; the natural unit of a normal distribution.' },
        { term: 'CDF Φ', def: 'Cumulative distribution: the area to the left of z under the standard bell.' },
        { term: 'Empirical rule', def: '68%, 95%, 99.7% of mass within 1, 2, 3 standard deviations.' },
      ],
    },
    similar: [
      {
        title: 'P(X < 560) for N(500, 100²)',
        difficulty: 'Warm-up',
        prompt: 'Standardise and read the left tail.',
        hint: 'z = 0.6 → Φ(0.6) ≈ 0.7257.',
        answer: '≈ 0.7257 (72.6%)',
      },
      {
        title: 'P(450 < X < 620) for N(500, 100²)',
        difficulty: 'Core',
        prompt: 'Find a probability between two scores.',
        hint: 'Subtract two left tails: Φ(1.2) − Φ(−0.5).',
        answer: '0.8849 − 0.3085 ≈ 0.5764',
      },
      {
        title: 'Find the 90th percentile for N(500, 100²)',
        difficulty: 'Challenge',
        prompt: 'Invert the CDF: what score has 10% above it?',
        hint: 'z₀.₉ ≈ 1.2816; solve x = μ + zσ.',
        answer: '≈ 628.2',
      },
    ],
    traps: [
      {
        type: 'Exam Trap',
        title: 'Using σ² instead of σ',
        body: 'The notation N(500, 100²) means variance 10,000 and standard deviation 100. Dividing by 10,000 gives a nonsense z of 0.015.',
      },
      {
        type: 'Conceptual Pitfall',
        title: 'Forgetting the complement',
        body: '“Greater than” needs 1 − Φ(z). Reporting 0.9332 instead of 0.0668 is the single most common normal-distribution error.',
      },
      {
        type: 'Viva Question',
        title: '“Why can we use z-tables at all?”',
        body: 'Because every normal distribution is an affine transform of N(0, 1), and affine transforms preserve probability up to the change of variable.',
      },
      {
        type: 'Exam Trap',
        title: 'Strict vs non-strict inequality',
        body: 'For continuous distributions P(X > 650) = P(X ≥ 650). Do not waste time arguing about endpoints; just note it.',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'For N(500, 100²), the z-score of 650 is…',
        options: ['0.65', '1.5', '15', '6.5'],
        correct: 1,
        explain: 'z = (650 − 500)/100 = 1.5.',
        trap: 'Dividing by the variance 10,000.',
        skill: 'Standardisation',
      },
      {
        id: 'q2',
        question: 'P(X > 650) equals…',
        options: ['Φ(1.5)', '1 − Φ(1.5)', 'Φ(1.5) − 1', '1 + Φ(1.5)'],
        correct: 1,
        explain: 'Right tail is the complement of the left tail: 1 − 0.9332.',
        trap: 'Reporting the left tail directly.',
        skill: 'Tail probability',
      },
      {
        id: 'q3',
        question: 'Roughly what percent of values lie beyond 2 standard deviations?',
        options: ['32%', '16%', '5%', '2.3%'],
        correct: 3,
        explain: 'The 95% empirical rule leaves about 5% split into two tails of ≈2.3% each.',
        trap: 'Forgetting to halve the two-tailed remainder.',
        skill: 'Empirical rule',
      },
      {
        id: 'q4',
        question: 'Standardising a normal variable produces…',
        options: ['N(μ, σ)', 'N(0, 1)', 'Uniform(0, 1)', 'N(1, 0)'],
        correct: 1,
        explain: 'Subtract μ and divide by σ to get mean 0, variance 1.',
        trap: 'Confusing the parameters of the standard normal.',
        skill: 'Standard normal',
      },
    ],
    flashcards: [
      { front: 'z-score formula', back: 'z = (x − μ)/σ', tag: 'Formula' },
      { front: 'z for x = 650 in N(500, 100²)', back: '1.5', tag: 'Core' },
      { front: 'P(X > x₀) in terms of Φ', back: '1 − Φ((x₀ − μ)/σ)', tag: 'Formula' },
      { front: 'P(X > 650)', back: '≈ 0.0668, about 6.7%', tag: 'Core' },
      { front: 'Empirical rule', back: '68% within 1σ, 95% within 2σ, 99.7% within 3σ.', tag: 'Theorem' },
      { front: 'Biggest normal-distribution trap', back: 'Forgetting 1 − Φ(z) for right tails.', tag: 'Trap' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'triangle-angles',
    discipline: 'geometry',
    difficulty: 'Core',
    minutes: 3,
    confidence: 96,
    title: 'Triangle angles in ratio 2 : 3 : 4',
    prompt: 'The angles of a triangle are in the ratio 2 : 3 : 4. Find each angle and classify the triangle.',
    formula: 'A : B : C = 2 : 3 : 4,  A + B + C = 180°',
    answer: 'A = 40°, B = 60°, C = 80° · acute scalene',
    answerNote: 'Nine parts make 180°, so one part is 20°; all angles are below 90°, so the triangle is acute.',
    tags: ['Angle Sum', 'Ratios', 'Triangle Classification'],
    keywords: ['triangle', 'angle', 'geometry', 'ratio', 'degrees', 'polygon'],
    analogy: {
      title: 'Slicing a 180° pizza',
      icon: 'Pizza',
      body:
        'The three angles are three slices that must exactly fill a half-turn — 180 degrees. The ratio tells you the slices are two, three and four parts wide. Add the parts to find the size of one part, then serve each slice.',
    },
    steps: [
      {
        id: 'g1',
        title: 'Invoke the triangle angle sum',
        eyebrow: 'Step 1 · The Theorem',
        formula: 'A + B + C = 180°',
        narration:
          'Every triangle in Euclidean geometry has angles summing to one hundred eighty degrees. That theorem is the budget we must allocate. Our three angles are in the ratio two to three to four, so imagine nine equal slices filling the half turn. The sum of the ratio parts must therefore correspond to one hundred eighty degrees.',
        insight:
          'The angle sum 180° is a consequence of the parallel postulate — it fails in non-Euclidean geometry.',
        analogy:
          'A half pizza cut into nine equal slices; the three angles receive two, three and four slices.',
        hint: 'Add the ratio numbers to get the total number of parts.',
        accent: 'cyan',
      },
      {
        id: 'g2',
        title: 'Find the value of one ratio part',
        eyebrow: 'Step 2 · Ratio Arithmetic',
        formula: '2k + 3k + 4k = 9k = 180° ⟹ k = 20°',
        narration:
          'Introduce a scale factor k so the angles are two k, three k and four k. Their sum is nine k, which equals one hundred eighty degrees, so k equals twenty degrees. This single number unlocks all three angles and is far cleaner than guessing and checking.',
        insight:
          'A ratio describes proportion, not size; a scale factor converts parts into degrees.',
        analogy:
          'Once you know one slice is twenty degrees, you can size every other slice by counting slices.',
        hint: 'Divide 180 by the sum of the ratio terms.',
        accent: 'cyan',
      },
      {
        id: 'g3',
        title: 'Scale each part into an angle',
        eyebrow: 'Step 3 · Compute',
        formula: 'A = 40°, B = 60°, C = 80°',
        narration:
          'Multiply each ratio term by twenty. Two times twenty is forty. Three times twenty is sixty. Four times twenty is eighty. Checking the sum: forty plus sixty plus eighty is one hundred eighty, exactly on budget. So the angles are forty, sixty and eighty degrees.',
        insight:
          'Always re-add the angles to confirm they total 180° before answering anything else.',
        analogy:
          'Two slices, three slices, four slices — forty, sixty and eighty degrees.',
        hint: 'Multiply, then verify the total.',
        accent: 'emerald',
      },
      {
        id: 'g4',
        title: 'Classify the triangle',
        eyebrow: 'Step 4 · Classify',
        formula: 'All angles < 90° ⟹ acute; all sides unequal ⟹ scalene',
        narration:
          'Classification follows directly. Every angle is less than ninety degrees, so the triangle is acute rather than right or obtuse. All three angles differ, so no two sides can be equal, which makes it scalene. And the largest angle, eighty degrees, sits opposite the longest side — a useful cross-check if a diagram is given.',
        insight:
          'Angle classification: all < 90° acute, one = 90° right, one > 90° obtuse. Distinct angles imply distinct sides.',
        analogy:
          'A slice set with no equal slices and no slice reaching a quarter-turn is an acute scalene triangle.',
        hint: 'Compare the largest angle with 90° in the same sentence as your classification.',
        accent: 'emerald',
        diagramNote: 'The triangle is drawn with angle arcs proportional to 40°, 60° and 80°.',
      },
    ],
    diagram: {
      kind: 'triangle',
      title: 'Angle arcs and side labels',
      caption:
        'Hover or tap a vertex to highlight its angle. The arcs resize with the ratio so the geometry stays honest.',
      formula: 'A : B : C = 2 : 3 : 4',
    },
    summary: {
      theorem: 'Triangle Angle Sum Theorem',
      formula: 'A + B + C = 180° in Euclidean geometry',
      takeaways: [
        'Add ratio parts, then divide the angle sum by that total.',
        'The scale factor k converts proportion into measurement.',
        'Angles 40°, 60°, 80° satisfy the ratio and sum to 180°.',
        'All angles below 90° and all distinct → acute scalene.',
      ],
      terms: [
        { term: 'Scalene', def: 'A triangle with three unequal sides, equivalently three unequal angles.' },
        { term: 'Acute triangle', def: 'Every interior angle is strictly less than 90°.' },
        { term: 'Scale factor', def: 'The multiplier that turns ratio parts into actual measurements.' },
      ],
    },
    similar: [
      {
        title: 'Angles in ratio 1 : 1 : 2',
        difficulty: 'Warm-up',
        prompt: 'Find the angles and classify the triangle.',
        hint: 'Four parts total; 180/4 = 45.',
        answer: '45°, 45°, 90° — right isosceles',
      },
      {
        title: 'One angle is twice another, the third is 30°',
        difficulty: 'Core',
        prompt: 'Find the two unknown angles.',
        hint: 'Let the smaller be x, so 3x + 30 = 180.',
        answer: '50° and 100° — obtuse scalene',
      },
      {
        title: 'Exterior angle at C is 130°; A : B = 2 : 3',
        difficulty: 'Challenge',
        prompt: 'Use the exterior angle theorem to find A and B.',
        hint: 'A + B = 130° and the ratio fixes the split.',
        answer: 'A = 52°, B = 78°, C = 50°',
      },
    ],
    traps: [
      {
        type: 'Exam Trap',
        title: 'Forgetting to introduce the scale factor',
        body: 'The angles are not 2°, 3° and 4°. They are 2k, 3k, 4k. Writing raw ratio numbers as angles is an instant loss.',
      },
      {
        type: 'Conceptual Pitfall',
        title: 'Assuming the ratio gives side lengths',
        body: 'This ratio describes angles. Side lengths follow the sine rule, not the angle ratio directly.',
      },
      {
        type: 'Viva Question',
        title: '“Can a triangle have angles 30°, 60° and 100°?”',
        body: 'No — they sum to 190°. Always verify the 180° budget before attempting construction.',
      },
      {
        type: 'Exam Trap',
        title: 'Missing the classification mark',
        body: 'Examiners often award a separate mark for “acute scalene”. Compute the angles and then explicitly classify.',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'The angles of a triangle sum to…',
        options: ['90°', '180°', '270°', '360°'],
        correct: 1,
        explain: 'Euclidean triangle angle sum is 180°.',
        trap: 'Confusing with quadrilateral sum 360°.',
        skill: 'Angle sum',
      },
      {
        id: 'q2',
        question: 'If angles are in the ratio 2 : 3 : 4, one ratio part equals…',
        options: ['18°', '20°', '30°', '36°'],
        correct: 1,
        explain: '9 parts total: 180/9 = 20°.',
        trap: 'Dividing 180 by 3 (number of angles) instead of 9 (parts).',
        skill: 'Ratios',
      },
      {
        id: 'q3',
        question: 'The largest angle in this triangle is…',
        options: ['40°', '60°', '80°', '100°'],
        correct: 2,
        explain: '4 × 20 = 80°.',
        trap: 'Assigning the largest ratio to the smallest angle.',
        skill: 'Computation',
      },
      {
        id: 'q4',
        question: 'The triangle with angles 40°, 60°, 80° is…',
        options: ['Right scalene', 'Obtuse isosceles', 'Acute scalene', 'Equilateral'],
        correct: 2,
        explain: 'All angles < 90° and all distinct → acute scalene.',
        trap: 'Calling it equilateral because all angles are “close”.',
        skill: 'Classification',
      },
    ],
    flashcards: [
      { front: 'Triangle angle sum', back: 'A + B + C = 180°.', tag: 'Theorem' },
      { front: 'Angles in ratio 2 : 3 : 4', back: '40°, 60°, 80°', tag: 'Core' },
      { front: 'One ratio part here', back: '20°, since 9k = 180°.', tag: 'Formula' },
      { front: 'Acute triangle', back: 'All three angles are less than 90°.', tag: 'Concept' },
      { front: 'Scalene triangle', back: 'Three unequal sides, three unequal angles.', tag: 'Concept' },
      { front: 'Ratio trap', back: 'Never use ratio numbers as angles; introduce a scale factor k.', tag: 'Trap' },
    ],
  },
]

/* Small helper for the composer's example chips */
export const SAMPLE_PROMPTS = [
  { label: 'Derivative', prompt: 'Find the derivative of f(x) = 3x² + 2x and explain what it means at x = 1.', id: 'derivative-power' },
  { label: 'Integral', prompt: 'Evaluate ∫₀² (3x² + 2x) dx and interpret the area.', id: 'definite-integral' },
  { label: 'Lagrange', prompt: 'Maximise f(x, y) = x²y subject to x + y = 6 using Lagrange multipliers.', id: 'lagrange-constraint' },
  { label: 'Linear system', prompt: 'Solve 2x + 3y = 12 and x − y = 1.', id: 'linear-system' },
  { label: 'Normal probability', prompt: 'X ~ N(500, 100²). Find P(X > 650).', id: 'normal-probability' },
  { label: 'Geometry', prompt: 'The angles of a triangle are in the ratio 2 : 3 : 4. Find each angle.', id: 'triangle-angles' },
]
