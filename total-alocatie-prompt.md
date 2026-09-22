# Coding-agent prompt: "Total Alocație"
Act as a senior full-stack engineer and product designer. Build a simple, polished Romanian-language web application called **Total Alocație** that helps someone understand their historical Romanian child allowance and share an attractive, privacy-conscious summary.

Deliver working code, tests, documented legal data, and setup instructions—not just a mockup or implementation plan. Keep the interface simple even when the calculation rules are complex. Use English identifiers and concise comments explaining non-obvious decisions; use natural Romanian with diacritics throughout the UI.

## 1. Product scope and truthful results

The main feature estimates accumulated **alocație de stat pentru copii** for a person, from their applicable entitlement start through a selected historical cutoff. Target historical coverage from 1991 onward, but support automatic calculations only for periods and cases backed by verified rules. Never claim complete lifetime coverage when some months are unsupported.

Provide two clearly separated modes:

- **„Estimare conform legislației”**: calculate entitlement based on the supplied circumstances and the rules applicable at the time. Label the result „Total estimat al alocației”. This is not proof of payment, a receivable, or a decision on eligibility.
- **„Sume încasate declarate”**: total payment amounts entered by the user. Label these as user-declared, not independently verified. Birthdate alone cannot establish actual payments.

Do not describe a theoretical entitlement as „Ai primit X lei”. Child allowance belongs to the child even when collected by a parent; parental childcare indemnity is a different benefit with a different beneficiary. Never silently combine them into a child's lifetime allowance.

Build the child-allowance calculator first. Offer an optional „Alte indemnizații” section as a separate, itemized user-declared ledger. Automated estimates of other benefits are out of scope until their historical eligibility and calculation rules are verified. Do not simulate legal coverage with placeholder amounts.

## 2. Stack and architecture

- React, TypeScript in strict mode, and Vite.
- Material UI with a genuinely custom theme, semantic design tokens, component overrides, and light/dark/system modes.
- React Hook Form and Zod for forms and shared validation.
- Recharts for data-driven graphics, styled from MUI theme tokens.
- Clerk for authentication and bounded account persistence as specified below.
- A small TypeScript backend, such as Express, for authenticated Clerk metadata access. Never put a Clerk secret in the frontend.
- Vitest and React Testing Library for domain/component tests; Playwright for key end-to-end flows.

Use currently supported, mutually compatible packages, check their official documentation, and commit a lockfile. Do not introduce another database, Redux, a CMS, AI runtime calls, paid chart components, or a large service architecture.

Separate `domain`, `legal-data`, `features/calculator`, `features/results`, `features/sharing`, `theme`, and `server`. The pure calculation engine must work without React, Clerk, network requests, or a browser. Prefer explicit functions and readable types over clever abstractions.

## 3. Short form with progressive disclosure

Make the standard journey understandable in under a minute. Use one compact form with expandable details, rather than a long questionnaire. Start with:

1. **„Data nașterii”** (`birthdate`): required, accessible date input with typed entry and Romanian formatting.
2. **„Până la ce lună calculăm?”** (`asOfMonth`): default to the last completed month in Europe/Bucharest. Exclude future months; do not silently include an unpaid or incomplete current month.
3. **„A existat o încadrare în grad de handicap?”** (`hasHandicap`): explicit „Nu / Da / Nu știu”. Explain respectfully why it affects the calculation. Treat unknown as unknown, not as false.
4. A concise eligibility check covering whether residence/employment abroad or other circumstances may affect Romanian entitlement. Show the default domestic-case assumptions and require confirmation before applying them.

Reveal additional inputs only when relevant:

- Disability certification start/end dates, including changes over time. Do not apply today's status retrospectively to the entire childhood; request degree only for a rule that actually requires it. Never request diagnosis or documents.
- Eligible education periods after age 18, school type, completion/withdrawal, and any legally relevant repeated-year exception. Do not assume university attendance extends eligibility.
- Known interruptions, delayed application, resumption, or exceptional circumstances. If a case is unsupported, explain which period needs confirmation instead of inventing eligibility.
- For an old regime that depends on parental income or sibling order, request the necessary historical information or flag the affected months as unresolved.
- **„Adaugă alte indemnizații”**: optional entries with benefit type, beneficiary role, relevant period, monthly or one-off amount, original currency, and whether the amount is gross or actually received. Let users identify childcare indemnity, disability-related benefits, or another declared benefit. Keep totals separate by beneficiary and accounting basis; do not add mutually exclusive or duplicate payments automatically.
- In declared-payments mode, allow explicit payment entries and compact recurring monthly entries, with refunds/recoveries represented explicitly. Track payment date separately from the months the payment relates to, including arrears.

No CNP, address, bank details, uploads, or full legal name. A scenario nickname is optional. Validate future birthdates, reversed/overlapping intervals, duplicate records, and invalid amounts with helpful inline messages.

Each conditional field needs a short „De ce întrebăm?” explanation and a concrete fictional example. Do not require sign-in to calculate or download a share image.

## 4. Legal research and versioned data

Before implementing rates, research official Romanian sources: the Legislative Portal, the responsible ministry, and ANPIS/AJPIS publications. Read historical consolidated versions, amendments, implementing norms, and exceptional freezes. Distinguish publication date, legal effective date, entitlement month, and actual payment month.

Do not trust a previous conversation's annual rate table, Wikipedia, or model memory as production data. In particular, **243 lei / 600 lei applied from the January 2022 entitlement month**, not July, under OUG 126/2021. Recheck all other historical figures and transitions independently.

Create a versioned, machine-readable rules dataset. Every rule needs:

- Stable ID, benefit/beneficiary category, effective interval, and applicable age/status conditions.
- Original rate and currency, calculation/rounding behavior, and precedence over any general rule.
- Exact source URL, act number, article/paragraph, applicable historical version, and retrieval date.
- Verification status and a brief plain-language explanation.

Create `docs/legal-coverage.md` listing supported periods and categories, missing sources, unresolved interpretations, and explicit exclusions. Preserve earlier dataset versions referenced by saved scenarios. Flag competing rules, gaps, and overlapping intervals in automated data-validation tests.

Do not infer that current law applied historically. Do not apply annual inflation indexing during a statutory freeze. Do not extend the high disability-child rate to every post-18 education case without checking the applicable category.

Unknown rules must produce `null`/an unresolved status, never zero or a guessed rate. A partially supported case can show **„Subtotal pentru lunile verificate”**, the missing month count, and the exact uncovered periods. Never present it as a complete lifetime total; do not bridge unknown periods in charts. A sourced rule is not the same as a lawyer-approved rule—keep those claims distinct.

If source access is unavailable, continue with the app and clearly labeled synthetic test fixtures, but disable automatic calculations for unverified periods. Document the blocker honestly.

## 5. Calculation engine

Calculate month by month; never multiply age by 12 and a current or annual rate. Evaluate time-specific rules for entitlement start, changes at age thresholds, disability certification, education, interruption, resumption, and cessation. Derive birthday-month treatment from the applicable rules and norms rather than improvising day-based proration.

Return a structured result containing monthly items, yearly subtotals, cumulative values, benefit/beneficiary separation, applied rule/source IDs, assumptions, uncovered periods, cutoff, and dataset version. Mark months as calculated, ineligible, unresolved, or user-declared. Keep unknown months distinct from confirmed zero-entitlement months.

Use calendar dates/months without UTC-induced birthday shifts. Preserve original-currency amounts. Verify and apply the 2005 redenomination: 10,000 ROL = 1 RON. Use integer original units with exact rational conversion, or a decimal library; avoid floating-point accumulation and early rounding of old-leu amounts. Format displayed RON with `Intl.NumberFormat('ro-RO')` and round only at the documented display boundary.

Explain that a nominal RON-converted historical sum is **not adjusted for inflation** and does not represent today's purchasing power. Do not imply otherwise in graphics. Skip inflation-adjusted or euro comparisons unless a separately sourced conversion methodology is implemented and clearly disclosed.

The engine must not confuse estimated historical entitlement, potentially recoverable arrears, and payments actually received. Do not calculate interest, penalties, or a claim against the state.

## 6. Intuitive interface and visual direction

Aim for a friendly editorial financial tool, not a government portal or a crowded dashboard. Use generous spacing, clear typography, rounded cards, restrained indigo/teal accents, and a warm neutral light palette with a coherent dark equivalent. Avoid decorative gradients, stock imagery, patriotic clichés, and gamification around disability or family benefits.

Create custom MUI overrides for buttons, inputs, cards, alerts, tooltips, accordions, and tables. Follow system theme initially, offer a visible theme switch, avoid theme flash, and persist only the theme preference locally by default.

After calculation, reveal:

- One prominent, accurately labeled total or partial subtotal, with the period immediately beside it.
- A compact coverage/assumptions notice and separate optional-benefit totals.
- An annual bar chart and a cumulative chart, with an equivalent accessible table and expandable monthly details.
- A few genuinely calculated insights: highest nominal annual amount, number of included months, and relevant rate-change milestones. Label nominal comparisons honestly.
- A clear **„Cum am calculat?”** explanation with worked steps, assumptions, and source links next to the applicable rules.
- A primary **„Distribuie rezultatul”** action and a secondary **„Salvează calculul”** action.

Provide an always-accessible **„Metodologie și legislație”** page, last-checked date, coverage table, and short FAQ. Example questions: „De ce nu calculăm luna nașterii?”, „Ce înseamnă lei vechi și lei noi?”, „Sunt acestea sumele încasate?”, and „De ce este rezultatul incomplet?”. Answers must follow the verified dataset, not generic assumptions.

Ship three clearly fictional examples: a standard domestic case, a case with changing disability status, and a historical case with missing coverage. Explain why their results differ without inventing real payment histories.

Support mobile widths from 360px, keyboard navigation, visible focus, labeled inputs, screen-reader announcements, sufficient contrast, reduced motion, and non-color indicators. Honor WCAG 2.2 AA design/testing practices; do not claim certified accessibility without an audit.

## 7. Social sharing that works without public sensitive records

Generate crisp, attractive PNG cards locally from the same result view-model:

- Square: 1080 × 1080.
- Portrait feed: 1080 × 1350.
- Story: 1080 × 1920.

Include the qualified total/subtotal, selected period, a compact chart, app name/site address, cutoff, dataset version, and a legible „Estimare” or „Sume declarate” label. Preserve partial-coverage warnings on the image. Design proper layouts for each aspect ratio and theme, rather than stretching a screenshot. Ensure Romanian glyphs render correctly and fonts finish loading before export.

Use deterministic SVG/Canvas or a maintained browser export library—not AI-generated charts. Offer preview, download, caption copy, and native Web Share file sharing when supported; feature-detect file sharing and provide download/copy fallbacks. Do not claim one-click posting to networks that do not support the chosen mechanism.

Default exports must exclude name, exact birthdate, disability status, certification periods, income, and detailed optional-benefit categories. Keep chart data aggregated and require explicit preview/confirmation because even totals and patterns can reveal personal information. Never auto-post.

For the Clerk-only MVP, share images plus a generic application link. Do not put inputs or health information in query strings, URL fragments, analytics, or Open Graph metadata. Provide generic public Open Graph assets. Personalized public links, revocable share records, and per-result crawler previews are out of scope without a separately approved storage architecture; do not pretend Clerk private metadata provides public result hosting.

## 8. Clerk auth, persistence, and privacy

Use Clerk's supported React/backend SDKs. Clerk is not a general-purpose database: its documented metadata limit is 8KB. Store only a compact, explicitly saved scenario under an application namespace in `privateMetadata`; recompute derived results. Never put scenario data in public/unsafe metadata or session claims.

Implement authenticated read/save/delete endpoints. Derive the user ID from the verified session, not request data. Validate payloads, enforce UTF-8 byte limits with headroom for existing metadata, preserve unrelated keys, and handle authorization failures and rate limits. Do not silently truncate oversized scenarios. Document a one-scenario MVP limit and concurrent-save behavior.

Calculate anonymously in memory. Require a deliberate save action and clear consent before transmitting sensitive inputs; authentication is not consent. Do not persist form data in local/session storage or telemetry. Provide „Șterge calculul salvat”, readable privacy information, and safe logout/cache cleanup. Do not collect diagnoses, certificates, or unrelated personal details.

Cloud handling of children's and disability-related data needs a documented privacy/security review before public production use. Private metadata alone is not a claim of regulatory compliance. If this review is unresolved, keep sensitive scenarios usable locally without cloud saving.

Provide `.env.example` with placeholders, a working local backend setup, and an honest demo mode when Clerk credentials are absent. Disable cloud-save actions in that mode with a clear explanation. Do not mock successful authentication or saves.

## 9. Tests, verification, and handoff

At minimum, test:

- Birth-month and cessation boundaries, leap-day birthdays, and 2/3/18-year transitions; post-18 exceptions only where sourced.
- Midyear rate changes, indexation freezes, certification start/end, and historical education rules.
- The January 2022 change, using the source-backed 243/600 rates.
- ROL/RON conversion and rounding, exact aggregation, and cumulative/yearly reconciliation.
- Unknown months, unsupported cross-border cases, invalid intervals, duplicate payment entries, and beneficiary separation.
- Entitlement month versus payment date, arrears, and explicit refunds in declared-payment totals.
- Guest use, conditional form fields, keyboard navigation, both themes, and mobile layouts.
- Clerk ownership checks, missing credentials, oversized payloads, deletion, and save failures.
- Export dimensions, font readiness, fallback sharing, excluded private fields, and warnings surviving image export.

Keep independently reviewed expected-value fixtures with source provenance; do not generate expected outputs using the same implementation being tested. Inspect screenshots and exported cards in both themes. Run type checking, linting, tests, and a production build; report actual results and anything not run.

Deliver source code, legal dataset, coverage/source documentation, README with commands and environment setup, and a short explanation of architectural choices. Include a maintenance checklist for updating legal rules and regression fixtures, plus known limitations and legal/privacy review items. Do not label the application legally certified or connect it to an official institution.

Work incrementally: verify legal coverage → implement/test engine → build form/results → add Clerk saving → implement/inspect sharing → final QA. Make sensible product decisions without repeated clarification; ask only when a missing decision materially changes legal scope, privacy, or architecture.

## Starting references

These are research starting points, not a complete historical dataset. Recheck them and all relevant amendments at implementation time; reference review date: 22 September 2026.

- [Legea nr. 61/1993 — alocația de stat pentru copii, with historical versions and notes](https://legislatie.just.ro/Public/DetaliiDocument/142806).
- [OUG nr. 126/2021 — January 2022 rates and amended beneficiary categories](https://legislatie.just.ro/Public/FormaPrintabila/00000G30G76Z5CG8UHM29QYYHUFFN5I4).
- [Methodological norms associated with HG nr. 577/2008](https://legislatie.just.ro/Public/DetaliiDocument/144668).
- [Legea nr. 348/2004 — redenomination](https://legislatie.just.ro/Public/FormaPrintabila/00000G1V8TVFTJVB9M729EMTZ226ZXLT).
- [OUG nr. 111/2010 — parental childcare leave and indemnity; a separate benefit](https://legislatie.just.ro/Public/DetaliiDocument/124331).
- [Legea nr. 448/2006 — disability-related rights; check applicable versions](https://legislatie.just.ro/Public/FormaPrintabila/00000G0NDORDBIQ9K770EBGUCIMWEV6M).
- Also examine OUG nr. 156/2024 and Legea nr. 141/2025 and later amendments; the linked child-allowance law includes references to the 2025 and 2026 freezes.
- [Clerk user metadata: visibility and storage constraints](https://clerk.com/docs/guides/users/extending).
- [MUI light/dark color-scheme documentation](https://mui.com/material-ui/customization/dark-mode/).
