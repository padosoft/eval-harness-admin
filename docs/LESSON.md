# Lessons - eval-harness-admin

## 2026-05-06 — Quality gates non opzionali

- PHPStan level 8 può scoprire bug reali che i test runtime non mostrano: ad esempio mismatch di tipo tra `json_encode` e signature controller, `middleware` con chiavi non tipizzate, e warning nei test Pest (metodologie globali non riconosciute).
- In questo progetto, ogni subtask deve includere `composer analyse` oltre a `composer test` e i gate frontend.
- Se `composer analyse` fallisce, non marcare il PR come pronto anche se `composer test` è verde.

## 2026-05-06 — Copilot loop con validazione reale

- In `padosoft-laravel-flow` il check più affidabile resta `gh api repos/<owner>/<repo>/pulls/<PR>/requested_reviewers`: se non compare Copilot, la request non è effettiva.
- `gh pr edit ... --add-reviewer @copilot` o flag `reviewers[]=copilot` REST non bastano da soli a garantire un review reale.
- Il pattern operativo che conviene riusare:
  1. richiesta con `--reviewer copilot`;
  2. verifica reviewer;
  3. controllo review summary/thread con `reviews`, `comments` e, se utile, GraphQL `reviewThreads`.

## 2026-05-06 — Stabilità React hook e test selectors

- In React con `useApiResource(load, [])`, il valore `load` deve avere callback stabile o essere gestito via ref; altrimenti può scatenare loop continui di fetch.
- In querying test, preferire ruoli/semanicai (`getByRole`) invece di `findByText` su etichette duplicate (es. `Dashboard` nel link nav e nell'header).

## 2026-05-06 — Axe eccessivamente rumoroso: approccio pragmatico

- Aggiunta automazione a11y e2e su dashboard/detail/trend con `@axe-core/playwright`.
- Per evitare flakiness in UI dense, i controlli considerano vincoli `wcag2a`, `wcag2aa` e `section508` e falliscono solo su violazioni `serious`/`critical`.
- Inserito in guardrail finale con comando separato (`npm run e2e:accessibility`) e mantenuto dentro `npm run e2e`.

## 2026-05-06 — Configurazioni Laravel env robuste

- `UiConfig::middleware()` ora gestisce anche valore stringa in env per `route_middleware`/`middleware` (es. `"web,auth"`), oltre ad array.
- I fallback di tipo (`return list<string>`) evitano warning runtime quando il config è misconfigurato e mantengono testabilità del percorso.
- Aggiunto test dedicato (`tests/Unit/UiConfigTest.php`) per validare il parsing CSV in modo che il comportamento rimanga non regressivo anche quando config viene impostata da `.env`.
- `routes/web.php` usa ora `UiConfig::middleware()`/`UiConfig::prefix()` evitando la duplicazione/config drift tra parser nella config e middleware usati dal router.

## 2026-05-06 — Copilot review operativo

- In `padosoft-laravel-flow` la richiesta Copilot con
  `--reviewer copilot` (o `gh pr edit <PR> --add-reviewer @copilot`) non è sempre affidabile
  in ambienti con permessi GitHub CLI limitati.
- L’endpoint affidabile per verificare che il reviewer sia stato effettivamente richiesto è:
  `gh api repos/<owner>/<repo>/pulls/<PR>/requested_reviewers`.
  Se non compare `Copilot`, la richiesta non è attiva, anche se altri comandi hanno restituito successo.
- Il tentativo REST con `reviewers[]=copilot` può rispondere 200 senza creare una richiesta reale di Copilot.
  Va evitato per la verifica.
- Fallback documentato (da GitHub GraphQL) quando `gh pr create --reviewer copilot` o `gh pr edit` fallisce:

```powershell
$prNodeId = gh pr view <PR> --json id --jq .id

$query = @'
mutation RequestReviewsByLogin($pullRequestId: ID!, $botLogins: [String!], $union: Boolean!) {
  requestReviewsByLogin(input: {pullRequestId: $pullRequestId, botLogins: $botLogins, union: $union}) {
    clientMutationId
  }
}
'@

gh api graphql `
  -f query="$query" `
  -F pullRequestId="$prNodeId" `
  -F botLogins[]='copilot-pull-request-reviewer[bot]' `
  -F union=true
```

- Per sapere se Copilot ha effettivamente risposto non basta il solo flag `reviewer`:
  - controllare review summary: `gh api repos/<owner>/<repo>/pulls/<PR>/reviews`
  - controllare thread inline: `gh api repos/<owner>/<repo>/pulls/<PR>/comments`
  - se serve, controllare GraphQL `reviewThreads` con `isOutdated` / `isResolved`
    perché la UI GitHub può lasciare thread non-outdated anche dopo fix vicino alla stessa riga.
- Segnare in `docs/PROGRESS.md` solo stato durevole; il dettaglio round-trip Copilot/CI resta in PR.

## 2026-05-06 — Regole operative prese in carico

- Prima di ogni subtask e PR: documentare obiettivo, scope, test e stato Copilot in `docs/PROGRESS.md`.
- In questo package i loop PR sono obbligatori anche per task piccoli: niente merge con
  CI rosso o commenti must-fix non risolti.
- Aggiornare sempre `docs/LESSON.md` quando emerge una pratica riutilizzabile
  (tooling, workaround GitHub, regola CI/Copilot, edge case).

## 2026-05-06 — Anti-blocking: nessun processo server lasciato aperto

- Durante test e debug, nessun terminale/ finestra deve rimanere visibile: usare runner con server integrato
  (`playwright` con `webServer`, `php -S` in processo controllato con PID + `Stop-Process`).
- Regola obbligatoria per ogni subtask: processo in background **avviato e terminato** nello stesso giro di lavoro.
- Checklist minima:
  1. log del PID avviato;
  2. test/esecuzione;
  3. kill esplicito;
  4. verifica porte 8000-8003 non in LISTEN.
- Non considerare concluso un step se persistono `php`/server attachati dopo i test.

## 2026-05-06 — Processo e test: regola di chiusura immediata

- In caso di test local e crash UI, preferire sempre `npm run e2e` (webServer integrato) o processo con PID noto.
- Se è necessario un server manuale, chiuderlo subito dopo il test e verificare listener:
  - `Get-NetTCPConnection -State Listen -LocalPort 8000,8001,8002,8003`
  - `Get-Process -Name php`
- Aggiornare `docs/PROGRESS.md` solo dopo kill confermata; non avanzare task con server residui.

## 2026-05-06 — Regola operativa finale (risorse utente)

- Durante qualsiasi test o compilazione, evitare finestre CLI interattive visibili/foreground.
- Non aprire nuovi terminali `cmd.exe` o `powershell.exe` per test in background.
- Chiudere server/runner nel medesimo step (kill by PID) e verificare sempre:
  - `Get-NetTCPConnection -State Listen -LocalPort 8000,8001,8002,8003`
  - `Get-Process -Name php,node,npm,vite`
- Proibito chiudere un subtask con check positivi residui: il prossimo step parte solo dopo ambiente pulito.

## 2026-05-06 — Integrazione processo definitivo

- Per evitare effetti collaterali in questo progetto, durante la fase di finalizzazione ho consolidato:
  - verifica automatica listener/port dopo e2e;
  - verifica processi residui prima di aprire un nuovo subtask;
  - pulizia manuale di `node_modules`, `vendor`, `.phpunit.cache`, `test-results`.
- Regola operativa: se un test genera listener inatteso, il subtask resta bloccato e si apre un fix rapido prima di proseguire.
