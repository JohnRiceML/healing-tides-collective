import {readFile} from 'node:fs/promises'
import {describe, expect, it} from 'vitest'

describe('Nora content flow release contracts', () => {
  it('keeps the worksheet private by construction', async () => {
    const source = await readFile(
      'app/resources/first-therapist-call-worksheet/FirstCallWorksheet.tsx',
      'utf8',
    )
    expect(source).not.toContain('localStorage')
    expect(source).not.toContain('sessionStorage')
    expect(source).not.toContain('fetch(')
    expect(source).not.toContain('<textarea')
    expect(source).toContain('navigator.clipboard.writeText')
    expect(source).toContain('window.print()')
  })

  it('keeps the worksheet indexable, canonical, and in the sitemap', async () => {
    const [page, sitemap] = await Promise.all([
      readFile('app/resources/first-therapist-call-worksheet/page.tsx', 'utf8'),
      readFile('app/sitemap.ts', 'utf8'),
    ])
    expect(page).toContain('alternates: {canonical: URL}')
    expect(page).toContain('"@type": "WebPage"')
    expect(page).not.toContain('robots:')
    expect(sitemap).toContain('/resources/first-therapist-call-worksheet')
  })

  it('keeps unapproved Nora articles visibly gated outside production content', async () => {
    for (const file of [
      'docs/content/drafts/first-therapy-consultation-minnesota-review.md',
      'docs/content/drafts/somatic-therapy-vs-talk-therapy-review.md',
    ]) {
      const draft = await readFile(file, 'utf8')
      expect(draft).toContain('Not publishable until Nora')
      expect(draft).toContain('input required')
      expect(draft).toContain('Automatic rejection conditions')
    }
  })

  it('links the worksheet only from the relevant reader journey', async () => {
    const companion = await readFile('app/journal/_components/JournalCompanion.tsx', 'utf8')
    expect(companion).toContain('isFirstCallWorksheetRelevant')
    expect(companion).toContain('/resources/first-therapist-call-worksheet')
  })
})
