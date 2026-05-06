# Eval Harness UI Rules

## Source of truth

- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `docs/LESSON.md`
- `AGENTS.md`
- `skills/eval-harness-admin-plan/SKILL.md`

## Scope

- Package read-only per `eval-harness` report API (nessun trigger/dispatch lato package nelle prime versioni).
- Integrazione host-driven: auth, policy, tenancy, audit e deployment policy restano dell’app host.
- UI in stile operativo dense dashboard, no landing page.

## Stack e defaults (attesi in questo ciclo)

- Laravel `^13.0`
- PHP `^8.3` (8.4 consigliato in CI)
- Build asset: Vite
- JS: React + TypeScript + Tailwind + Vitest + Playwright
- i18n: almeno `en` e `it`

## UI rules

- Nessuna card nested non necessaria.
- Bordi e componenti con `rounded <= 8px`.
- Colore secondario non unico canale semantico (usa sempre label/icone per stato).
- Focus visibile su tabelle, tabs, filtri, download, paginazione.
- Evita layout che “mascherano” tabelle/valori di grafici.

## Contract/API rules

- Validare sempre `schema_version` (e `schema` quando presente).
- Stato per ogni endpoint:
  - `200`: render UI normale.
  - `404`: empty state dedicata e azione correttiva.
  - `422`: stato “parametro non valido” + reset input.
  - `503`: stato degradato + retry + hint configurazione.
- Non affidarsi a path/strutture interne di `eval-harness`.
- Endpoint richiesti:
  - `GET /reports`
  - `GET /reports/{id}`
  - `GET /reports/{id}/cohorts`
  - `GET /reports/{id}/histograms`
  - `GET /reports/{id}/diff/{otherId}`
  - `GET /reports/{id}/rows.csv`
  - `GET /reports/{id}/download`
  - `GET /datasets/{name}/trend`
  - `GET /adversarial/manifests`
  - `GET /adversarial/manifests/{name}`
  - `GET /batches/live`
  - `GET /batches/{id}/progress`

## Testing rules

- Backend/package:
  - `composer validate --strict`
  - `composer test` o suite equivalenti del package
  - `composer analyse`
- Frontend:
  - `npm run test` (Vitest)
  - `npm run build`
  - `npm run e2e` (Playwright)
  - `npm run typecheck`
  - per i componenti critici anche snapshot/accessibility (Axe su dashboard / detail / trend)
- Playwright richiede server locale in `http://127.0.0.1:8000`; senza app avviata il test fallisce con `ERR_CONNECTION_REFUSED`.

## PR rules

- Ogni subtask deve avere:
  - gate locali verdi,
  - PR aperta con Copilot review richiesta,
  - loop fino a CI + review complete,
  - merge solo a esito OK.
- Aggiorna `docs/PROGRESS.md` dopo ogni passaggio reale.
- Aggiorna `docs/LESSON.md` solo con conoscenza riutilizzabile/accaduta.

### Copilot review (controlli effettivi)

- `requested_reviewers` deve mostrare Copilot visibile.
- Verificare anche review/comments, non solo apertura PR.
- PR non chiudibile con CI verde ma senza ciclo Copilot completo.

### Copilot engagement (operativo)

- Richiedere Copilot con `--reviewer copilot` nel comando `gh pr create`.
- Se fallisce (login non risolto / permesso insufficiente), usare fallback GraphQL con
  `copilot-pull-request-reviewer[bot]` e `requestReviewsByLogin`.
- Verifica reale:
  - `gh api repos/<owner>/<repo>/pulls/<PR>/requested_reviewers` deve mostrare `Copilot`.
  - `gh api repos/<owner>/<repo>/pulls/<PR>/reviews`
  - `gh api repos/<owner>/<repo>/pulls/<PR>/comments`
- Non considerare validi:
  - PR aperte senza reviewer Copilot verificato,
  - PR con solo `gh pr edit`/`reviewers[]=copilot` senza review/thread visibili.
- Per thread post-review, la proprietà `isOutdated` non è sempre affidabile da sola:
  leggere sempre il contenuto alla linea/posizione indicata prima di chiudere.

## Regola operativa: processi e server in test

- Non aprire sessioni CMD/PowerShell interattive per test; evitare finestre focalizzate.


- In test locali, evitare server lanciati da finestre interattive.  
  Preferire il flusso nativo di Playwright (`webServer`) o processi senza finestra.
- Regola hard-stop per ogni subtask che apre server:
  1. avviare il processo con riferimento PID o comando tracciato;
  2. eseguire test;
  3. terminare subito tutti i processi avviati (`Stop-Process -Id <pid>` o `Stop-Process -Name php`);
  4. verificare che non restino listener su 8000/8001/8002/8003.
- Aggiornare `docs/PROGRESS.md`/`LESSON.md` quando un processo viene lasciato accidentalmente aperto e come è stato recuperato.
- Se la chiusura non riesce, fermare la sessione sul task corrente, registrare il blocco nel `PROGRESS.md` e riprendere solo dopo kill verificato.

### Hard stop release

- Macro-task e2e/feature chiuso solo se:
  - guardrail tecnici passati;
  - PR/loop Copilot verificato;
  - PR review e commenti must-fix risolti;
  - ambiente pulito (nessun listener 8000-8003, nessun processo php/node/vite residuo);
  - `README.md` aggiornato per lo stato attuale.
