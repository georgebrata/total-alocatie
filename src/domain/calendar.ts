const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/
const DATE_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

export function isValidMonth(value: string): boolean {
  const match = MONTH_PATTERN.exec(value)
  if (!match) return false
  const year = Number(match[1])
  return year >= 1900 && year <= 2200
}

export function isValidDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value)
  if (!match) return false
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() === Number(match[2]) - 1 && date.getUTCDate() === Number(match[3])
}

export function compareMonths(left: string, right: string): number {
  return left.localeCompare(right)
}

export function monthAfter(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return monthNumber === 12 ? `${year + 1}-01` : `${year}-${String(monthNumber + 1).padStart(2, '0')}`
}

export function monthsBetween(start: string, end: string): string[] {
  if (!isValidMonth(start) || !isValidMonth(end) || compareMonths(start, end) > 0) return []
  const result: string[] = []
  let cursor = start
  while (compareMonths(cursor, end) <= 0) {
    result.push(cursor)
    cursor = monthAfter(cursor)
  }
  return result
}

export function monthAtAge(date: string, age: number): string {
  const year = Number(date.slice(0, 4)) + age
  return `${year}-${date.slice(5, 7)}`
}

export function lastCompletedMonth(now: Date): string {
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const completedMonth = month === 1 ? 12 : month - 1
  const completedYear = month === 1 ? year - 1 : year
  return `${completedYear}-${String(completedMonth).padStart(2, '0')}`
}
