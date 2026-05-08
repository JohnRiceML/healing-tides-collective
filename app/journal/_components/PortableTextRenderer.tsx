import Image from 'next/image'
import {PortableText, type PortableTextComponents} from '@portabletext/react'
import {urlFor} from '@/sanity/lib/image'

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
  },
  marks: {
    link: ({value, children}) => {
      const href = value?.href ?? '#'
      const isExternal = /^https?:\/\//.test(href)
      return (
        <a
          href={href}
          {...(isExternal ? {target: '_blank', rel: 'noreferrer'} : {})}
          className="text-ocean underline decoration-ocean/30 underline-offset-4 transition-colors hover:decoration-ocean"
        >
          {children}
        </a>
      )
    },
    strong: ({children}) => <strong className="font-medium text-charcoal">{children}</strong>,
    em: ({children}) => <em className="font-display italic">{children}</em>,
  },
  block: {
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
