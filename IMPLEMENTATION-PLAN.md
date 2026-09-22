# Implementation plan — Alocația mea
## 1. Objective and non-negotiable boundaries
Implement the application in this repository, preserving the [original product specification](total-alocatie-prompt.md). Deliver working source, automated tests, versioned legal data, privacy/security documentation, and reproducible setup instructions.
- Anonymous calculation and image export work without Clerk or a network connection after application assets load. Inputs remain in memory unless the user deliberately constents to creating an account (optional).
- Keep **„Estimare conform legislației”**, **„Sume încasate declarate”**, and **„Alte indemnizații”** distinct. Never describe estimated entitlement as money actually received or as recoverable arrears.
- Target a historical timeline from 1991 onward, not a promise of verified coverage from 1991. Unsupported rules and circumstances produce unresolved months, not guessed rates or zeroes.
- Birthdate alone does not establish eligibility, actual payments, or historical disability status. Domestic assumptions need explicit confirmation.
- Do not store diagnoses, documents, CNP, address, banking data, or full legal names. Authentication is not consent to process sensitive inputs.
- No additional database, Redux, CMS, AI runtime, paid chart components, personalized public result links, or automated estimates of other benefits.
- Public production use is gated by a documented privacy/security review for children's and disability-related data. Until that review is resolved, cloud scenario saving is disabled; local use remains available.
- Use a modern, minimalist yet vibrant and creative UI theme with consistent UI elements and sections. Focus on perfect SEO performance and meeting Level AAA Accessibility standards.

## 2. Technical decisions and repository layout

Use one npm-managed repository and lockfile, with a Vite React frontend and a small Express TypeScript server. Avoid a monorepo framework. Select supported, mutually compatible versions against official documentation during setup; record the Node LTS requirement and SDK decisions rather than assuming today's package names or APIs remain current.

| Area | Planned responsibility |
| --- | --- |
| Application shell | Routing for calculator, methodology, and privacy; Romanian UI; optional Clerk provider; error boundaries |
| Domain | Pure calendar, eligibility, exact money, validation, calculation, and declared-ledger functions |
| Legal data | Immutable versioned datasets, source registry, typed rule definitions, and coverage validation |
| Calculator feature | React Hook Form + shared Zod schemas; conditional inputs and fictional scenarios |
| Results feature | Shared result view-model, theme-aware Recharts, accessible tables, explanations and sources |
| Sharing feature | Privacy allowlist, fixed-layout Canvas PNG renderer, preview/download/copy/native sharing |
| Account feature | Explicit consent, authenticated load/save/delete, unavailable/demo/error states |
| Theme | Custom MUI semantic tokens, component overrides, and light/dark/system preference |
| Server | Clerk session verification, bounded private-metadata persistence, request/security controls |
| Tests and documentation | Vitest, React Testing Library, server integration tests, Playwright, legal/privacy/maintenance records |

Planned directories under the repository root: src/app, src/domain, src/legal-data/versions, src/features/calculator, src/features/results, src/features/sharing, src/features/account, src/theme, src/shared, server, tests/fixtures, tests/e2e, docs, and public. These are future locations, not existing implementation files.

Dependency direction: UI and server may import shared schemas; calculator/results may import domain and legal-data; domain never imports React, Clerk, network APIs, or browser APIs. Treat immutable legal datasets as explicit engine inputs, not hidden globals.

Use strict TypeScript for frontend, backend, and tests; ESLint with React hooks and accessibility checks where applicable. Use calendar strings/value objects rather than JavaScript timestamp arithmetic for birthdays and entitlement months. Use BigInt-backed exact units internally and decimal strings in JSON. Use a locally bundled, licensed font with Romanian glyphs for UI and exports.

## 3. Delivery sequence and gates

Complete each phase's acceptance criteria before relying on its output in the next phase. The legal-research fallback is deliberate: if official sources cannot be read, continue with the engine, declared ledger, and UI, but ship no automatic calculation for those unverified rules. Synthetic fixtures must never enter the production legal dataset.

### Phase 0 — Preserve the repository and establish the workspace

1. Inspect repository state, preserve the source brief and this plan, and avoid destructive scaffolding into the non-empty folder.
2. Check official Vite, React, MUI, React Hook Form, Zod, Recharts, Clerk React/backend, Express, Vitest, Testing Library, and Playwright documentation. Record selected compatible versions and relevant integration notes.
3. Add the minimal frontend/backend structure, package manifest, lockfile, strict TypeScript configurations, lint/test/build configuration, and environment validation.
4. Define scripts for concurrent local frontend/backend development, type checking, linting, unit/integration tests, browser tests, legal-data validation, production build, and production start.
5. Use a same-origin API in production and a Vite API proxy locally. Keep all secrets server-only. Add environment placeholders for the public Clerk key, backend secret, allowed application origin, and cloud-save review gate. Missing credentials must not prevent guest startup.
6. Establish a small CI pipeline that installs from the lockfile and runs the repeatable checks; never add real secrets or scenario payloads to fixtures or logs.

**Acceptance:** a clean install can run a Romanian guest shell and backend health check without Clerk credentials; frontend assets contain no secret; all initial checks pass. Do not imply that the shell already calculates verified entitlement.

### Phase 1 — Research and delimit verified legal coverage

1. Build a source inventory starting with the Legislative Portal links in the brief, then responsible ministry and ANPIS/AJPIS publications. Read applicable historical versions, amendments, norms, and exceptional freezes—not just the latest consolidated law.
2. Maintain a research matrix by period, age group, disability category, post-18 education, entitlement start/cessation, and relevant old-regime conditions. Record unavailable sources and ambiguities explicitly.
3. For every candidate rule, record publication date, legal effective date, entitlement month, and payment timing separately. Derive birth-month, birthday-threshold, certification, education, suspension, and resumption treatment from sources.
4. Recheck the January 2022 entitlement-month transition under OUG 126/2021, including the 243/600 lei categories; do not shift it to July. Independently verify all other amounts and transitions before enabling them.
5. Verify the 2005 redenomination under Legea 348/2004, the applicable 2025/2026 freezes including OUG 156/2024 and Legea 141/2025, and any subsequent amendments available at implementation time. Never extrapolate an indexation or continue a rate beyond the verified coverage horizon.
6. Define a first vertical slice: ordinary domestic under-18 cases for the contiguous interval actually supported by reviewed sources. Enable disability and education categories only when both rate and eligibility/boundary rules are verified. Broaden historical coverage incrementally, not by copying modern eligibility backwards.
7. Add structured source records: stable source ID, exact URL, act number, article/paragraph, applicable historical version, retrieval date, relevant evidence notes, and review status. Retain provenance for independent expected-value fixtures.
8. Create the legal coverage document, describing supported intervals/categories, unresolved interpretations, unavailable historical income/sibling data, exclusions, last-checked dates, and source-access blockers. Distinguish source verification from legal professional approval.

**Acceptance:** every enabled rule is traceable to accessible evidence for its historical applicability. A coverage map identifies unsupported periods from 1991 through the selectable cutoff. If no rates can be verified, the map and methodology say so and automatic estimates remain disabled.

### Phase 2 — Versioned contracts, legal dataset, and engine tests

Define shared types and Zod validation before connecting forms:

- `Scenario`: schema version, dataset version, mode, optional nickname, birthdate, cutoff, explicit disability answer, certification intervals, domestic assumptions/confirmation, relevant education and exceptional intervals, and separate declared ledgers.
- `LegalRule`: stable ID, benefit and beneficiary category, effective interval, supported historical horizon, age/status conditions, original rate/currency, rounding behavior, precedence, source IDs, verification state, and plain-language explanation. Use typed declarative conditions, never executable code stored in JSON.
- `MonthlyItem`: entitlement month, calculated/ineligible/unresolved/user-declared status, exact amount or `null`, original currency, normalized exact value, benefit/beneficiary, rule/source IDs, assumptions, and reason codes.
- `CalculationResult`: cutoff and dataset version, monthly rows, annual subtotals, exact known subtotal, completeness flags, contiguous uncovered intervals and counts, cumulative series, separated benefit totals, and explainable milestones.
- `DeclaredPayment`: stable entry ID, payment date, related entitlement month/period, one-off or recurring schedule, payment/refund/recovery kind, positive amount with explicit direction, original currency, beneficiary, benefit type, and gross/received basis. Relating one arrears payment to several months must not multiply its amount.

Implement data validation for invalid ranges, competing equal-priority matches, unexplained overlaps, unknown source IDs, unverified enabled rules, and coverage gaps. Legitimate specific-over-general precedence must be explicit; documented gaps remain visible rather than failing as unexpected omissions.

Retain immutable dataset versions referenced by saved scenarios. Never silently migrate an old scenario to new legal rules; offer explicit recalculation with the newer version. Unknown saved versions produce an actionable error, not substituted results.

**Acceptance:** schemas reject malformed dates, reversed/overlapping intervals, future birthdates, invalid cutoffs, invalid amounts, duplicate ledger records, and conflicting category inputs. Rule ambiguity cannot silently select the first match. Independently calculated expected fixtures identify their evidence and review status; synthetic boundary fixtures are visibly separate.

### Phase 3 — Implement and verify the pure calculation engine

1. Implement validated date/month utilities, month iteration, calendar age thresholds, and last-completed-month selection using Europe/Bucharest at the UI boundary. Inject the reference date for deterministic tests; exclude current incomplete and future months.
2. Generate candidate months without inventing an entitlement start for unsupported regimes. For each month resolve applicable eligibility, then rate and precedence. Apply verified birth, age 2/3/18, certification, schooling, cessation, and interruption rules in their historical context.
3. Treat unknown disability status, unconfirmed domestic assumptions, unsupported cross-border facts, old-regime income/sibling requirements, and unsupported exceptions as unresolved wherever they can affect the outcome. Do not request degree unless a sourced rule requires it.
4. Represent exact normalized value in integer units of one ten-thousandth RON: one whole ROL equals one unit; one RON equals 10,000 units. Preserve original amounts/currencies and define allowed currency precision in schemas. If a sourced fractional calculation needs finer precision, use exact rational arithmetic rather than round early.
5. Round only at the documented display boundary; format Romanian amounts with `Intl.NumberFormat('ro-RO')`. Keep normalized nominal historical values explicitly separate from inflation-adjusted purchasing power.
6. Aggregate yearly and cumulative values from exact monthly records. Across missing months, show chart gaps and separate known-subtotal progression; never draw a continuous complete-lifetime curve. Preserve confirmed ineligibility as zero and unresolved entitlement as `null`.
7. Implement declared payments separately: record actual payment dates, related months, recurring expansion, explicit refunds/recoveries, and arrears without implying entitlement. Keep totals separated by beneficiary, benefit, and accounting basis; warn about overlapping/possibly duplicate payments and never automatically combine mutually exclusive benefits.
8. Derive insights from included data only: included-month count, highest verified nominal annual amount with partial-year qualification, and sourced rate-change milestones. Do not compare incomplete and complete years without qualification.

**Required regression matrix:** birth and cessation months; leap-day birthdays; 2/3/18-year transitions; sourced post-18 and historical education rules; midyear rate changes; freezes; certification starts/ends; January 2022 243/600 categories; exact ROL/RON conversion and display rounding; yearly/cumulative reconciliation; unresolved months; unsupported cross-border cases; duplicates; beneficiary/basis separation; payment-date versus entitlement-month attribution; arrears and refunds. Use synthetic rules only to test engine mechanics where legal coverage is unavailable.

**Acceptance:** the engine runs under Node without React, browser APIs, Clerk, or network calls. Independent expected totals pass. No missing rule becomes zero; no estimated result is labeled as a payment, recoverable debt, interest, or penalty.

### Phase 4 — Build the anonymous form and custom design system

1. Create warm neutral light and coherent dark palettes with restrained indigo/teal accents, typography, spacing, radii, focus, contrast, and chart tokens. Override MUI buttons, inputs, cards, alerts, tooltips, accordions, and tables; avoid decorative gradients.
2. Follow system theme initially, expose light/dark/system selection, prevent first-render theme flash, and persist only that preference locally. Respect reduced motion and make storage-denied behavior safe.
3. Build one short form: accessible typed Romanian birthdate, cutoff month defaulted to last completed Bucharest month, explicit „Nu / Da / Nu știu” disability answer, and concise domestic/cross-border eligibility check with confirmed assumptions.
4. Add progressive details for certification changes, relevant education after 18, completion/withdrawal/repeated-year exceptions, interruptions/delayed applications/resumption, and old-regime historical facts. Unsupported details explain affected unresolved periods instead of offering invented calculations.
5. Every conditional field includes „De ce întrebăm?” and a concrete fictional example. Never assume university extends eligibility, apply current disability retrospectively, or request diagnoses/documents.
6. Build separate declared-payment and optional-benefit editors with recurring entries, refunds, arrears attribution, currency, beneficiary, and gross/received basis. Allow no accidental mode-switch conversion of estimates into declared payments.
7. Provide helpful inline errors, keyboard focus on error summaries, screen-reader result announcements, and layout support from 360px. Do not require sign-in.
8. Ship three clearly fictional, editable examples: ordinary domestic, changing certification, and historical missing coverage. Explain their differing coverage without presenting invented payment histories as real.

**Acceptance:** the standard journey fits one compact form; all conditional flows can be completed by keyboard; unknown answers are preserved. Refresh discards inputs; browser storage contains no scenario information. Guest form/component tests pass in both themes.

### Phase 5 — Results, explanations, and methodology

1. Build a common privacy-aware result view-model used by screen presentation and sharing. Display „Total estimat al alocației” only for complete verified coverage; otherwise „Subtotal pentru lunile verificate”, missing-month count, and exact uncovered ranges. Handle zero verified months without a misleading numeric total.
2. Put period and cutoff beside the prominent amount; distinguish requested range, verified months, ineligible months, and missing coverage. Display declared-payment labels in declared mode and keep other benefits separate.
3. Add annual bars and cumulative charts styled from theme tokens, equivalent accessible tables, expandable monthly details, and rule/source links. Show discontinuities for unknown periods rather than visually bridging them.
4. Add „Cum am calculat?” with worked steps, relevant assumptions, amount conversion/rounding, and the rules actually applied. Explain nominal values, lack of inflation adjustment, and the difference between entitlement and money received.
5. Make „Distribuie rezultatul” primary and „Salvează calculul” secondary, with unavailable saving states explained rather than hidden.
6. Add always-accessible methodology and privacy pages. Include coverage and source tables, last-checked dates, and dataset-specific FAQ answers about birth month, old/new lei, actual payments, and incomplete results. Qualify birth-month explanations by the applicable verified regime.

**Acceptance:** amount labels remain accurate for complete, partial, unresolved-only, and declared cases. Tables reconcile with charts and engine totals. Sources and methodology are reachable without authentication, and no interface claims official affiliation or legal certification.

### Phase 6 — Clerk integration and bounded scenario persistence

1. Integrate supported Clerk React/backend SDKs with a genuinely credential-free guest/demo mode. Do not mount broken authentication flows or mock successful sign-in/saving when keys are absent.
2. Add authenticated `GET /api/scenario`, `PUT /api/scenario`, and `DELETE /api/scenario`. Derive ownership exclusively from the verified Clerk session; never accept a user ID from request payloads. Validate authorized origins and apply appropriate session, CSRF, request-body, and rate-limit protections.
3. Save one compact scenario, not results, beneath a dedicated namespace in `privateMetadata`. Never use public/unsafe metadata or session claims. Fetch current metadata, preserve unrelated keys, validate the complete serialized UTF-8 byte count, and reserve explicit headroom below Clerk's documented 8KB ceiling.
4. Reject oversized scenarios with a readable error; never truncate. Do not log bodies, health-related inputs, or sensitive provider errors. Mark account responses `Cache-Control: no-store`; keep loaded scenario state in memory.
5. Require a deliberate save action and clear consent explaining which inputs are transmitted. Apply the server-side review gate as well as the UI gate. Until privacy/security review is complete, block cloud scenario writes, while authenticated deletion of pre-existing application data remains available.
6. Support explicit load and deletion, revalidation, schema/dataset versions, and safe logout/user-switch cache cleanup. Never silently upload the currently displayed guest scenario on sign-in.
7. Document concurrency honestly: this one-scenario MVP uses last-successful-write-wins; disable overlapping writes in one tab, fetch fresh metadata before mutation, and explain that cross-tab/device or external metadata-writer races are not atomic. Do not advertise conflict-free saving or a compare-and-swap guarantee Clerk does not provide.
8. Handle 401/403, missing configuration, validation errors, 413-sized payloads, provider 429/rate limits, unavailable datasets, and save/delete failures without losing the user's local work. Avoid uncontrolled automatic write retries.
9. Document purpose, minimization, retention/deletion, provider processing, access controls, consent/age-related legal questions, incident handling, and deployment security. Private metadata is not a compliance certification. Account deletion and Clerk session storage must be distinguished from the app's no-scenario-storage policy.

**Acceptance:** mocked backend tests cover ownership, unauthorized access, unavailable credentials/review gate, UTF-8 size limits, unrelated-key preservation, deletion, provider failures, and rate limits. Run a real Clerk test-instance smoke test only when credentials are supplied; otherwise report it as not run. Public deployment remains gated by review.

### Phase 7 — Private-by-default image sharing

1. Define an explicit export allowlist from the result view-model: qualified total/subtotal, selected period, aggregate annual data, cutoff, dataset version, app name/configured generic site address, and „Estimare”/„Sume declarate” label. Do not invent a deployed site address.
2. Exclude nickname/name, exact birthdate, certification/status, income, and detailed optional-benefit categories. Keep warnings generic where a specific unresolved reason could reveal disability or other private circumstances.
3. Render deterministic Canvas layouts at exactly 1080×1080, 1080×1350, and 1080×1920. Use distinct compositions for each size and theme; render the chart from data, not a stretched screenshot. Keep long periods, large amounts, and partial warnings legible.
4. Wait for bundled fonts to load before rendering; verify Romanian glyphs, explicit colors/backgrounds, and reliable pixel dimensions. Use only local assets to avoid canvas taint or export-time data transmission.
5. Show an explicit privacy preview explaining that totals and patterns can still disclose personal information. Require confirmation before download/native sharing; provide PNG download, caption copy, and generic app link.
6. Feature-detect native file sharing and handle cancellation without error spam; otherwise fall back to download/copy. Do not claim direct posting to unsupported social networks or automatically open/post anywhere.
7. Provide generic public Open Graph assets and metadata. No scenario data in URLs, fragments, telemetry, filenames, image metadata, or public crawler previews.

**Acceptance:** tests cover every dimension/theme, font readiness, fallback/cancellation behavior, privacy-field exclusion, and partial-warning persistence. Inspect actual exported PNGs and screenshots in both themes, including a missing-coverage result. Export works anonymously with cloud saving unavailable.

### Phase 8 — Final verification, documentation, and handoff

1. Run type checking, linting, legal-data validation, unit/component/server tests, Playwright, and frontend/backend production builds from a clean lockfile install. Smoke-test the production server and guest deployment, not just Vite development mode.
2. Exercise guest standard/unknown/historical examples, conditional inputs, declared arrears/refunds, mode switching, save consent/unavailability/errors/deletion, methodology navigation, and export fallbacks. Test desktop and 360px layouts in both themes and system-theme behavior; cover supported browser engines where date/share behavior differs.
3. Run automated accessibility checks plus manual keyboard, focus, screen-reader announcement, reduced-motion, zoom/reflow, and contrast checks. Describe WCAG 2.2 AA testing practices without claiming certification or a completed external audit.
4. Inspect screens and exported cards; test long Romanian labels, very large totals, no verified months, sparse charts, and interrupted network access. Check that private inputs do not appear in storage, URLs, console/application logs, or network requests before explicit permitted saving.
5. Write the README with runtime prerequisites, actual setup/development/test/build/start commands, environment setup, guest mode, Clerk configuration, single-scenario limits, and deployment instructions.
6. Deliver legal coverage/source documentation, calculation/rounding semantics, architecture decisions, privacy/security review checklist, dependency/font licenses, maintenance procedure, and known limitations. Record actual command outcomes and explicitly list tests/reviews not run or unavailable credentials/sources.

**Acceptance:** no unresolved correctness, privacy leakage, or misleading-result defect remains in the enabled scope. Unsupported scope is visibly disabled/documented. A fresh checkout is reproducible, and reviewers can trace each enabled legal rule to evidence and independent expected values.

## 4. Test and review strategy

| Layer | Purpose and independence |
| --- | --- |
| Legal-data checks | Structural validity, historical applicability, source IDs, precedence, explicit gaps, immutable version compatibility |
| Expected-value fixtures | Hand-worked monthly examples with sources and separate reviewer status; never derive expected totals with the engine under test |
| Domain tests | Calendar/status boundaries, money exactness, reconciliation, uncertainty, declared ledgers, and explicit exclusions |
| Component tests | Romanian validation, progressive fields, labels, guest use, theme controls, tables, consent and demo states |
| Server integration | Clerk ownership, gates, metadata size/preservation, deletion, concurrency semantics, provider errors and no-store responses |
| Browser tests | Keyboard/mobile journeys, charts/tables, themes, actual PNG generation/dimensions, privacy, and fallback sharing |
| Manual review | Official evidence, independently reviewed fixtures, screen reader/visual inspection, production privacy/security approval |

Use an injected clock and fixed reference dates in fixtures so results do not drift with test execution time. Maintain separate labels for synthetic behavior tests, source-backed expected values, and independently reviewed fixtures; do not claim review occurred until another reviewer has performed it.

## 5. Maintenance and release checklist

- [ ] Check official amendments, norms, freezes, beneficiary categories, and payment/entitlement distinctions before extending coverage.
- [ ] Record retrieval and applicable historical dates; review the evidence independently.
- [ ] Add a new immutable dataset version; preserve old versions and publish coverage changes.
- [ ] Add independent regression cases for every changed rate, boundary, precedence rule, or exception.
- [ ] Re-run dataset, engine, UI, account, export, and build checks; inspect partial-coverage warnings and both themes.
- [ ] Update methodology, last-checked dates, exclusions, fictional examples, and migration/recalculation messaging.
- [ ] Review SDK compatibility, dependency security, metadata budget, logging, and deployment origin/session controls.
- [ ] Confirm documented privacy/security approval before enabling public cloud saves; never infer approval from technical readiness.
- [ ] Publish an honest QA report, including unavailable source periods, unreviewed fixtures, and tests not run.

## 6. Completion milestones and unresolved dependencies

1. **Research baseline:** evidence inventory and truthful supported/unresolved coverage map.
2. **Verified core:** versioned dataset and pure engine with passing independent expected values for enabled coverage.
3. **Anonymous MVP:** short form, two result modes, separate optional ledger, accessible charts/tables, methodology, and fictional examples.
4. **Account-ready MVP:** working bounded Clerk endpoints and client states; writes remain disabled until privacy approval.
5. **Share-ready MVP:** three inspected private-by-default export formats with native/fallback flows.
6. **Handoff:** reproducible checks/build, documented legal/privacy limitations, and setup/maintenance guidance.

Dependencies that cannot be solved by implementation alone: access to official historical evidence; independent expected-value/legal review; a supplied Clerk test instance for live authentication testing; an approved deployment origin/site address; and children's/disability-data privacy/security review. None should be replaced by fabricated legal rates, simulated successful saves, invented review claims, or undocumented assumptions.