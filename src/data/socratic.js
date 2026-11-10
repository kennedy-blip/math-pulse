/* Socratic dialogue trees — the AI never gives the answer outright,
   it asks the next best question and reacts to the learner's reasoning. */

export const SOCRATIC = {
  'derivative-power': [
    {
      id: 'soc-d-1',
      concept: 'Structure',
      question:
        'Before differentiating — look at f(x) = 3x² + 2x. What kind of structure are we facing?',
      hint: 'Are the pieces added, multiplied, or nested?',
      options: [
        {
          text: 'A sum of two power terms',
          correct: true,
          feedback:
            'Exactly. Since it is a sum, the derivative of the whole is the sum of the derivatives. That single observation removes the need for any product or chain rule. Which rule handles a single power term?',
        },
        {
          text: 'A product of 3x² and 2x',
          correct: false,
          feedback:
            'Look closely at the symbol between the terms. Is it multiplication, or addition? The operator you see decides the rule you need.',
        },
        {
          text: 'A composition, like g(h(x))',
          correct: false,
          feedback:
            'A composition would look like (3x + 2)² — a function inside another. Here the terms sit side by side, added. Which simpler rule applies to added terms?',
        },
      ],
    },
    {
      id: 'soc-d-2',
      concept: 'Power Rule',
      question: 'Using the power rule, what does 3x² differentiate into?',
      hint: 'Multiply by the exponent, then reduce the exponent by one.',
      options: [
        {
          text: '6x',
          correct: true,
          feedback:
            'Correct: bring 2 down to multiply 3, then lower the power to 1. Now — what happens to a linear term like 2x under the same logic?',
        },
        {
          text: '2x',
          correct: false,
          feedback:
            'You lowered the exponent, but what happened to the coefficient 3? The rule says multiply by the exponent, and 2 × 3 = 6.',
        },
        {
          text: '6x²',
          correct: false,
          feedback:
            'The coefficient is right, but the exponent did not drop. The power rule always reduces the exponent by one. Try again.',
        },
      ],
    },
    {
      id: 'soc-d-3',
      concept: 'Evaluate',
      question:
        'You have f′(x) = 6x + 2. To describe the steepness at x = 1, what is your next move?',
      hint: 'Which function tells you the slope: f or f′?',
      options: [
        {
          text: 'Substitute x = 1 into f′(x), giving 8',
          correct: true,
          feedback:
            'Beautifully reasoned. The derivative is the slope factory, so you feed it the point and read the slope: 8. That means the curve climbs 8 units of output per unit of input at that instant.',
        },
        {
          text: 'Substitute x = 1 into f(x), giving 5',
          correct: false,
          feedback:
            'That gives you the height of the curve, not its steepness. Ask yourself: which of the two functions answers “how fast is it changing?”',
        },
        {
          text: 'Set f′(x) = 0 and solve',
          correct: false,
          feedback:
            'Setting the derivative to zero finds where the tangent is horizontal — a turning point, not the slope at x = 1. What operation returns a slope at a specified point?',
        },
      ],
    },
    {
      id: 'soc-d-4',
      concept: 'Meaning',
      question: 'Final check: what does f′(1) = 8 actually tell you?',
      hint: 'Think about units and the tangent line.',
      options: [
        {
          text: 'The tangent line at x = 1 has slope 8',
          correct: true,
          feedback:
            'That is the complete interpretation: 8 is the tangent slope, the instantaneous rate of change. If f measured position in metres and x measured seconds, this would be 8 metres per second. You have reconstructed the whole lesson yourself.',
        },
        {
          text: 'The function’s value at x = 1 is 8',
          correct: false,
          feedback:
            'Careful — the function value there is f(1) = 5. The derivative 8 is about steepness, not height.',
        },
        {
          text: 'The curve is concave up with a maximum at x = 1',
          correct: false,
          feedback:
            'Concavity is governed by the second derivative, and a maximum needs f′ = 0. A positive first derivative only tells you direction: increasing.',
        },
      ],
    },
  ],

  'definite-integral': [
    {
      id: 'soc-i-1',
      concept: 'Interpretation',
      question: 'What is ∫₀² (3x² + 2x) dx actually measuring?',
      hint: 'Think of infinitely many thin vertical strips.',
      options: [
        {
          text: 'The signed area under the curve from x = 0 to x = 2',
          correct: true,
          feedback:
            'Yes. The integral accumulates infinitely thin strips of height f(x) and width dx. Next question: how do we turn that infinite sum into arithmetic?',
        },
        {
          text: 'The average value of the function',
          correct: false,
          feedback:
            'The average value is the integral divided by the width of the interval — related, but the integral itself measures accumulated area. Keep the units in mind: area, not height.',
        },
        {
          text: 'The slope of the tangent at x = 2',
          correct: false,
          feedback:
            'That is a derivative question. Integrals accumulate; derivatives measure steepness. Which operation sums up infinitely many thin slices?',
        },
      ],
    },
    {
      id: 'soc-i-2',
      concept: 'Antiderivatives',
      question: 'What is an antiderivative of 3x²?',
      hint: 'Raise the exponent, divide by the new exponent.',
      options: [
        {
          text: 'x³',
          correct: true,
          feedback:
            'Right: raise the power to 3, divide by 3, and the threes cancel. Now apply the same reversal to 2x and tell me what you get before we evaluate.',
        },
        {
          text: '6x',
          correct: false,
          feedback:
            'That is the derivative, not the antiderivative. You have gone forwards instead of backwards. Try raising the exponent.',
        },
        {
          text: '3x³',
          correct: false,
          feedback:
            'Almost — you raised the power but forgot to divide by the new exponent 3. Differentiation would send 3x³ back to 9x², not 3x².',
        },
      ],
    },
    {
      id: 'soc-i-3',
      concept: 'Fundamental Theorem',
      question: 'Given F(x) = x³ + x², how do the bounds 0 and 2 enter the answer?',
      hint: 'F at the top, minus F at the bottom.',
      options: [
        {
          text: 'F(2) − F(0) = 12 − 0 = 12',
          correct: true,
          feedback:
            'Precisely. The fundamental theorem turns accumulated area into an evaluation at the endpoints. Notice that any constant of integration would cancel — which is why definite integrals never need “+ C”.',
        },
        {
          text: 'Plug both bounds into the integrand and add',
          correct: false,
          feedback:
            'The integrand is what we integrated; the bounds are applied to the antiderivative. Which function have we already built for exactly this purpose?',
        },
        {
          text: 'Divide F(2) by F(0)',
          correct: false,
          feedback:
            'Division is not the operation. The theorem is a subtraction: top evaluation minus bottom evaluation. Think of an odometer difference.',
        },
      ],
    },
    {
      id: 'soc-i-4',
      concept: 'Verification',
      question:
        'Your answer is 12. Which quick check best supports it?',
      hint: 'Bounding the region with a simple shape.',
      options: [
        {
          text: 'A triangle with base 2 and height 16 has area 16, and the region sits under it',
          correct: true,
          feedback:
            'Excellent verification instinct. 12 is below the 16-unit triangle and above zero, so it is plausible. Professionals bound first, trust later. That completes the Socratic loop.',
        },
        {
          text: 'The answer must be positive because the function starts at 0',
          correct: false,
          feedback:
            'Starting at zero does not bound the area. Use a shape you can compute exactly, like the triangle joining (0,0), (2,0) and (2,16).',
        },
        {
          text: 'Differentiate 12 to check',
          correct: false,
          feedback:
            'A definite integral is a number, so differentiating it gives zero. Instead, compare the magnitude with a geometric bound.',
        },
      ],
    },
  ],

  'lagrange-constraint': [
    {
      id: 'soc-m-1',
      concept: 'Geometry',
      question:
        'We want to maximise f(x, y) = x²y while staying on the line x + y = 6. What is the geometric signature of the optimum?',
      hint: 'Picture a contour map and a trail crossing it.',
      options: [
        {
          text: 'A level curve of f is tangent to the constraint line',
          correct: true,
          feedback:
            'That is the deep idea. Along the trail, altitude stops increasing exactly when the contour just grazes it. Tangency means the gradients are parallel. What equation expresses “parallel gradients”?',
        },
        {
          text: 'The gradient of f is zero',
          correct: false,
          feedback:
            'Zero gradient would mean the hill is flat — an unconstrained critical point, which may not lie on the trail at all. What must be true at the boundary of attainable altitude?',
        },
        {
          text: 'f is zero on the constraint',
          correct: false,
          feedback:
            'If the objective were zero everywhere on the constraint, the question would be trivial. Think about direction: at the optimum, moving along the line cannot increase f.',
        },
      ],
    },
    {
      id: 'soc-m-2',
      concept: 'Construction',
      question: 'How do we encode the constraint algebraically?',
      hint: 'One extra variable carries the constraint information.',
      options: [
        {
          text: 'ℒ = x²y + λ(x + y − 6)',
          correct: true,
          feedback:
            'Exactly. The multiplier λ is a shadow price: it measures how much the maximum would gain if the constraint constant changed. Set all three partial derivatives to zero and what constraint reappears?',
        },
        {
          text: 'ℒ = x²y · (x + y − 6)',
          correct: false,
          feedback:
            'Multiplying would create extraneous zeros — setting that to zero would happily let the constraint equal zero but destroy the objective elsewhere. The constraint is added, weighted by λ.',
        },
        {
          text: 'ℒ = x + y − 6',
          correct: false,
          feedback:
            'That is only the constraint. The Lagrangian must include the objective plus λ times the constraint. What are we trying to maximise?',
        },
      ],
    },
    {
      id: 'soc-m-3',
      concept: 'Algebra',
      question:
        'Stationarity gives 2xy + λ = 0 and x² + λ = 0. How do you proceed?',
      hint: 'Remove the nuisance parameter.',
      options: [
        {
          text: 'Subtract to get 2xy = x², hence x = 2y for x > 0',
          correct: true,
          feedback:
            'Well done. Eliminating λ gives the tangency relation. Then the constraint x + y = 6 delivers x = 4, y = 2. But what should you check before declaring victory?',
        },
        {
          text: 'Add the equations to eliminate λ',
          correct: false,
          feedback:
            'Adding gives 2xy + x² + 2λ = 0 — λ survives. Subtracting cancels λ, which is the whole point of having two equations.',
        },
        {
          text: 'Solve for λ and substitute into the objective',
          correct: false,
          feedback:
            'Substituting λ into the objective mixes the multiplier into the function being optimised. Eliminate λ to relate x and y first, then use the constraint.',
        },
      ],
    },
    {
      id: 'soc-m-4',
      concept: 'Interpretation',
      question: 'We find λ = −16 at the maximum. What does that number mean?',
      hint: 'It is a derivative with respect to the constraint constant.',
      options: [
        {
          text: 'Relaxing the constraint by one unit would raise the maximum by about 16',
          correct: true,
          feedback:
            'Precisely — λ is the shadow price of the constraint, and the negative sign shows the constraint is costing us altitude. That is why economists and engineers care about the multiplier, not just the optimum.',
        },
        {
          text: 'The maximum value of f is −16',
          correct: false,
          feedback:
            'The maximum is f(4, 2) = 32. λ is the sensitivity of that value to the constraint, not the value itself.',
        },
        {
          text: 'The constraint has no effect on the optimum',
          correct: false,
          feedback:
            'A non-zero λ is the signature of a binding constraint. If the constraint did not matter, λ would be zero.',
        },
      ],
    },
  ],

  'linear-system': [
    {
      id: 'soc-l-1',
      concept: 'Geometry',
      question: 'What does each equation in the system represent?',
      hint: 'Two variables, first powers only.',
      options: [
        {
          text: 'A straight line in the xy-plane',
          correct: true,
          feedback:
            'Yes — each equation is a line, and the solution is the single point on both. Since the slopes differ, intersection is guaranteed. What method will isolate one variable?',
        },
        {
          text: 'A parabola in the xy-plane',
          correct: false,
          feedback:
            'Look at the powers: x and y appear only to the first power, with no products. That is the signature of straight lines, not curves.',
        },
        {
          text: 'A single point',
          correct: false,
          feedback:
            'One equation with two unknowns leaves a whole line of possibilities. It takes both equations together to pin down a point.',
        },
      ],
    },
    {
      id: 'soc-l-2',
      concept: 'Elimination',
      question: 'To eliminate x, what is a smart first move?',
      hint: 'The second equation has a coefficient of 1 on x.',
      options: [
        {
          text: 'Multiply the second equation by 2, then subtract it from the first',
          correct: true,
          feedback:
            'Exactly — matching the x-coefficients at 2 sets up cancellation. What must you be careful about when subtracting 2x − 2y = 2?',
        },
        {
          text: 'Add the two equations as they are',
          correct: false,
          feedback:
            'Adding gives 3x + 2y = 13 — no variable is eliminated, so you have made no progress. You need the coefficients of one variable to match before adding or subtracting.',
        },
        {
          text: 'Substitute y = 2 into the second equation',
          correct: false,
          feedback:
            'You do not know y yet; that is what we are solving for. Guessing values is not a method. Choose an elimination strategy instead.',
        },
      ],
    },
    {
      id: 'soc-l-3',
      concept: 'Solving',
      question: 'Subtraction yields 5y = 10. What follows?',
      hint: 'One step to the first coordinate.',
      options: [
        {
          text: 'y = 2, then x − 2 = 1 gives x = 3',
          correct: true,
          feedback:
            'Correct, and you remembered to back-substitute. The solution is (3, 2). What is the final step before you would trust it in an exam?',
        },
        {
          text: 'y = 5, then x = 6',
          correct: false,
          feedback:
            'Check your division: 5y = 10 means y = 2, not 5. Then substitute into the simpler equation x − y = 1.',
        },
        {
          text: 'x = 2, then y = 3',
          correct: false,
          feedback:
            'You have swapped the variables. The equation 5y = 10 determines y, not x. Back-substitute to find x afterwards.',
        },
      ],
    },
    {
      id: 'soc-l-4',
      concept: 'Verification',
      question: 'How do you confirm (3, 2) is truly the solution?',
      hint: 'A solution must satisfy the whole system.',
      options: [
        {
          text: 'Substitute into both original equations: 12 = 12 and 1 = 1',
          correct: true,
          feedback:
            'That is the complete verification. Both rows hold, so the lines genuinely intersect at (3, 2). You have now solved and validated a linear system on your own.',
        },
        {
          text: 'Substitute into the first equation only',
          correct: false,
          feedback:
            'Satisfying one equation is necessary but not sufficient — infinitely many points lie on that line. Every original equation must hold.',
        },
        {
          text: 'Check that the numbers are positive',
          correct: false,
          feedback:
            'Positivity is not a correctness test; solutions can easily be negative. Substitute into the original equations instead.',
        },
      ],
    },
  ],

  'normal-probability': [
    {
      id: 'soc-p-1',
      concept: 'Framing',
      question:
        'X is normal with mean 500 and standard deviation 100. You want P(X > 650). What should you draw first?',
      hint: 'A picture prevents tail errors.',
      options: [
        {
          text: 'A bell curve with the right tail beyond 650 shaded',
          correct: true,
          feedback:
            'Always draw first. You have marked the mean, the threshold, and the region you want. Now: how many standard deviations above the mean is 650?',
        },
        {
          text: 'A scatter plot of test scores',
          correct: false,
          feedback:
            'We have a distribution, not paired data. A probability density curve communicates the area you are about to compute.',
        },
        {
          text: 'A bar chart of the two parameters',
          correct: false,
          feedback:
            'Parameters are not frequencies. The continuous density curve is the right object here.',
        },
      ],
    },
    {
      id: 'soc-p-2',
      concept: 'Standardisation',
      question: 'What is the z-score of 650?',
      hint: 'Subtract the mean, divide by the standard deviation.',
      options: [
        {
          text: '1.5',
          correct: true,
          feedback:
            'Yes: (650 − 500)/100 = 1.5. So 650 sits one and a half typical spreads above average. Which tail of the standard normal do you need?',
        },
        {
          text: '0.015',
          correct: false,
          feedback:
            'That comes from dividing by the variance 10,000. Standardise with the standard deviation 100, not σ².',
        },
        {
          text: '15',
          correct: false,
          feedback:
            'That is the raw difference 650 − 500. Standardisation also divides by the spread. What is σ here?',
        },
      ],
    },
    {
      id: 'soc-p-3',
      concept: 'Tails',
      question: 'Tables give Φ(1.5) ≈ 0.9332. How do you get P(X > 650)?',
      hint: 'Φ is the left tail.',
      options: [
        {
          text: '1 − 0.9332 ≈ 0.0668',
          correct: true,
          feedback:
            'Exactly. Φ measures the area below, and you want the area above, so complement it. About 6.7% of students score above 650.',
        },
        {
          text: '0.9332',
          correct: false,
          feedback:
            'That is the probability of scoring below 650 — the mirror image of what was asked. Which direction is your shaded region?',
        },
        {
          text: '1 + 0.9332',
          correct: false,
          feedback:
            'A probability cannot exceed 1, which is an immediate red flag. Tails are complements, not sums.',
        },
      ],
    },
    {
      id: 'soc-p-4',
      concept: 'Sanity check',
      question: 'Which fact best validates an answer of about 6.7%?',
      hint: '68 – 95 – 99.7.',
      options: [
        {
          text: 'The empirical rule puts roughly 16% beyond 1σ, and 6.7% is smaller still at 1.5σ',
          correct: true,
          feedback:
            'Perfect triangulation. Beyond one standard deviation lies about 16%, beyond two about 2.3%; 6.7% at 1.5σ fits neatly between. That completes the guided discovery.',
        },
        {
          text: 'The probability is positive',
          correct: false,
          feedback:
            'Positivity is necessary but far too weak a check. Compare with the empirical rule to test the magnitude.',
        },
        {
          text: '650 is larger than the mean',
          correct: false,
          feedback:
            'True, but it does not validate 6.7% specifically. Use the 68–95–99.7 rule to bound the tail.',
        },
      ],
    },
  ],

  'triangle-angles': [
    {
      id: 'soc-g-1',
      concept: 'The theorem',
      question: 'The angles are in ratio 2 : 3 : 4. What total must they add up to?',
      hint: 'Euclidean triangle.',
      options: [
        {
          text: '180°',
          correct: true,
          feedback:
            'Correct — the angle sum gives us a budget of 180°. Now, how many equal “parts” does the ratio create in total?',
        },
        {
          text: '360°',
          correct: false,
          feedback:
            '360° is the sum for a quadrilateral. A triangle’s interior angles fill exactly half a turn.',
        },
        {
          text: 'Depends entirely on the size of the triangle',
          correct: false,
          feedback:
            'Shape and size are different ideas: similar triangles of any size share the same angles. The sum is fixed at 180° in Euclidean geometry.',
        },
      ],
    },
    {
      id: 'soc-g-2',
      concept: 'Scaling',
      question: 'The ratio parts total 2 + 3 + 4 = 9. What does one part equal?',
      hint: 'Divide the full budget by the total parts.',
      options: [
        {
          text: '20°',
          correct: true,
          feedback:
            'Yes — 180 ÷ 9 = 20°. The scale factor converts ratios into degrees. What are the three angles now?',
        },
        {
          text: '60°',
          correct: false,
          feedback:
            'That is 180 ÷ 3, dividing by the number of angles rather than the number of parts. Count the parts: 2 + 3 + 4.',
        },
        {
          text: '9°',
          correct: false,
          feedback:
            'You have used the number of parts as the answer. One part is the budget divided by that total.',
        },
      ],
    },
    {
      id: 'soc-g-3',
      concept: 'Classification',
      question: 'The angles are 40°, 60° and 80°. How would you classify the triangle?',
      hint: 'Compare the largest angle with 90°, and compare the angles with each other.',
      options: [
        {
          text: 'Acute scalene',
          correct: true,
          feedback:
            'Exactly. All angles are below 90°, so it is acute; all are distinct, so no two sides match and it is scalene. You have arrived at the classification yourself.',
        },
        {
          text: 'Right scalene',
          correct: false,
          feedback:
            'A right triangle needs one angle of exactly 90°. The largest here is 80°, so it falls short.',
        },
        {
          text: 'Acute isosceles',
          correct: false,
          feedback:
            'Acute is right, but isosceles needs two equal angles. All three of 40°, 60° and 80° are different, so all sides are different too.',
        },
      ],
    },
  ],
}

/* Fallback dialogue for generated sessions: builds one guiding question per step. */
export function buildSocraticFor(session) {
  if (SOCRATIC[session.id]) return SOCRATIC[session.id]
  const base = SOCRATIC[session.id.replace('generated-', '')]
  if (base) return base

  return session.steps.slice(0, 4).map((step, i) => ({
    id: `gen-soc-${i}`,
    concept: step.eyebrow || 'Reasoning',
    question: `Let’s think about “${step.title}”. Which move fits best here?`,
    hint: step.hint || 'Read the step prompt carefully and name the rule before applying it.',
    options: [
      {
        text: step.title,
        correct: true,
        feedback: `${step.insight || 'That is the right move.'} ${
          i + 1 < session.steps.length ? 'What comes next?' : 'That completes the guided reasoning.'
        }`,
      },
      {
        text: 'Skip the setup and jump straight to the final formula',
        correct: false,
        feedback:
          'Jumping to the formula hides the reasoning, which is exactly what an exam tests. What does this step ask you to establish first?',
      },
      {
        text: 'Memorise a similar example and copy its answer',
        correct: false,
        feedback:
          'Pattern-matching fails the moment numbers or structure change. Reason from the rule instead — which rule is in play here?',
      },
    ],
  }))
}
