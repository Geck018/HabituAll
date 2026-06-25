/**
 * Local-only content safety checks.
 *
 * Runs entirely on the user's device — no network calls, logging, or reporting.
 * Blocks self-harm, violence toward others, and clearly dangerous habit framing
 * on replacement-behaviour fields only. The optional `leavingBehind` field (what the
 * user is quitting) is intentionally exempt so recovery goals can be named honestly.
 *
 * Not a substitute for professional moderation at scale; a first-line guard for
 * an open habit platform.
 */
import { safetyBlockMessage } from './messages'

export type SafetyCategory = 'self_harm' | 'harm_others' | 'dangerous_activity'

export type ContentSafetyResult =
  | { safe: true }
  | { safe: false; category: SafetyCategory; message: string }

/** Normalise text to catch simple obfuscation (spacing, leetspeak, zero-width chars). */
export function normalizeForSafetyCheck(raw: string): string {
  let text = raw.toLowerCase()
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '')
  text = text.replace(/[@4]/g, 'a')
  text = text.replace(/0/g, 'o')
  text = text.replace(/1/g, 'i')
  text = text.replace(/3/g, 'e')
  text = text.replace(/5/g, 's')
  text = text.replace(/7/g, 't')
  text = text.replace(/[$]/g, 's')
  text = text.replace(/[!]/g, 'i')
  text = text.replace(/[^a-z0-9\s]/g, ' ')
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

type PatternRule = {
  category: SafetyCategory
  /** Applied to normalised text */
  pattern: RegExp
}

/**
 * Phrase-oriented patterns to limit false positives (e.g. "haircut", "shoot hoops").
 * Applied after normalisation.
 */
const SAFETY_RULES: PatternRule[] = [
  // ── Self-harm & suicide ──
  { category: 'self_harm', pattern: /\b(suicid|su1c1d)\w*/ },
  { category: 'self_harm', pattern: /\bself\s*harm\b/ },
  { category: 'self_harm', pattern: /\b(kill|hurt|harm|cut|hang|stab)\s+(my|ur|your)\s*self\b/ },
  { category: 'self_harm', pattern: /\b(end|take)\s+(my|ur|your)\s+life\b/ },
  { category: 'self_harm', pattern: /\bwant\s+to\s+die\b/ },
  { category: 'self_harm', pattern: /\bwish\s+(i\s+)?(was|were)\s+dead\b/ },
  { category: 'self_harm', pattern: /\bbetter\s+off\s+dead\b/ },
  { category: 'self_harm', pattern: /\bno\s+reason\s+to\s+live\b/ },
  { category: 'self_harm', pattern: /\boverdose\b/ },
  { category: 'self_harm', pattern: /\b(od|o d)\s+(on\s+)?pills\b/ },
  { category: 'self_harm', pattern: /\bcut\s+(my|ur|your)\s+(wrists|arms|legs|skin)\b/ },
  { category: 'self_harm', pattern: /\bstarve\s+(my|ur|your)self\b/ },
  { category: 'self_harm', pattern: /\b(purge|purging)\s+(my|ur|your)self\b/ },
  { category: 'self_harm', pattern: /\bpro\s*ana\b/ },
  { category: 'self_harm', pattern: /\bthinspo\b/ },
  { category: 'self_harm', pattern: /\bunalive\s+(my|ur|your)self\b/ },
  { category: 'self_harm', pattern: /\bsewerslide\b/ },
  { category: 'self_harm', pattern: /\bkms\b/ },
  { category: 'self_harm', pattern: /\bcommit\s+suicide\b/ },

  // ── Harm to others ──
  { category: 'harm_others', pattern: /\b(kill|murder|hurt|harm|attack|stab|shoot)\s+(him|her|them|people|someone|everybody|everyone|others)\b/ },
  { category: 'harm_others', pattern: /\b(mass|school)\s+shoot(ing|er)?\b/ },
  { category: 'harm_others', pattern: /\bshoot\s+up\s+(a\s+)?(school|place|building)\b/ },
  { category: 'harm_others', pattern: /\b(make|build|plant)\s+(a\s+)?bomb\b/ },
  { category: 'harm_others', pattern: /\bpoison\s+(him|her|them|people|someone)\b/ },
  { category: 'harm_others', pattern: /\bstrangle\s+(him|her|them|people|someone)\b/ },

  // ── Dangerous / illegal activity framing as a habit ──
  { category: 'dangerous_activity', pattern: /\b(drive|driving)\s+drunk\b/ },
  { category: 'dangerous_activity', pattern: /\bdrunk\s+driv(e|ing)\b/ },
  { category: 'dangerous_activity', pattern: /\bchoking\s+game\b/ },
  { category: 'dangerous_activity', pattern: /\bself\s+asphyx\w*/ },
]

function matchRule(normalized: string): PatternRule | null {
  for (const rule of SAFETY_RULES) {
    if (rule.pattern.test(normalized)) return rule
  }
  return null
}

/** Check one or more user-authored strings. Empty / whitespace-only values are ignored. */
export function checkContentSafety(
  ...texts: Array<string | undefined | null>
): ContentSafetyResult {
  for (const raw of texts) {
    if (!raw?.trim()) continue
    const normalized = normalizeForSafetyCheck(raw)
    if (!normalized) continue
    const hit = matchRule(normalized)
    if (hit) {
      return {
        safe: false,
        category: hit.category,
        message: safetyBlockMessage(hit.category),
      }
    }
  }
  return { safe: true }
}

export function contentSafetyError(
  ...texts: Array<string | undefined | null>
): string | null {
  const result = checkContentSafety(...texts)
  return result.safe ? null : result.message
}

/** Habit fields that describe the replacement behaviour — moderated. */
export function checkHabitReplacementContent(input: {
  behaviour: string
  cueAnchor: string
  cueTime?: string
  cuePlace?: string
  cueEvent?: string
  tinyVersion: string
  valuesTag?: string
  /** Exempt — old habit / urge being quit; not moderated */
  leavingBehind?: string
}): string | null {
  return contentSafetyError(
    input.behaviour,
    input.cueAnchor,
    input.cueTime,
    input.cuePlace,
    input.cueEvent,
    input.tinyVersion,
    input.valuesTag,
  )
}
