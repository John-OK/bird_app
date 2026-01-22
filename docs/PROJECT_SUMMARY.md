# Project summary

## What this repository is

HelloBirdie is a Django + React/Vite web app that helps birders confirm bird identification in the field.

## Architecture

### Backend

- Django 4.0.6
- REST API (Django views returning JSON)
- Database: PostgreSQL
- Deployed with gunicorn behind systemd

### Frontend

- React
- Vite

### External services

- Abstract (IP geolocation)
- Xeno-Canto (bird vocalizations and locations)
- Thunder Forest (maps)

## Environments

### Local development

- Django runs from `backend/`
- Frontend runs from `frontend/`
- Environment variables live in `backend/.env` (not tracked)
- Template file: `backend/.env.example`

### Production

- Site hosted under `hellobirdie.2masterlight.site`
- Deployment is performed from the `production` branch

## Branch strategy

### Long-lived branches

- `main`: development branch
- `production`: deployment branch

### Short-lived branches

All work should be done in a short-lived branch off `main`:

- `fix/<short-description>`
- `feat/<short-description>`
- `chore/<short-description>`

## CI/CD

### CI

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Runs on:
  - pushes to `main` and `production`
  - pull requests targeting `main` and `production`
- Jobs:
  - backend syntax check (`python -m compileall backend`)
  - frontend build (`npm ci` + `npm run build`)

### Deployment

- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Manual workflow (`workflow_dispatch`)
- Deploys only if run against `refs/heads/production`
- Connects to VPS via SSH
- Updates working tree to `origin/production`
- Installs Python requirements, runs migrations
- Builds frontend
- Restarts systemd service

## Debugging and maintenance docs

- Debugging workflow: `docs/DEBUGGING_WORKFLOW.md`
- Branching workflow: `docs/BRANCHING_WORKFLOW.md`

## Local debugging configs

- Run and Debug configurations live in `.vscode/launch.json` (local-only)
- Recommended extensions live in `.vscode/extensions.json`

## Current work

- Next feature/bugfix to tackle: fix "My Birds" page behavior

### Plan for the "My Birds" bug

1. Identify the failing boundary
   - Check browser console and network requests (status code + response payload)
   - Determine whether the issue is frontend rendering/state, backend API, auth/session, or data
2. Lock the bug in with a regression test (TDD)
   - Prefer a backend pytest test if the issue is in the API response, permissions, or data
   - Prefer a frontend test if the issue is rendering/state (only if the frontend has a test harness)
3. Implement the smallest fix
   - Make the minimal code change that satisfies the test
4. Verify end-to-end
   - Re-test the My Birds page in the browser
   - Confirm CI remains green

## AI assistant collaboration guidelines

When using an AI assistant on this project, prefer a teach-first approach:

1. Ask clarifying questions before proposing changes.
2. Guide the user through the steps to complete the task, rather than completing the task end-to-end.
3. Do not provide code unless the user explicitly asks for code.
4. Follow a TDD workflow when fixing bugs:
   - Reproduce the issue.
   - Identify the failing boundary.
   - Add a regression test.
   - Make the smallest change to pass the test.
   - Refactor with tests staying green.
5. Encourage debugging habits:
   - Use breakpoints and the Debug Console to inspect state.
   - Use browser DevTools for frontend issues.
   - Prefer small, incremental commits.
