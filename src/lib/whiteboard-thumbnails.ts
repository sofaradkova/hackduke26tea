/**
 * Generates fake whiteboard thumbnail SVGs as data URIs.
 * Each student gets a deterministic but unique "whiteboard" based on their ID,
 * problem set, and progress.
 */

function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return () => {
    hash = (hash * 16807 + 0) % 2147483647
    return (hash & 0x7fffffff) / 2147483647
  }
}

const HANDWRITING_COLORS = ['#1a1a2e', '#2d3436', '#0d3b66', '#1b4332']

const MATH_EXPRESSIONS = [
  'x = (-b ± √(b²-4ac)) / 2a',
  'f(x) = 3x² + 7x - 12',
  'x² - 5x + 6 = 0',
  '(x - 2)(x - 3) = 0',
  'x = 2, x = 3',
  'Discriminant: b² - 4ac',
  'Δ = 49 - 4(3)(-12)',
  'Δ = 49 + 144 = 193',
  'x = (-7 ± √193) / 6',
  'Step 1: Identify a, b, c',
  'a = 3, b = 7, c = -12',
  'Step 2: Calculate Δ',
  'Step 3: Apply formula',
  'Check: f(2) = 12 + 14 - 12 = 14 ≠ 0',
  'y = mx + b',
  'slope = Δy/Δx = (4-1)/(3-0)',
  'm = 1, b = 1',
  'f\'(x) = 6x + 7',
]

const PHYSICS_EXPRESSIONS = [
  'F = ma',
  'F₁ = 5kg × 9.8m/s²',
  'F₁ = 49N',
  'ΣF = F_applied - F_friction',
  'a = ΣF / m',
  'v = v₀ + at',
  'v = 0 + (2.5)(4)',
  'v = 10 m/s',
  'KE = ½mv²',
  'KE = ½(5)(10²) = 250J',
  'W = Fd cos θ',
  'μ = F_friction / F_normal',
  'g = 9.8 m/s²',
  'p = mv = 5 × 10 = 50 kg·m/s',
  'Step 1: Free body diagram',
  'Step 2: Sum forces in x',
  'Step 3: Solve for a',
]

const ENGLISH_EXPRESSIONS = [
  'Thesis: Hamlet\'s indecision',
  'reflects universal human doubt',
  '',
  'Topic sentence: Act III',
  'reveals internal conflict',
  '"To be or not to be"',
  'shows existential crisis',
  '',
  'Evidence: Soliloquy (III.i)',
  'Analysis: paralysis as',
  'metaphor for modern anxiety',
  '',
  'Counter: Some argue action',
  'in Act V disproves this',
  'Rebuttal: too late — tragedy',
  'was already inevitable',
  '',
  'Conclusion: Shakespeare uses',
  'delay as dramatic device',
]

const CS_EXPRESSIONS = [
  'function mergeSort(arr):',
  '  if len(arr) <= 1: return arr',
  '  mid = len(arr) // 2',
  '  left = mergeSort(arr[:mid])',
  '  right = mergeSort(arr[mid:])',
  '  return merge(left, right)',
  '',
  'function merge(L, R):',
  '  result = []',
  '  while L and R:',
  '    if L[0] <= R[0]:',
  '      result.append(L.pop(0))',
  '    else:',
  '      result.append(R.pop(0))',
  '  return result + L + R',
  '',
  'Time: O(n log n)',
  'Space: O(n)',
  '[38, 27, 43, 3, 9, 82, 10]',
]

function getExpressionsForSubject(problemSet: string): string[] {
  if (problemSet.includes('Quadratic') || problemSet.includes('Equation')) return MATH_EXPRESSIONS
  if (problemSet.includes('Newton') || problemSet.includes('Physics') || problemSet.includes('Lab')) return PHYSICS_EXPRESSIONS
  if (problemSet.includes('Essay') || problemSet.includes('Hamlet') || problemSet.includes('Literature')) return ENGLISH_EXPRESSIONS
  if (problemSet.includes('Sort') || problemSet.includes('Algorithm') || problemSet.includes('CS')) return CS_EXPRESSIONS
  return MATH_EXPRESSIONS
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateScribblePath(rand: () => number, startX: number, startY: number): string {
  const points: string[] = [`M ${startX} ${startY}`]
  let x = startX
  let y = startY
  const segments = 3 + Math.floor(rand() * 4)
  for (let i = 0; i < segments; i++) {
    x += 20 + rand() * 60
    y += -10 + rand() * 20
    const cx = x - 15 + rand() * 30
    const cy = y - 15 + rand() * 30
    points.push(`Q ${cx} ${cy} ${x} ${y}`)
  }
  return points.join(' ')
}

export function generateWhiteboardSvg(
  studentId: string,
  problemSet: string,
  progressPercent: number,
  isFlagged: boolean,
): string {
  const rand = seededRandom(studentId)
  const expressions = getExpressionsForSubject(problemSet)
  const color = HANDWRITING_COLORS[Math.floor(rand() * HANDWRITING_COLORS.length)]

  // How many lines to show based on progress
  const lineCount = Math.max(2, Math.floor((progressPercent / 100) * expressions.length))
  const visibleExpressions = expressions.slice(0, lineCount)

  // Slight random rotation for each line to mimic handwriting
  const lines = visibleExpressions.map((expr, i) => {
    const x = 20 + rand() * 15
    const y = 28 + i * 22
    const rotation = -1.5 + rand() * 3
    const size = 13 + rand() * 3
    return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" transform="rotate(${rotation.toFixed(1)} ${x} ${y})" font-family="'Caveat', 'Segoe Script', 'Comic Sans MS', cursive" opacity="${0.8 + rand() * 0.2}">${escapeXml(expr)}</text>`
  })

  // Add some underlines/circles for emphasis
  const decorations: string[] = []
  if (rand() > 0.4 && visibleExpressions.length > 2) {
    const lineIdx = 1 + Math.floor(rand() * Math.min(3, visibleExpressions.length - 1))
    const uy = 30 + lineIdx * 22
    decorations.push(
      `<line x1="20" y1="${uy}" x2="${100 + rand() * 150}" y2="${uy + rand() * 3}" stroke="${color}" stroke-width="1.5" opacity="0.4" stroke-dasharray="${rand() > 0.5 ? '4 3' : 'none'}"/>`,
    )
  }

  // A circle around an answer
  if (rand() > 0.5 && visibleExpressions.length > 4) {
    const cy = 24 + Math.floor(rand() * 3 + 3) * 22
    decorations.push(
      `<ellipse cx="${120 + rand() * 80}" cy="${cy}" rx="${40 + rand() * 30}" ry="14" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.3" transform="rotate(${-3 + rand() * 6} ${140} ${cy})"/>`,
    )
  }

  // Scribble/cross-out if flagged
  if (isFlagged && visibleExpressions.length > 3) {
    const scribbleY = 24 + Math.floor(rand() * 2 + 2) * 22
    const path = generateScribblePath(rand, 15, scribbleY)
    decorations.push(
      `<path d="${path}" fill="none" stroke="#c62828" stroke-width="2" opacity="0.5"/>`,
    )
    // Red question mark
    decorations.push(
      `<text x="${320 + rand() * 50}" y="${scribbleY + 5}" font-size="24" fill="#c62828" font-family="'Caveat', cursive" opacity="0.7">?</text>`,
    )
  }

  // Grid lines (faint)
  const gridLines: string[] = []
  for (let y = 22; y < 300; y += 22) {
    gridLines.push(`<line x1="0" y1="${y}" x2="400" y2="${y}" stroke="#b8d4e3" stroke-width="0.5" opacity="0.3"/>`)
  }
  // Red margin line
  gridLines.push(`<line x1="14" y1="0" x2="14" y2="300" stroke="#e8a0a0" stroke-width="1" opacity="0.4"/>`)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#f8f6f0"/>
  ${gridLines.join('\n  ')}
  ${lines.join('\n  ')}
  ${decorations.join('\n  ')}
</svg>`

  // Use btoa for browser compatibility (works in both Node 16+ and browsers)
  const encoded = typeof btoa === 'function'
    ? btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${encoded}`
}
