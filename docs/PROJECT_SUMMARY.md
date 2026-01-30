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

Local frontend options:

- Production-like: `npm run build` generates frontend assets into `backend/static/` and Django serves them.
- Developer UX: `npm run dev` runs Vite on `http://localhost:5173` and proxies backend API requests to Django.

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

### Recent accomplishments

- Fixed the "My Birds" page rendering for both:
  - empty state (no saved birds)
  - table state (saved birds)
- Added frontend regression tests for `MyBirdsPage` using Vitest + React Testing Library.
- Improved local development workflow:
  - Vite dev server proxies backend endpoints to Django for cookie/session auth.
  - Django `dev` settings allow Vite origin for CSRF.

### Next priorities (most impactful first)

1. Search results UX (map-first) and density handling
   - Add clustering for dense results at lower zoom levels
   - Add a side panel list for results (common name + scientific name, call quality, call notes/type)
   - Add hover-to-preview behavior (hover list item or map marker shows popup)
2. Map/search visualization consistency (bug + polish)
   - Investigate intermittent “search bounding box shifts west” issue
   - Make the search radius visualization circular (not rectangular)
   - Ensure only birds inside the search radius are displayed
3. Saved birds UX + data model
   - Improve table styling (spacing, borders, alignment, responsive layout)
   - Add per-row delete button (delete individual saved bird record)
   - Add saved bird fields (scientific name, notes) and make all fields editable for now
   - Clarify save behavior and messaging (e.g., “Saving bird at your current location.”)
   - Consider “quick save” vs “detailed save” flow
4. Authentication UX modernization
   - Replace page navigation for login/signup with a more modern UX (e.g., modal)
   - Improve form validation and error handling
   - Review security posture (session handling, CSRF behavior, rate limiting, password policy)
   - Optional: evaluate SSO options under strict privacy constraints
5. Search center UX
   - Default center should be “current location” unless explicitly changed
   - Allow the user to set a new search center (click-to-set and/or “use map center” button)
   - Ensure panning/zooming does not automatically change the search center without explicit action
   - If location cannot be determined, provide a way for the user to pick a location
6. Geolocation fallback reliability
   - When browser geolocation is denied, use IP-based geolocation reliably
   - Investigate Abstract API failure (“max retries exceeded”) and switch provider if needed

### Decisions and constraints

- Search radius: default to 100km; user can change it
- Search center: default to “current location” unless explicitly changed
- Saved birds editing: user can edit any field (for now)
- SSO: major providers acceptable only if we do not add trackers to the page or degrade user privacy/security

### Suggested saved bird fields

- Common name
- Scientific name
- Saved coordinates (user location at time of save; optionally allow adjustment)
- Date/time saved
- Notes (free text)
- Optional: call quality
- Optional: call notes/type
- Optional: source recording URL (Xeno-Canto) and recording ID

### Remaining open questions

- Search radius controls: should radius be adjusted via a side panel control, a settings modal, or both?
- Location selection fallback: if user location and IP location fail, which flow is preferred?
  - map click-to-set
  - search for a place name (city/state/country)
  - direct lat/lng entry

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
