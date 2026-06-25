/**
 * Automaticity engine — the core progress metric for HabituAll.
 *
 * NON-NEGOTIABLE: A single missed day does NOT reset progress.
 * Research: Lally et al. 2010; 2024 Healthcare systematic review (~2,601 participants) —
 * one missed repetition does not materially affect automaticity; only long inconsistency does.
 *
 * We model automaticity as a smooth 0–100 curve that:
 *   - grows asymptotically toward 100 on each completion (large early gains, diminishing later)
 *   - dips by a small fixed amount (~1–2%) on a missed opportunity
 *   - never snaps back to zero on a single miss
 *
 * This replaces fragile streak counters entirely.
 */

/** Fraction of remaining gap closed per full completion (asymptotic approach). */
const COMPLETION_RATE = 0.12

/** Smaller gain when user completes the "tiny" low-activation version. */
const TINY_VERSION_MULTIPLIER = 0.7

/**
 * Fixed dip on a missed scheduled opportunity (~1–2%).
 * Intentionally small — one miss barely moves the curve.
 */
const MISS_DIP_POINTS = 1.5

const MIN_SCORE = 0
const MAX_SCORE = 100

/**
 * On completion: move score toward 100 asymptotically.
 *
 * Math: newScore = score + (100 - score) * effectiveRate
 *
 * Example with rate=0.12:
 *   0  → 12
 *   12 → 22.6
 *   50 → 56
 *   90 → 91.2  (diminishing returns near mastery)
 */
export function automaticityOnComplete(
  currentScore: number,
  usedTinyVersion: boolean,
): number {
  const rate = usedTinyVersion
    ? COMPLETION_RATE * TINY_VERSION_MULTIPLIER
    : COMPLETION_RATE

  const gap = MAX_SCORE - clamp(currentScore)
  const gain = gap * rate
  return round(clamp(currentScore + gain))
}

/**
 * On a missed scheduled opportunity: subtract a small fixed dip.
 * Score is floored at MIN_SCORE but NEVER reset to zero unless already there.
 *
 * A user at 73% who misses once → ~71.5%, not 0%.
 */
export function automaticityOnMiss(currentScore: number): number {
  return round(Math.max(MIN_SCORE, currentScore - MISS_DIP_POINTS))
}

/** Honest timeline copy — median ~2 months, highly variable (Lally: 18–254 days). */
export function automaticityTimelineMessage(score: number): string {
  if (score >= 85) {
    return 'This habit is becoming automatic for you. Keep going — consistency still helps it stick.'
  }
  if (score >= 50) {
    return 'You are past the halfway mark. Research suggests automaticity often takes around 2 months on average, but anywhere from 18 to 254+ days is normal.'
  }
  if (score >= 20) {
    return 'Early progress. Most people need roughly 2 months of repetition — highly variable — before a habit feels automatic.'
  }
  return 'You are building momentum. There is no fixed "21 days" finish line — automaticity grows gradually and differs for everyone.'
}

export function automaticityLabel(score: number): string {
  if (score >= 85) return 'Highly automatic'
  if (score >= 60) return 'Becoming automatic'
  if (score >= 35) return 'Building'
  if (score >= 15) return 'Starting'
  return 'New'
}

function clamp(n: number): number {
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, n))
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}
