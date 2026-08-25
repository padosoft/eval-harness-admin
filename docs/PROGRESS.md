# Progress

## 2026-05-06 — chiusura finale roadmap (100%)

- Eseguiti tutti i gate locali dopo la chiusura Macro 7:
  - `composer install`
  - `npm ci`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run build`
  - `composer validate --strict --no-check-publish`
  - `composer analyse`
  - `composer test`
  - `npm run e2e`
  - `npm run e2e:accessibility`
- Post-test environment check:
  - `Get-Process -Name php,node,npm,vite`: nessun processo php/node/npm/vite legato al task in esecuzione attiva;
  - `Get-NetTCPConnection -State Listen -LocalPort 8000,8001,8002,8003`: nessun listener attivo.
- `PLAN.md`, `README.md`, `.github/workflows/ci.yml`, `docs/LESSON.md`, `docs/RULES.md` confermati coerenti per chiusura 100% roadmap.

## 2026-05-06 — finalizzazione completa progetto

- `tests/e2e/accessibility.spec.ts` aggiunto con verifica Axe su:
  - Dashboard
  - Report detail
  - Trend
- `docs/LESSON.md` aggiornato con la regola d'uso Axe per controlli seriocritici.
- `README.md` aggiornato con note su a11y checks e rilascio.
- Workflow finali di rilascio e CI già presenti e operativi:
  - `.github/workflows/ci.yml`
  - CI ora esegue anche `npm run e2e:accessibility`
  - `.github/workflows/release.yml`
- Macro 6 e Macro 7 marcate come completate in `PLAN.md`:
  - a11y automation
  - release flow/tag process

## 2026-05-06 — fase stabilization e closure

- Branch: `task/api-contracts-and-ux-improvements`
- Operato: stabilizzazione runtime + quality gate completo (PHP + UI):
  - `useApiResource` refactor per prevenire loop di fetch.
  - query selectors più robuste in Playwright.
  - patch tipo PHPStan (`json_encode` con `JSON_THROW_ON_ERROR`).
  - test backend/TypeScript/Playwright in verde.
- Test green locali:
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run build`
  - `composer validate --strict --no-check-publish`
  - `composer analyse`
  - `composer test`
  - `npm run e2e`

## 2026-05-06 — finalizzazione roadmap + release prep

- `PLAN.md` riscritto come piano operativo e macro-task completo.
- `docs/LESSON.md` aggiornato con regole operative persistenti (Copilot + anti-zombie).
- `docs/RULES.md` e `AGENTS.md` confermati come fonte primaria di processo.
- `.gitignore` introdotto per bloccare artifacti non versionabili:
  - `.phpunit.cache`, `node_modules`, `vendor`, `test-results`, screenshot temporanee.
- `README.md` aggiornato in versione "wow-level" con install, config, mapping endpoint, scenari test.
- In coda attività:
  - workflow CI GitHub
  - release workflow + tag semver
  - eventuali test a11y con Axe (step raccomandato).

## 2026-05-06 — regole operative aperte

- Ogni subtask è valido solo se:
  - test di scope passano;
  - PR aperta sul branch macro;
  - review Copilot richiesta e verificata reale;
  - CI verde;
  - commenti must-fix risolti.
- `main` non riceve merge finché non si completa il loop sopra.

## 2026-06-16 — Online monitoring screen (feat/online-monitoring-screen)

- Aggiunta l'ottava schermata "Online Monitoring" che consuma il nuovo endpoint core `GET /<prefix>/online/{dataset}/trend` (`eval-harness.report-api.v1.online-trend`, richiede `padosoft/eval-harness ^1.3.0`).
- `OnlineTrendPayload`/`OnlinePassRatePoint` types, `EvalHarnessApiClient.getOnlineTrend()` (mirror di `getDatasetTrend`), `PassRateLineChart` (SVG dependency-free con soglia tratteggiata + tabella dati visually-hidden per a11y/Playwright), `OnlineMonitoringPage`, rotta `/online-monitoring`, voce nav, chiavi i18n en/it, mock e2e + spec Playwright.
- Gate locali verdi: `tsc --noEmit` ok; `vite build` ok; `vitest run` => 6 test; `playwright test` => 11 test (incluso `online-monitoring.spec.ts` e accessibility).
- PROSSIMO STEP REMOTO: push branch, PR su `main`, loop Copilot/CI, release allineata a core v1.3.0.

## 2026-08-24 — Report detail for eval-harness 1.6

`padosoft/eval-harness` 1.6 added repeated sampling with real statistics, content
hashes and per-row aggregates, agent trajectories, cost and budgets. All of it
arrives in the report artifact this screen already fetches in full, so the work
was reading it rather than exposing it.

- `resources/js/utils/reportBlocks.ts` — readers for `precision`,
  `sample_aggregates`, `samples`, `cost` and `budget`, plus the orderings the CLI
  briefing uses (failing worst-first, worst execution of a row). Every reader
  returns `null`/`[]` for a pre-1.6 report.
- `components/report/PrecisionPanel` — repetitions, the detectable difference,
  whether the target delta is resolvable and at what cost, and the unstable rows.
- `components/report/RowsPanel` — per-row pass rate with its Wilson interval,
  `row_hash`, and an expandable worst execution carrying the actual output, the
  judge reason and the trajectory (including a loud line when a run stopped on a
  pending approval).
- `components/report/CostPanel` — billed vs derived, per-model table, the
  "floor, not a figure" warning for unpriced models, and a budget-halt alert.
- The halt alert is repeated in the page header so it is visible from every tab.
- **No zeroes for absent data.** A pre-1.6 report gets an explanation and a
  pointer at the flag that would produce the data; showing `0.0%` would be a
  number somebody could act on that nobody produced.
- i18n: 40 new keys in `en` and `it`.
- Tests: +18 (`26 passed`, was 8). New file:
  `resources/js/components/report/reportPanels.test.tsx`.
- Local gate green: `tsc --noEmit`; `npm run test` (26); `npm run build`.
  The PHP gate was not run locally — this session's proxy cannot authenticate to
  github.com for the Pest dist downloads — but the diff touches no PHP.
