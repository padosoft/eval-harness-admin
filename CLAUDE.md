# Eval Harness Admin Instructions

## First read

1. `docs/PROGRESS.md`
2. `PLAN.md`
3. `docs/RULES.md`
4. `docs/LESSON.md`
5. `AGENTS.md`
6. `skills/eval-harness-admin-plan/SKILL.md`

## Core rules

- Mantieni `Laravel ^13.0` e `PHP ^8.3/8.4`.
- Non scrivere modifiche dirette a `eval-harness` dal package (read-only iniziale).
- Nessun merge con CI rossa o commenti Copilot must-fix non risolti.
- I subtasks usano PR verso il branch macro corretto; macro verso `main`.
- Apri e completa il loop PR+Copilot in ogni round di push.
- Aggiorna `docs/PROGRESS.md` e `docs/LESSON.md` per ogni passaggio rilevante e per ogni lesson riutilizzabile.
- Se una sessione viene interrotta, apri anche `agents.md` nel tuo restore chain.
