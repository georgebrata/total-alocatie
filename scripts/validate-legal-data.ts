import { historicalRules, legalSources } from '../src/legal-data/index.js'

const duplicateIds = historicalRules.map((rule) => rule.id).filter((id, index, ids) => ids.indexOf(id) !== index)
if (duplicateIds.length > 0) {
  throw new Error(`Duplicate legal rule IDs: ${duplicateIds.join(', ')}`)
}

const sourceIds = new Set(legalSources.map((source) => source.id))
for (const rule of historicalRules) {
  if (rule.sourceIds.length === 0) throw new Error(`Rule ${rule.id} has no source.`)
  if (rule.sourceIds.some((sourceId) => !sourceIds.has(sourceId))) throw new Error(`Rule ${rule.id} has an unknown source.`)
}

console.log(`Validated ${historicalRules.length} historical records; ${historicalRules.filter((rule) => rule.verification !== 'unverified').length} are enabled.`)
