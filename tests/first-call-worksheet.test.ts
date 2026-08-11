import {describe, expect, it} from 'vitest'

import {
  MAX_WORKSHEET_FOCUSES,
  WORKSHEET_FOCUSES,
  buildWorksheetQuestions,
} from '@/lib/first-call-worksheet'

const baseContext = {meeting: 'unsure', format: 'unsure', payment: 'unsure'} as const

describe('first-call worksheet question builder', () => {
  it('returns a useful core set when every optional choice is skipped', () => {
    const questions = buildWorksheetQuestions([], {})
    expect(questions.length).toBeGreaterThanOrEqual(4)
    expect(questions.length).toBeLessThanOrEqual(6)
    expect(questions.map((question) => question.id)).toEqual(
      expect.arrayContaining(['appointment-kind', 'first-few-sessions', 'feedback', 'next-step']),
    )
  })

  it('does not infer context when every optional context choice is skipped', () => {
    const questions = buildWorksheetQuestions(['cost'], {})
    expect(questions.map((question) => question.id)).not.toEqual(
      expect.arrayContaining(['online-privacy', 'insurance', 'self-pay', 'first-session']),
    )
  })

  it('adds selected topics in stable order without duplicates and caps the result', () => {
    const first = buildWorksheetQuestions(['somatic', 'cost', 'approach', 'somatic'], baseContext)
    const second = buildWorksheetQuestions(['somatic', 'cost', 'approach', 'somatic'], baseContext)
    expect(first).toEqual(second)
    expect(new Set(first.map((question) => question.id)).size).toBe(first.length)
    expect(first.length).toBeLessThanOrEqual(9)
    expect(first.map((question) => question.id)).toEqual(
      expect.arrayContaining(['somatic-meaning', 'fee', 'approach']),
    )
  })

  it('uses optional context only when it matches', () => {
    const onlineInsurance = buildWorksheetQuestions(['cost'], {
      meeting: 'first-session',
      format: 'online',
      payment: 'insurance',
    })
    expect(onlineInsurance.map((question) => question.id)).toEqual(
      expect.arrayContaining(['online-privacy', 'insurance', 'first-session']),
    )
    expect(onlineInsurance.map((question) => question.id)).not.toContain('self-pay')
  })

  it('guarantees every selected focus and explicit context before applying the cap', () => {
    const questions = buildWorksheetQuestions(
      ['approach', 'experience', 'respect', 'somatic'],
      {meeting: 'first-session', format: 'online', payment: 'insurance'},
    )
    const ids = questions.map((question) => question.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        'approach',
        'experience',
        'identity-access',
        'somatic-meaning',
        'first-session',
        'online-privacy',
        'insurance',
      ]),
    )
    expect(questions.length).toBeLessThanOrEqual(9)
  })

  it.each(WORKSHEET_FOCUSES.map((focus) => focus.id))(
    'retains the selected %s focus',
    (focus) => {
      const questions = buildWorksheetQuestions([focus], {})
      expect(questions.some((question) => question.focuses?.includes(focus))).toBe(true)
    },
  )

  it('ignores focus values beyond the four-choice product limit', () => {
    const all = WORKSHEET_FOCUSES.map((focus) => focus.id)
    const limited = buildWorksheetQuestions(all, baseContext)
    const firstFour = buildWorksheetQuestions(all.slice(0, MAX_WORKSHEET_FOCUSES), baseContext)
    expect(limited).toEqual(firstFour)
  })
})
