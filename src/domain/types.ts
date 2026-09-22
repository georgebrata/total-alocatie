export type CalculationMode = 'estimate' | 'declared'
export type DisabilityAnswer = 'no' | 'yes' | 'unknown'
export type MonthlyStatus = 'calculated' | 'estimated' | 'ineligible' | 'unresolved' | 'userDeclared'

export interface MonthInterval {
  start: string
  end: string
}

export interface Scenario {
  schemaVersion: 1
  datasetVersion: string
  mode: CalculationMode
  nickname?: string
  birthdate?: string
  asOfMonth: string
  disability: DisabilityAnswer
  domesticAssumptionsConfirmed: boolean
}

export interface LegalRule {
  id: string
  benefit: 'childAllowance'
  beneficiary: 'child'
  effective: MonthInterval
  category: string
  amount: { value: string; currency: 'ROL' | 'RON'; unitScale: number }
  verification: 'unverified' | 'estimated' | 'sourceChecked' | 'independentlyReviewed'
  sourceIds: string[]
  explanation: string
}

export interface LegalSource {
  id: string
  title: string
  url: string
  kind: 'official' | 'secondary'
  note: string
}

export interface MonthlyItem {
  month: string
  status: MonthlyStatus
  amountInMinorUnits: bigint | null
  currency: string
  reason?: string
  ruleId?: string
  sourceIds: string[]
}

export interface CalculationResult {
  mode: CalculationMode
  datasetVersion: string
  asOfMonth: string
  monthlyItems: MonthlyItem[]
  knownSubtotalMinorUnits: bigint
  includedMonthCount: number
  unresolvedMonthCount: number
  uncoveredIntervals: MonthInterval[]
}
