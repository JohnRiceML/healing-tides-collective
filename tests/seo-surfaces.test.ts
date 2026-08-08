import {readFile} from 'node:fs/promises'
import {describe, expect, it} from 'vitest'

describe('primary SEO surfaces', () => {
  it('keeps the homepage server-owned metadata and a real first-page H1', async () => {
    const [shell, experience] = await Promise.all([
      readFile('app/page.tsx', 'utf8'),
      readFile('app/HomePageClient.tsx', 'utf8'),
    ])
    expect(shell).toContain('alternates: {canonical: `${SITE_URL}/`}')
    expect(experience).toContain('const Heading = isFirst ? "h1" : "h2"')
  })

  it('keeps canonicals on every primary static sitemap route', async () => {
    const routes = ['get-matched', 'for-practitioners', 'crisis']
    for (const route of routes) {
      const source = await readFile(`app/${route}/page.tsx`, 'utf8')
      expect(source).toContain(`\`${'${SITE_URL}'}/${route}\``)
      expect(source).toContain('alternates:')
    }
  })

  it('allows crawlers to receive noindex on public account doors', async () => {
    for (const route of ['join/[[...sign-up]]', 'sign-in/[[...sign-in]]', 'save-account/[[...sign-up]]']) {
      const source = await readFile(`app/${route}/page.tsx`, 'utf8')
      expect(source).toContain('robots: { index: false, follow: true }')
    }
  })
})
