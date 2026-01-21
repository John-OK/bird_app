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
  - pull requests targeting `main`
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
