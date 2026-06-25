import type { SafetyCategory } from './contentModeration'

export const SAFETY_PRIVACY_NOTE =
  'Safety checks run only on this device. Nothing is sent to a server or shared with anyone.'

const CRISIS_LINES =
  'If you are in crisis, please contact local emergency services or a crisis helpline (UK: Samaritans 116 123 · US & Canada: 988).'

export function safetyBlockMessage(category: SafetyCategory): string {
  switch (category) {
    case 'self_harm':
      return `This content can't be saved here. HabituAll isn't able to support habits or notes involving self-harm. ${CRISIS_LINES}`
    case 'harm_others':
      return "This content can't be saved. HabituAll blocks habits or notes that describe harming other people."
    case 'dangerous_activity':
      return "This content can't be saved. HabituAll blocks habits that describe dangerous or illegal activity."
  }
}
