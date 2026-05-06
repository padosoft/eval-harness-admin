# Roadmap — eval-harness-admin

## Obiettivo

Consegna completa del package Laravel `padosoft/eval-harness-ui` (Laravel `^13.0`, PHP `^8.3`) con admin SPA di **sette schermate** per il protocollo `eval-harness`:

- Dashboard
- Reports list
- Report detail
- Compare
- Trend
- Adversarial manifests
- Live batches

## Stato del progetto (2026-05-06)

- Branch principale macro: `main`
- Branch operativo corrente: `task/api-contracts-and-ux-improvements`
- Build/test baseline locale: verdi su `typecheck`, `test:unit`, `build`, `composer analyse`, `composer test`, `e2e`.
- **Nota operativa**: tutto il lavoro segue il loop PR/Copilot (richiesta revisore + verifica reale `requested_reviewers` + chiusura commenti must-fix + CI verde).

## Macro Task

### Macro 0 — Operating System (chiuso)

- Scope:
  - `AGENTS.md`, `CLAUDE.md`, `PLAN.md`, `docs/PROGRESS.md`, `docs/RULES.md`, `docs/LESSON.md`
  - `skills/eval-harness-admin-plan/SKILL.md`
  - `.github/copilot-instructions.md`, `.github/PULL_REQUEST_TEMPLATE.md`
  - regole anti-zombie processi e regole Copilot.
- Stato: **completo**
- Data verifica: 2026-05-06.

### Macro 1 — Package Foundation (chiuso)

- Scope:
  - Service provider, controller e rotte (prefix/middleware/config)
  - Config file pubblicabile e asset/config publishes
  - bootstrap JSON nel frontend.
- Stato: **completo**
- Deliverable tecnici:
  - `src/EvalHarnessUiServiceProvider.php`
  - `src/UiConfig.php`
  - `src/Http/Controllers/EvalHarnessUiController.php`
  - `routes/web.php`
  - `config/eval-harness-ui.php`
- Guardrail:
  - `composer validate --strict --no-check-publish`
  - `composer analyse`
  - `composer test`
  - `docs/PROGRESS.md` aggiornato.

### Macro 2 — Contratti API e adapter (chiuso)

- Scope:
  - Adapter endpoint completo (`/reports`, `/reports/{id}`, `/reports/{id}/diff/{otherId}`, cohort, histogram, trend, adversarial, live)
  - Validazione schema/errore e response handling (404/422/503)
  - Utility path + URL normalization.
- Stato: **completo**
- Deliverable:
  - `resources/js/services/evalHarnessApi.ts`
  - `resources/js/utils/path.ts`
  - `resources/js/services/evalHarnessApi.test.ts`
- Guardrail:
  - `npm run test:unit`

### Macro 3 — Frontend Foundation (chiuso)

- Scope:
  - Vite/React/Tailwind bootstrap, layout, stato base, componenti UI riutilizzabili.
  - `AppShell`, tabelle, chips, error/empty states.
- Stato: **completo**
- Deliverable:
  - `resources/js/main.tsx`
  - `resources/js/app.tsx`
  - `resources/js/context/AppContext.tsx`
  - `resources/js/components/ui/*`
  - `resources/js/app.test.tsx`
- Guardrail:
  - `npm run typecheck`
  - `npm run build`
  - `npm run test:unit`

### Macro 4 — Schermate core (chiuso)

- Scope:
  - Dashboard, Reports list, Report detail con tab (Summary/Cohorts/Histograms/Failures/Raw JSON), filtri e fallback states.
- Stato: **completo**
- Guardrail:
  - `tests/e2e/admin-ui.spec.ts` scenario:
    - Dashboard
    - Reports list + open detail + tab switching
  - `npm run e2e`

### Macro 5 — Compare/Trend/Adversarial/Live (chiuso)

- Scope:
  - Pagina compare con shortcut latest-vs-previous + stato differenziale.
  - Trend con dataset, metriche, overlay, cohorte.
  - Adversarial manifest list/detail.
  - Live batches e progress polling endpoint.
- Stato: **completo**
- Guardrail:
  - e2e scenario 3/4/5/6 di `tests/e2e/admin-ui.spec.ts`

### Macro 6 — i18n, a11y e polishes (completo)

- Scope:
  - i18n EN/IT presente per tutte le label principali
  - Accessibilità funzionale base (roles/labels/screen readers)
  - A11y automation avanzata con Axe su dashboard, report detail e trend.
- Stato: **completo**
- Deliverable:
  - `tests/e2e/accessibility.spec.ts`

### Macro 7 — Release, CI e docs (completo)

- Scope:
  - README completo v2 (wow level)
  - GitHub workflows CI + release tag
  - Chiusura roadmap/lesson/rules con procedura finale
  - Tag release `v0.1.0` (o semver da confermare da maintainers)
- Stato: **completo**
- Deliverable:
  - `.github/workflows/ci.yml`
  - `.github/workflows/release.yml`
  - `README.md`
  - `docs/PROGRESS.md`
  - `docs/LESSON.md`
  - `docs/RULES.md`

## Processo PR/Copilot obbligatorio

Ogni subtask:

1. implementazione con test locali nel punto
2. apertura PR sul branch macro
3. richiesta `--reviewer copilot`
4. verifica `gh api repos/<owner>/<repo>/pulls/<PR>/requested_reviewers`
5. verifica `/reviews` e `/comments`
6. merge solo con CI green e commenti must-fix risolti

## Stato finale del progetto

- Primo deliverable usabile: **v0.1.0** (`main` once merged via process loop).
- Prossimo hardening: chart unificato + template release note più strutturato.
