import { compareMonths, isValidDate, isValidMonth, monthAfter, monthAtAge } from './calendar'
import type { CalculationResult, LegalRule, Scenario } from './types'

export const DATASET_VERSION = '2026-09-research-1'

function toRonMinorUnits(rule: LegalRule): bigint | null {
  const value = BigInt(rule.amount.value)
  if (rule.amount.currency === 'RON') return value * BigInt(rule.amount.unitScale)

  // 10,000 ROL = 1 RON. Keep conversion exact; an unrepresentable fraction stays unresolved.
  const numerator = value * 100n
  return numerator % 10000n === 0n ? numerator / 10000n : null
}

function monthFromDate(date: string): string {
  return date.slice(0, 7)
}

function addUnresolvedResult(scenario: Scenario, reason: string): CalculationResult {
  return {
    mode: scenario.mode,
    datasetVersion: scenario.datasetVersion,
    asOfMonth: scenario.asOfMonth,
    monthlyItems: [{
      month: scenario.asOfMonth,
      status: 'unresolved',
      amountInMinorUnits: null,
      currency: 'RON',
      reason,
      sourceIds: [],
    }],
    knownSubtotalMinorUnits: 0n,
    includedMonthCount: 0,
    unresolvedMonthCount: 1,
    uncoveredIntervals: [{ start: scenario.asOfMonth, end: scenario.asOfMonth }],
  }
}

export function calculateEstimate(scenario: Scenario, rules: LegalRule[]): CalculationResult {
  if (!scenario.birthdate || !isValidDate(scenario.birthdate) || !isValidMonth(scenario.asOfMonth)) {
    return addUnresolvedResult(scenario, 'Datele scenariului nu pot fi validate.')
  }
  if (!scenario.domesticAssumptionsConfirmed) {
    return addUnresolvedResult(scenario, 'Confirmarea ipotezelor pentru cazul domestic lipsește.')
  }

  const start = monthFromDate(scenario.birthdate)
  const eighteenthBirthdayMonth = monthAtAge(scenario.birthdate, 18)
  const calculationEnd = compareMonths(scenario.asOfMonth, eighteenthBirthdayMonth) < 0 ? scenario.asOfMonth : eighteenthBirthdayMonth
  if (compareMonths(start, calculationEnd) > 0) {
    return addUnresolvedResult(scenario, 'Data nașterii este după luna selectată.')
  }

  const items = []
  let cursor = start
  while (compareMonths(cursor, calculationEnd) <= 0) {
    const rule = rules.find((candidate) => candidate.effective.start <= cursor && candidate.effective.end >= cursor)
    const amountInMinorUnits = rule ? toRonMinorUnits(rule) : null
    if (!rule || amountInMinorUnits === null) {
      items.push({ month: cursor, status: 'unresolved' as const, amountInMinorUnits: null, currency: 'RON', reason: !rule ? 'Nu există o regulă pentru această lună.' : 'Conversia exactă în bani RON nu este posibilă pentru această sumă.', sourceIds: rule?.sourceIds ?? [] })
    } else if (rule.verification === 'estimated') {
      items.push({ month: cursor, status: 'estimated' as const, amountInMinorUnits, currency: 'RON', reason: 'Valoare estimată din istoricul disponibil; necesită verificare oficială.', ruleId: rule.id, sourceIds: rule.sourceIds })
    } else if (rule.verification === 'unverified') {
      items.push({ month: cursor, status: 'unresolved' as const, amountInMinorUnits: null, currency: 'RON', reason: 'Regula nu a fost verificată.', sourceIds: rule.sourceIds })
    } else {
      items.push({ month: cursor, status: 'calculated' as const, amountInMinorUnits, currency: 'RON', ruleId: rule.id, sourceIds: rule.sourceIds })
    }
    cursor = monthAfter(cursor)
  }

  const knownItems = items.filter((item) => item.status === 'calculated' || item.status === 'estimated')
  const unknownItems = items.filter((item) => item.status === 'unresolved')
  return {
    mode: scenario.mode,
    datasetVersion: scenario.datasetVersion,
    asOfMonth: scenario.asOfMonth,
    monthlyItems: items,
    knownSubtotalMinorUnits: knownItems.reduce((total, item) => total + (item.amountInMinorUnits ?? 0n), 0n),
    includedMonthCount: knownItems.length,
    unresolvedMonthCount: unknownItems.length,
    uncoveredIntervals: unknownItems.map((item) => ({ start: item.month, end: item.month })),
  }
}
