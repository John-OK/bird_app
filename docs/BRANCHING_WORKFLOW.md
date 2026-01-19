# Branching workflow

## Long-lived branches

- `main`: development branch
- `production`: deployment branch

## Short-lived branches

Create a new branch off `main` for every change:

- `fix/<short-description>`
- `feat/<short-description>`
- `chore/<short-description>`

## Workflow

### Start work

- Ensure you are on `main`
- Pull latest
- Create a new branch for the work

### Implement change

- Make small commits with clear messages
- Keep changes scoped to the branch goal

### Merge

- Open a PR from your branch into `main`
- Merge when CI is green

### Promote to production

- Merge `main` into `production`
- Deploy from `production`

## Guardrails

- Avoid committing directly to `production`.
- Keep `production` deployable at all times.
