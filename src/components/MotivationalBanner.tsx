import type { UserPersonalization } from '../domain/types'

type MotivationalBannerProps = {
  personalization: UserPersonalization
}

export function MotivationalBanner({ personalization }: MotivationalBannerProps) {
  if (!personalization?.motivationalText?.trim()) return null

  return (
    <blockquote className="mb-6 rounded-xl border border-border bg-surface-raised/95 p-4 backdrop-blur-sm">
      <p className="text-base leading-relaxed text-text">&ldquo;{personalization.motivationalText}&rdquo;</p>
      {personalization.motivationalAuthor?.trim() && (
        <footer className="mt-2 text-sm text-text-muted">— {personalization.motivationalAuthor}</footer>
      )}
    </blockquote>
  )
}
