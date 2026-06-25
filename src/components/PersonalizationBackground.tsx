import type { UserPersonalization } from '../domain/types'

type PersonalizationBackgroundProps = {
  personalization: UserPersonalization
}

export function PersonalizationBackground({ personalization }: PersonalizationBackgroundProps) {
  if (!personalization?.backgroundImage) return null

  const dim = personalization.backgroundDim ?? 0.45

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${personalization.backgroundImage})` }}
      />
      <div
        className="absolute inset-0 bg-slate-900"
        style={{ opacity: dim }}
      />
    </div>
  )
}
