import { describe, expect, it } from 'vitest'
import { calculateEstimate, DATASET_VERSION } from '../src/domain/calculate'
import { isValidDate, isValidMonth, lastCompletedMonth, monthAtAge, monthsBetween } from '../src/domain/calendar'
import type { LegalRule, Scenario } from '../src/domain/types'

const baseScenario: Scenario = {
  schemaVersion: 1,
  datasetVersion: DATASET_VERSION,
  mode: 'estimate',
  birthdate: '2020-02-29',
  asOfMonth: '2022-02',
  disability: 'unknown',
  domesticAssumptionsConfirmed: true,
}

describe('calendar utilities', () => {
  it('reject invalid calendar values without timezone arithmetic', () => {
    expect(isValidDate('2020-02-29')).toBe(true)
    expect(isValidDate('2021-02-29')).toBe(false)
    expect(isValidMonth('2022-13')).toBe(false)
    expect(monthsBetween('2021-11', '2022-02')).toEqual(['2021-11', '2021-12', '2022-01', '2022-02'])
    expect(monthAtAge('2020-02-29', 18)).toBe('2038-02')
  })

  it('selects the last completed month', () => {
    expect(lastCompletedMonth(new Date(2026, 0, 4))).toBe('2025-12')
    expect(lastCompletedMonth(new Date(2026, 8, 22))).toBe('2026-08')
  })
})

describe('calculation engine', () => {
  it('keeps unsupported months unresolved instead of treating them as zero', () => {
    const result = calculateEstimate(baseScenario, [])
    expect(result.knownSubtotalMinorUnits).toBe(0n)
    expect(result.includedMonthCount).toBe(0)
    expect(result.unresolvedMonthCount).toBe(25)
    expect(result.monthlyItems.every((item) => item.amountInMinorUnits === null)).toBe(true)
  })

  it('aggregates verified exact minor units and preserves the rule provenance', () => {
    const rules: LegalRule[] = [{
      id: 'fixture-verified',
      benefit: 'childAllowance',
      beneficiary: 'child',
      effective: { start: '2020-02', end: '2022-02' },
      category: 'synthetic test fixture',
      amount: { value: '243', currency: 'RON', unitScale: 100 },
      verification: 'sourceChecked',
      sourceIds: ['fixture-source'],
      explanation: 'Synthetic fixture only.',
    }]
    const result = calculateEstimate(baseScenario, rules)
    expect(result.knownSubtotalMinorUnits).toBe(24300n * 25n)
    expect(result.includedMonthCount).toBe(25)
    expect(result.monthlyItems[0].ruleId).toBe('fixture-verified')
    expect(result.monthlyItems[0].sourceIds).toEqual(['fixture-source'])
  })

  it('stops the estimate in the month the child turns 18', () => {
    const rules: LegalRule[] = [{
      id: 'fixture-verified',
      benefit: 'childAllowance',
      beneficiary: 'child',
      effective: { start: '2008-06', end: '2026-12' },
      category: 'synthetic test fixture',
      amount: { value: '100', currency: 'RON', unitScale: 100 },
      verification: 'sourceChecked',
      sourceIds: ['fixture-source'],
      explanation: 'Synthetic fixture only.',
    }]
    const result = calculateEstimate({ ...baseScenario, birthdate: '2008-06-15', asOfMonth: '2026-12' }, rules)
    expect(result.monthlyItems.at(-1)?.month).toBe('2026-06')
    expect(result.includedMonthCount).toBe(217)
  })

  it('includes explicitly estimated rules without treating them as verified', () => {
    const rules: LegalRule[] = [{
      id: 'fixture-estimated',
      benefit: 'childAllowance',
      beneficiary: 'child',
      effective: { start: '2020-02', end: '2022-02' },
      category: 'synthetic test fixture',
      amount: { value: '243', currency: 'RON', unitScale: 100 },
      verification: 'estimated',
      sourceIds: ['fixture-source'],
      explanation: 'Synthetic fixture only.',
    }]
    const result = calculateEstimate(baseScenario, rules)
    expect(result.knownSubtotalMinorUnits).toBe(24300n * 25n)
    expect(result.includedMonthCount).toBe(25)
    expect(result.monthlyItems[0].status).toBe('estimated')
  })
})
