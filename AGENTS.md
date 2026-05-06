# eval-harness-admin Agents Notes

## Context restore (mandatory)

1. `docs/PROGRESS.md`
2. `PLAN.md`
3. `docs/RULES.md`
4. `docs/LESSON.md`
5. `AGENTS.md`
6. `CLAUDE.md`
7. `skills/eval-harness-admin-plan/SKILL.md`

## Operating mode

- Laravel package is the source of truth for backend API boundaries.
- Frontend is a read-only admin panel for consuming public `eval-harness` report API.
- No merge on:
  - CI red,
  - open Copilot must-fix comments,
  - unclosed implementation gaps in this task scope.

## PR model

- Subtask => PR → macro branch.
- Macro branch → `main` PR.
- Every PR cycle must include:
  - local gates (as per `docs/RULES.md`),
  - Copilot requested,
  - request verified in `requested_reviewers`,
  - closed actionable Copilot comments.

## Regola runtime e test server

- Non lasciare processi `php`/server di test aperti dopo aver finito uno step.
- Ogni avvio server in subtask deve essere associato a stop esplicito e verifica:
  - `Get-Process -Name php` non deve restituire `php` attivi;
  - nessun listener sulle porte `8000`, `8001`, `8002`, `8003`.
- In caso di fallimenti e2e:
  - chiudere subito server e tool watcher,
  - riaprirli solo quando necessario per la correzione successiva,
  - non proseguire con nuovi task con server zombie.

## Regola hard anti-zombie (immediata)

- Durante test/manual debugging **non aprire finestre nuove** di `cmd.exe`/`powershell.exe`.  
- Avviare `php`, `vite`, `node`, `npm` sempre con PID tracciato nel log step e chiuderli
  subito al termine (`Stop-Process -Id <PID>` o `Stop-Process -Name php -Force`).
- Fine step obbligatorio:
  1) conferma kill, 2) `Get-Process -Name php,node,npm,vite` non deve avere processi residui legati al task,
  3) `Get-NetTCPConnection -State Listen -LocalPort 8000,8001,8002,8003` vuota,
  4) solo dopo, aprire PR/iniziare subtask successivo.

## Regola anti-blocking local test (hard)

- Non avviare `cmd.exe`/`powershell.exe` interattivi a lungo per test server.
- Se serve background, preferire il runner `npm run e2e`/`php artisan serve` nel flusso CI del test e chiudere subito dopo.
- Checklist obbligatoria dopo ogni test locale:
  1. chiudere il processo avviato con `Stop-Process -Id <PID>` o `Stop-Process -Name php -Force`;
  2. verificare `Get-NetTCPConnection -State Listen -LocalPort 8000,8001,8002,8003`;
  3. se compare un processo residuo, forzare la chiusura prima di aprire nuovo subtask.
