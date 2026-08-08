import Image from 'next/image'
import {PortableText, type PortableTextComponents} from '@portabletext/react'
import {urlFor} from '@/sanity/lib/image'

type TableRow = {cells?: string[]}
type TableValue = {columns?: string[]; rows?: TableRow[]; caption?: string}
type YouTubeValue = {url?: string}
type QaValue = {question?: string; answer?: string}
type FaqItem = {question?: string; answer?: string}
type FaqSectionValue = {title?: string; faqs?: FaqItem[]}

function extractYouTubeId(url: string | undefined): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  return match?.[1] ?? null
}

const components: PortableTextComponents = {
  types: {
    image: ({value}) => {
      if (!value?.asset) return null
      const src = urlFor(value).width(1600).fit('max').auto('format').url()
      return (
        <figure className="my-12">
          <div className="relative w-full overflow-hidden rounded-lg bg-sand-deep">
            <Image
              src={src}
              alt={value.alt ?? ''}
              width={1600}
              height={900}
              sizes="(min-width: 768px) 672px, 100vw"
              className="h-auto w-full"
            />
          </div>
          {value.caption && (
            <figcaption className="meta mt-4 text-ink-muted">{value.caption}</figcaption>
          )}
        </figure>
      )
    },
    table: ({value}: {value: TableValue}) => {
      const columns = value?.columns ?? []
      const rows = value?.rows ?? []
      if (!columns.length && !rows.length) return null
      return (
        <figure className="my-12 overflow-x-auto">
          <table className="w-full border-collapse text-[16px] leading-[1.6] text-ink-soft">
            {columns.length > 0 && (
              <thead>
                <tr className="border-b border-rule">
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="meta px-4 py-3 text-left font-display text-charcoal"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-rule/60">
                  {(row?.cells ?? []).map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {value.caption && (
            <figcaption className="meta mt-4 text-ink-muted">{value.caption}</figcaption>
          )}
        </figure>
      )
    },
    youtube: ({value}: {value: YouTubeValue}) => {
      const videoId = extractYouTubeId(value?.url)
      if (!videoId) return null
      return (
        <figure className="my-12">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-charcoal">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title="YouTube video"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </figure>
      )
    },
    qa: ({value}: {value: QaValue}) => {
      if (!value?.question && !value?.answer) return null
      return (
        <aside className="my-12 rounded-lg border border-rule bg-sand-deep/40 p-6 md:p-8">
          {value.question && (
            <p className="meta text-teal">Q · {value.question}</p>
          )}
          {value.answer && (
            <p className="mt-3 text-[17px] leading-[1.7] text-ink-soft">{value.answer}</p>
          )}
        </aside>
      )
    },
    faqSection: ({value}: {value: FaqSectionValue}) => {
      const faqs = value?.faqs ?? []
      if (!faqs.length) return null
      return (
        <section className="my-16">
          {value.title && (
            <h2 className="font-display text-[clamp(24px,2.6vw,32px)] leading-[1.15] tracking-[-0.02em] text-charcoal">
              {value.title}
            </h2>
          )}
          <dl className="mt-6 divide-y divide-rule">
            {faqs.map((faq, i) => (
              <div key={i} className="py-6">
                {faq?.question && (
                  <dt className="font-display text-[18px] leading-[1.4] text-charcoal">
                    {faq.question}
                  </dt>
                )}
                {faq?.answer && (
                  <dd className="mt-3 text-[17px] leading-[1.7] text-ink-soft">{faq.answer}</dd>
                )}
              </div>
            ))}
          </dl>
        </section>
      )
    },
  },
  marks: {
    link: ({value, children}) => {
      const href = value?.href ?? '#'
      const isExternal = /^https?:\/\//.test(href)
      const openInNewTab = value?.blank === true || (value?.blank === undefined && isExternal)
      return (
        <a
          href={href}
          {...(openInNewTab ? {target: '_blank', rel: 'noreferrer'} : {})}
          className="text-ocean underline decoration-ocean/30 underline-offset-4 transition-colors hover:decoration-ocean"
        >
          {children}
        </a>
      )
    },
    strong: ({children}) => <strong className="font-medium text-charcoal">{children}</strong>,
    em: ({children}) => <em className="font-display italic">{children}</em>,
    code: ({children}) => (
      <code className="rounded bg-sand-deep px-1.5 py-0.5 font-mono text-[0.92em] text-charcoal">
        {children}
      </code>
    ),
  },
  block: {
    h1: ({children}) => (
      <h2 className="font-display mt-20 text-[clamp(32px,3.6vw,48px)] leading-[1.05] tracking-[-0.025em] text-charcoal">
        {children}
      </h2>
    ),
    h2: ({children}) => (
      <h2 className="font-display mt-16 text-[clamp(28px,3vw,40px)] leading-[1.1] tracking-[-0.02em] text-charcoal">
        {children}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className="font-display mt-12 text-[clamp(22px,2.4vw,30px)] leading-[1.2] tracking-[-0.015em] text-charcoal">
        {children}
      </h3>
    ),
    blockquote: ({children}) => (
      <blockquote className="my-12 border-l border-teal pl-6">
        <div className="font-display text-[clamp(22px,2.6vw,28px)] italic leading-[1.4] text-charcoal/90">
          {children}
        </div>
      </blockquote>
    ),
    normal: ({children}) => (
      <p className="my-6 text-[18px] leading-[1.75] text-ink-soft md:text-[19px]">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({children}) => (
      <ul className="my-6 list-disc space-y-3 pl-6 text-[18px] leading-[1.75] text-ink-soft marker:text-teal">
        {children}
      </ul>
    ),
    number: ({children}) => (
      <ol className="my-6 list-decimal space-y-3 pl-6 text-[18px] leading-[1.75] text-ink-soft marker:text-teal marker:font-display">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({children}) => <li className="pl-2">{children}</li>,
    number: ({children}) => <li className="pl-2">{children}</li>,
  },
}

export function PortableTextRenderer({
  value,
}: {
  value: Parameters<typeof PortableText>[0]['value']
}) {
  return <PortableText value={value} components={components} />
}
