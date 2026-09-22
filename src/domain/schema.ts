import { z } from 'zod'
import { isValidDate, isValidMonth } from './calendar'

export const scenarioSchema = z.object({
  schemaVersion: z.literal(1),
  datasetVersion: z.string().min(1),
  mode: z.enum(['estimate', 'declared']),
  nickname: z.string().max(80).optional(),
  birthdate: z.string().refine(isValidDate, 'Introdu o dată validă.'),
  asOfMonth: z.string().refine(isValidMonth, 'Alege o lună validă.'),
  disability: z.enum(['no', 'yes', 'unknown']),
  domesticAssumptionsConfirmed: z.literal(true),
})

export type ScenarioInput = z.infer<typeof scenarioSchema>
