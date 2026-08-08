import {describe, expect, it} from 'vitest'
import {
  SOMATIC_SERIES,
  cleanPerson,
  isNoraAuthor,
  isTherapyCostRelevant,
  journalBodyForDisplay,
  journalPresentation,
} from '@/lib/journal-presentation'

describe('journal presentation', () => {
  it('gives each Somatic Series URL a descriptive title without changing its slug', () => {
    expect(SOMATIC_SERIES.map((entry) => entry.slug)).toEqual([
      'somatic-series-part-1',
      'somatic-series-part-2',
      'somatic-series-part-3',
    ])
    expect(journalPresentation('somatic-series-part-2').title).toBe(
      'Polyvagal Theory: Understanding Three Nervous System States',
    )
    expect(journalPresentation('somatic-series-part-2').description).toContain('scientifically debated')
  })

  it('shows the therapy-cost path only on articles where cost is a natural next step', () => {
    expect(isTherapyCostRelevant('somatic-series-part-1')).toBe(true)
    expect(
      isTherapyCostRelevant('finding-a-therapist-in-minneapolis-and-st-paul-why-is-it-so-difficult'),
    ).toBe(true)
    expect(isTherapyCostRelevant('the-human-behind-the-therapist-support')).toBe(false)
    expect(
      isTherapyCostRelevant(
        'finding-reflection-in-the-season-what-cancer-season-is-teaching-me-about-slowing-down',
      ),
    ).toBe(false)
  })

  it('trims CMS titles and person fields at the display boundary', () => {
    expect(journalPresentation('another-post', ' A useful title ')).toMatchObject({
      title: 'A useful title',
    })
    expect(cleanPerson(' Founder ')).toBe('Founder')
    expect(cleanPerson('  ')).toBeUndefined()
  })

  it('puts a visible currency note on the prelaunch Twin Cities article', () => {
    const entry = journalPresentation(
      'finding-a-therapist-in-minneapolis-and-st-paul-why-is-it-so-difficult',
      'legacy title',
    )
    expect(entry.title).toBe('Finding a Therapist in Minneapolis and Saint Paul')
    expect(entry.editorialContext).toContain('Updated August 2026')
    expect(entry.editorialContext).toContain('does not currently guarantee')
    expect(entry.showCrisisLink).toBe(true)
  })

  it('does not promote the seasonal reflection on the authority rail before safety review', () => {
    expect(
      journalPresentation(
        'finding-reflection-in-the-season-what-cancer-season-is-teaching-me-about-slowing-down',
      ).authorityEligible,
    ).toBe(false)
  })

  it('removes duplicate opening headings from known Somatic entries', () => {
    const body = [
      {_type: 'block', style: 'h1', children: [{text: 'Somatic Series — Part 2'}]},
      {_type: 'block', style: 'h2', children: [{text: 'Understanding the Three States'}]},
      {_type: 'block', style: 'normal', children: [{text: 'The article begins here.'}]},
    ]
    expect(journalBodyForDisplay('somatic-series-part-2', body)).toEqual([body[2]])
  })

  it('suppresses only the known prelaunch blocks in the Twin Cities article', () => {
    const current = {_type: 'block', children: [{text: 'That is why I created Healing Tides.'}]}
    const stale = {_type: 'block', children: [{text: 'Stay tuned—we\'ll be connecting people soon.'}]}
    expect(
      journalBodyForDisplay(
        'finding-a-therapist-in-minneapolis-and-st-paul-why-is-it-so-difficult',
        [current, stale],
      ),
    ).toEqual([current])
  })

  it('recognizes Nora by stable author slug and tolerates the legacy spaced name', () => {
    expect(isNoraAuthor({slug: 'nora-hollenkamp', name: 'Someone else'})).toBe(true)
    expect(isNoraAuthor({name: ' Nora Hollenkamp '})).toBe(true)
    expect(isNoraAuthor({slug: 'maya-chen', name: 'Maya Chen'})).toBe(false)
  })
})

describe('legacy Nora route', () => {
  it('permanently redirects only the old same-person profile to the canonical author page', async () => {
    const config = (await import('@/next.config')).default
    const redirects = await config.redirects?.()
    expect(redirects).toContainEqual({
      source: '/practitioners/nora-l-hollenkamp',
      destination: '/about',
      permanent: true,
    })
  })
})
