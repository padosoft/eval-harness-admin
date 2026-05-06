---
name: eval-harness-admin-plan
description: Gestisci la sessione operativa su eval-harness-admin. Include bootstrap, PR loop e ingaggio Copilot con fallback GitHub GraphQL.
---

# Eval Harness Admin Plan

## Primo passaggio ad ogni sessione

1. `docs/PROGRESS.md`
2. `PLAN.md`
3. `docs/RULES.md`
4. `docs/LESSON.md`
5. `AGENTS.md`
6. `skills/eval-harness-admin-plan/SKILL.md`

poi:

```bash
git status --short --branch
git log --oneline --decorate -5
```

## Copilot review loop (obbligatorio)

Per ogni PR, anche se la modifica è piccola:

1. implementa la slice coerente con il subtask
2. esegui gate locali del subtask
3. apri PR con `--reviewer copilot`
4. attendi CI e Copilot review
5. leggi commenti, fix e rilancia finché:
   - CI green
   - review Copilot completa / senza must-fix aperti
6. merge solo dopo exit criteria positivo

### Comando PR iniziale (preferito)

```bash
gh pr create \
  --base <base> \
  --head <branch> \
  --title "..." \
  --body-file .github/PULL_REQUEST_TEMPLATE.md \
  --reviewer copilot
```

### Perché non basta sempre

- In alcuni repo/ambienti `--reviewer copilot` o `gh pr edit <PR> --add-reviewer @copilot`
  possono fallire per assenza permessi su GraphQL/API o risoluzione login Copilot.
- In quel caso usare fallback GraphQL.

### Fallback Copilot (GitHub CLI + GraphQL, PowerShell)

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

### Verifica "copilot richiesto + copilot risponde"

Usare questi comandi in ordine:

```bash
gh api repos/<owner>/<repo>/pulls/<PR>/requested_reviewers
gh pr view <PR> --json number,reviewDecision,statusCheckRollup
gh api repos/<owner>/<repo>/pulls/<PR>/reviews --jq '.[] | {state:.state,user:.user.login,submitted_at,body}'
gh api repos/<owner>/<repo>/pulls/<PR>/comments --jq '.[] | {path:.path,line:.line,user:.user.login,body:.body}'
```

Segni che Copilot non ha ancora risposto:

- reviewer Copilot assente in `requested_reviewers`
- nessuna riga in `/reviews`
- nessun commento top-level o inline

Se le review non arrivano subito, attendere 60–180 secondi e ripetere.

Per capire meglio stato thread e outdated/resolved (utile dopo fix vicino alle righe già commentate):

```bash
query='
query($owner:String!, $repo:String!, $number:Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$number) {
      reviewThreads(first:100) {
        nodes {
          isResolved
          isOutdated
          comments(first:10) {
            nodes { author { login } path line outdated body }
          }
        }
      }
    }
  }
}'
gh api graphql -f query="$query" -f owner='<owner>' -f repo='<repo>' -F number=<PR>
```

### CI / PR status

```bash
gh run list --branch <branch> --limit 5 --json databaseId,name,status,conclusion
gh run view <run-id> --json name,status,conclusion
```

### Backend/local gates aggiuntivi (consigliati)

```bash
composer analyse
composer test
composer validate --strict --no-check-publish
```

### Che cosa è must-fix

- bug funzionale, regressione sicurezza, test mancanti su branch rilevante, edge case non trattato.
- un PR non si considera chiuso finché qualsiasi must-fix resta aperto.

### Anti-pattern da evitare

- non fermarsi a “PR aperto”
- non mergeare con CI non verde
- non dichiarare done senza leggere i commenti Copilot
- non usare `reviewers[]=copilot` REST come equivalente alla richiesta reale
