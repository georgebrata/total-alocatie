import type { LegalRule, LegalSource } from '../domain/types'

export const LEGAL_DATASET_VERSION = '2026-09-research-1'

export const legalSources: LegalSource[] = [
	{
		id: 'decret-lege-105-1990',
		title: 'Decretul-lege nr. 105/1990',
		url: 'https://legislatie.just.ro/Public/DetaliiDocumentAfis/14976',
		kind: 'official',
		note: 'Sursă oficială pentru regimul dependent de venit și ordinea copiilor.',
	},
	{
		id: 'hg-780-1991',
		title: 'HG nr. 780/1991',
		url: 'https://legislatie.just.ro/Public/DetaliiDocumentAfis/2017',
		kind: 'official',
		note: 'Sursă oficială indicată pentru majorarea din 1991.',
	},
	{
		id: 'lege-61-1993',
		title: 'Legea nr. 61/1993',
		url: 'https://legislatie.just.ro/Public/DetaliiDocumentAfis/3202',
		kind: 'official',
		note: 'Act oficial; versiunile istorice și condițiile de aplicare trebuie verificate înainte de activare.',
	},
	{
		id: 'quantum-history-secondary',
		title: 'Istoricul public al cuantumurilor',
		url: 'https://ro.wikipedia.org/wiki/Aloca%C8%9Bia_de_stat_pentru_copii',
		kind: 'secondary',
		note: 'Sursă secundară folosită doar ca index de cercetare, nu ca dovadă pentru activarea regulilor.',
	},
	{
		id: 'current-summary-secondary',
		title: 'Situația actuală și baza legală',
		url: 'https://www.alocatiecopii.ro/alocatie-de-stat/',
		kind: 'secondary',
		note: 'Rezumat neoficial; necesită verificare în actele oficiale.',
	},
]

const research = (id: string, start: string, end: string, value: string, currency: 'ROL' | 'RON', category = 'standard'): LegalRule => ({
	id: `research-${id}`,
	benefit: 'childAllowance',
	beneficiary: 'child',
	effective: { start, end },
	category,
	amount: { value, currency, unitScale: currency === 'RON' ? 100 : 1 },
	verification: 'unverified',
	sourceIds: ['quantum-history-secondary', 'lege-61-1993'],
	explanation: 'Valoare importată din tabelul furnizat; așteaptă verificarea actului istoric aplicabil.',
})

// These records preserve the supplied history without enabling unverified automatic estimates.
export const historicalRules: LegalRule[] = [
	research('1993-oct', '1993-01', '1993-12', '3', 'RON'),
	research('1994-oct', '1994-01', '1994-12', '4', 'RON'),
	research('1995-oct', '1995-01', '1995-12', '5', 'RON'),
	research('1996-oct', '1996-01', '1996-12', '9', 'RON'),
	research('1997-oct', '1997-01', '1997-12', '15', 'RON'),
	research('1998-oct', '1998-01', '1998-12', '18', 'RON'),
	research('1999-oct', '1999-01', '1999-12', '20', 'RON'),
	research('2000-jan-nov', '2000-01', '2000-11', '65', 'RON'),
	research('2000-dec', '2000-12', '2000-12', '13', 'RON'),
	research('2001', '2001-01', '2001-12', '13', 'RON'),
	research('2002-jan-jun', '2002-01', '2002-06', '15', 'RON'),
	research('2002-jul', '2002-07', '2002-12', '18', 'RON'),
	research('2003', '2003-01', '2003-12', '21', 'RON'),
	research('2004', '2004-01', '2004-12', '21', 'RON'),
	research('2005', '2005-01', '2005-12', '24', 'RON'),
	research('2006', '2006-01', '2006-12', '24', 'RON'),
	research('2007', '2007-01', '2007-12', '25', 'RON'),
	research('2008', '2008-01', '2008-12', '32', 'RON'),
	research('2009-jan-feb', '2009-01', '2009-02', '32', 'RON'),
	research('2009-mar', '2009-03', '2009-12', '40', 'RON'),
	research('2010', '2010-01', '2010-12', '42', 'RON'),
	research('2011', '2011-01', '2011-12', '42', 'RON'),
	research('2012', '2012-01', '2012-12', '42', 'RON'),
	research('2013', '2013-01', '2013-12', '42', 'RON'),
	research('2014', '2014-01', '2014-12', '42', 'RON'),
	research('2015-jan-jun', '2015-01', '2015-06', '42', 'RON'),
	research('2015-jul-2016', '2015-07', '2016-12', '84', 'RON'),
	research('2017', '2017-01', '2017-12', '84', 'RON'),
	research('2018', '2018-01', '2018-12', '84', 'RON'),
	research('2019-2020-mar', '2019-01', '2020-03', '84', 'RON'),
	research('2020-apr', '2020-04', '2020-12', '150', 'RON'),
	research('2021-jan-aug', '2021-01', '2021-08', '156', 'RON'),
	research('2021-sep', '2021-09', '2021-12', '185', 'RON'),
	research('2022-jan-jun', '2022-01', '2022-06', '214', 'RON'),
	research('2022-jul', '2022-07', '2022-12', '243', 'RON'),
	research('2023', '2023-01', '2023-12', '256', 'RON'),
	research('2024-2025', '2024-01', '2025-12', '292', 'RON'),
	research('2022-high', '2022-01', '2022-12', '600', 'RON', 'under2-or-disability'),
	research('2023-high', '2023-01', '2023-12', '631', 'RON', 'under2-or-disability'),
	research('2024-2025-high', '2024-01', '2025-12', '719', 'RON', 'under2-or-disability'),
]

const estimatedContinuationRules: LegalRule[] = [
	research('2026-current', '2026-01', '2026-12', '292', 'RON'),
	research('2026-current-high', '2026-01', '2026-12', '719', 'RON', 'under2-or-disability'),
].map((rule) => ({ ...rule, verification: 'estimated', explanation: 'Prelungire orientativă a ultimei valori disponibile; necesită verificarea actului aplicabil.' }))

export const estimatedRules: LegalRule[] = [...historicalRules, ...estimatedContinuationRules].map((rule) => ({
	...rule,
	verification: 'estimated',
}))

// Automatic estimates stay disabled until each record has independently checked provenance.
export const verifiedRules: LegalRule[] = historicalRules.filter((rule) => rule.verification !== 'unverified')
