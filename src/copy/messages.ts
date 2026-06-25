/**
 * Product copy — NON-NEGOTIABLE: no streak-shaming, no guilt, resume-focused.
 */
import type { MergedProfileBehaviour } from '../profiles/profileConfig'

const RESUME_MESSAGES = {
  energetic: [
    'Missed yesterday? No problem — pick up right here.',
    'One quiet day does not undo your progress. Resume when you are ready.',
  ],
  warm: [
    'It is okay. Your automaticity score dipped only slightly. You can resume tomorrow.',
    'A rest day is not a failure. Your progress is still here.',
  ],
  literal: [
    'You did not complete this habit on the previous day. Your automaticity decreased by about 1–2%. You may resume now.',
    'Missed opportunity recorded. Progress was not reset. Continue when ready.',
  ],
  reassuring: [
    'That is alright — small steps still count. Ready to try again?',
    'Your progress is safe. One missed day only nudged your score down slightly.',
  ],
  neutral: [
    'Resume tomorrow — your automaticity curve continues from where you left off.',
    'A missed day does not reset your progress. Pick back up when you can.',
  ],
}

const COMPLETION_MESSAGES = {
  energetic: ['Nice! That counts.', 'Done — momentum stays with you.', 'You showed up. That matters.'],
  warm: ['You did it. That is enough for today.', 'Well done — one meaningful step.', 'Completed. Be kind to yourself.'],
  literal: ['Habit marked complete. Automaticity increased.', 'Completion recorded.'],
  reassuring: ['Small win secured. You are safe to pause now.', 'One step done — that is real progress.'],
  neutral: ['Completed.', 'Logged. Keep going at your pace.'],
}

const NOT_TODAY_MESSAGES = {
  energetic: ['Not today — totally fine. See you next cue.'],
  warm: ['Rest is allowed. Your score only dipped a little.'],
  literal: ['Skipped for today. Automaticity decreased by about 1–2%. Not reset.'],
  reassuring: ['Okay. No pressure. Resume when it feels manageable.'],
  neutral: ['Not today. Progress preserved — resume when ready.'],
}

export function getResumeMessage(style: MergedProfileBehaviour['copyStyle']): string {
  const pool = RESUME_MESSAGES[style]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getCompletionMessage(style: MergedProfileBehaviour['copyStyle']): string {
  const pool = COMPLETION_MESSAGES[style]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getNotTodayMessage(style: MergedProfileBehaviour['copyStyle']): string {
  const pool = NOT_TODAY_MESSAGES[style]
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Never promise 21 days or fixed timelines */
export const HONEST_TIMELINE_BANNER =
  'Automaticity typically takes around 2 months on average — but anywhere from 18 to 254+ days is normal. There is no fixed finish line.'

export const ANTI_STREAK_NOTICE =
  'HabituAll tracks automaticity, not streaks. A missed day does not reset your progress.'
