# Copilot Instructions For Eval Harness Admin

## Scope

- Repo package Laravel `padosoft/eval-harness-ui`.
- In questa fase UI amministrativa read-only: niente azioni write verso `eval-harness`.

## Hard review rules

- Ogni PR richiede GitHub Copilot Code Review.
- Non si può chiudere un task finché:
  - i test locali del slice sono verdi,
  - `Copilot` ha risposto (o è stato verificato che non ci sono must-fix aperti),
  - la CI del PR è verde.

## Copilot engagement

- Richiesta principale:

```bash
gh pr create --base <base> --head <branch> --reviewer copilot ...
```

- Fallback GraphQL se `--reviewer copilot` o `@copilot` fallisce:

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

- Verifica reale che la richiesta Copilot sia stata registrata:

```bash
gh api repos/<owner>/<repo>/pulls/<PR>/requested_reviewers
```

- Leggi review e inline comments:

```bash
gh api repos/<owner>/<repo>/pulls/<PR>/reviews
gh api repos/<owner>/<repo>/pulls/<PR>/comments
```

- Non usare il fallback REST `reviewers[]=copilot` come prova sufficiente.

