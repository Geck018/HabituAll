import { PageHeader } from '../components/PageHeader'
import {
  PRIMARY_CATEGORIES,
  RESEARCH_ACCURACY_NOTE,
  RESEARCH_CAVEATS,
  RESEARCH_CATEGORIES,
  RESEARCH_DISCLAIMER_FULL,
  RESEARCH_DISCLAIMER_SHORT,
  RESEARCH_SOURCES,
  sourceUrl,
  type ResearchSource,
} from '../research/sources'

function SourceCard({ source }: { source: ResearchSource }) {
  const link = sourceUrl(source)

  return (
    <article
      className={`rounded-xl border bg-surface-raised p-5 ${
        source.tier === 'secondary' ? 'border-amber-200' : 'border-border'
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-text">{source.title}</h3>
        {source.year > 0 && (
          <span className="text-sm text-text-muted">{source.year}</span>
        )}
      </div>
      <p className="mt-1 text-sm font-medium text-accent">{source.authors}</p>
      <p className="mt-3 text-sm leading-relaxed text-text">{source.summary}</p>

      {source.informs.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Informs in HabituAll
          </p>
          <ul className="mt-2 space-y-1">
            {source.informs.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-text-muted">
                <span className="text-accent" aria-hidden>
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {source.citation && (
        <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-text-muted">
          {source.citation}
        </p>
      )}

      {source.note && (
        <p className="mt-2 text-xs text-amber-800">{source.note}</p>
      )}

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
        >
          {source.doi ? `DOI: ${source.doi}` : 'View source'}
        </a>
      )}
    </article>
  )
}

export function Research() {
  const primarySources = RESEARCH_SOURCES.filter((s) => s.tier === 'primary')
  const secondarySources = RESEARCH_SOURCES.filter((s) => s.tier === 'secondary')

  return (
    <>
      <PageHeader
        title="Research"
        subtitle="Peer-reviewed sources behind HabituAll's habit-formation logic."
      />

      <section className="mb-8 space-y-4">
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <h2 className="text-base font-semibold text-text">About the science</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-muted">
            {RESEARCH_DISCLAIMER_FULL}
          </p>
        </div>
        <p className="text-xs leading-relaxed text-text-muted">{RESEARCH_ACCURACY_NOTE}</p>
      </section>

      <div className="space-y-10">
        {PRIMARY_CATEGORIES.map((categoryId) => {
          const sources = primarySources.filter((s) => s.category === categoryId)
          if (sources.length === 0) return null

          return (
            <section key={categoryId}>
              <h2 className="mb-4 text-lg font-semibold text-text">
                {RESEARCH_CATEGORIES[categoryId]}
              </h2>
              <div className="space-y-4">
                {sources.map((source) => (
                  <SourceCard key={source.id} source={source} />
                ))}
              </div>
            </section>
          )
        })}

        <section>
          <h2 className="mb-2 text-lg font-semibold text-text">
            {RESEARCH_CATEGORIES.secondary}
          </h2>
          <p className="mb-4 text-sm text-text-muted">
            These informed framing but are not primary peer-reviewed research. Where the app&apos;s
            claims rest on these (notably ADHD gamification), treat them as directionally supported,
            not settled.
          </p>
          <div className="space-y-4">
            {secondarySources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-slate-50 p-5">
          <h2 className="text-base font-semibold text-text">Honesty caveats</h2>
          <ul className="mt-3 space-y-2">
            {RESEARCH_CAVEATS.map((caveat) => (
              <li key={caveat} className="flex gap-2 text-sm text-text-muted">
                <span className="text-accent" aria-hidden>
                  ·
                </span>
                {caveat}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-10 border-t border-border pt-6 text-center text-xs text-text-muted">
        {RESEARCH_DISCLAIMER_SHORT}
      </p>
    </>
  )
}
