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
- Deactivated the "Check" button in the search bar.
- Added frontend regression tests for `MyBirdsPage` using Vitest + React Testing Library.
- Improved local development workflow:
  - Vite dev server proxies backend endpoints to Django for cookie/session auth.
  - Django `dev` settings allow Vite origin for CSRF.
- Hardened IP-based geolocation in production by preferring the nginx-provided `X-Real-IP` header over user-controllable `X-Forwarded-For`.

### Next priorities (most impactful first)

1. Map: intermittent search bounding box shifts west (In Progress)
   - Symptom: after a search, the map’s blue bounding box (and/or results) intermittently appears shifted west of where it should be.
   - Data flow / where this comes from:
     - Frontend:
       - `frontend/src/components/NavBarBC.jsx` `checkBird()` calls `POST /find_birds/` and stores `response.data.box_limits` in `boxLimits`.
       - `frontend/src/components/BirdMap.jsx` renders `<Rectangle bounds={props.boxLimits} ... />`.
     - Backend:
       - `backend/bird_app/views.py` `find_birds_post()` calls `get_bird_data(...)`.
       - `backend/bird_app/xeno_canto_processing.py` `get_bird_data()` computes `box_limits = [[min_lat, min_long], [max_lat, max_long]]` from `get_radius_limits()`.
   - Useful existing debug output:
     - `backend/bird_app/views.py` prints `user_coords` for each `/find_birds/` request.
     - `backend/bird_app/xeno_canto_processing.py` prints `radius limits` and the `box string` it sends to Xeno-Canto.
   - Leading hypotheses (to confirm/deny):
     - Backend uses a process-wide global `user_coords` list that is updated by `POST /update_user_coords/`.
       - Race: user searches before `/update_user_coords/` completes.
       - Contention: another request overwrote `user_coords` (not per-user).
     - Frontend fallbacks update UI `position`, but may not update backend `user_coords`.
       - That means the UI `position` can diverge from backend `user_coords`, producing a “shifted” bounding box.
     - Longitude math edge cases (dateline / sign issues) in `calc_coord_limits()` / `meridian_correction()`.
   - Repro / investigation checklist:
     - Hard refresh then immediately run a search (before the location update finishes).
     - Deny geolocation permission and then search (forces the fallback path).
     - Compare:
       - Frontend `position` vs backend `user_coords` at the moment `find_birds_post()` runs.
       - Backend-calculated `radius_limits` and emitted `box_limits`.
     - If confirmed as a `user_coords`/race issue, likely fixes include:
       - Send `coords` with the `/find_birds/` request (avoid global mutable server state).
       - Disable search until location update has completed successfully.
2. Geolocation fallback: IP geolocation fallback reliability (Abstract failures) + alternative provider
   - When browser geolocation is denied, use IP-based geolocation reliably
   - Investigate Abstract API failure (“max retries exceeded”) and switch provider if needed
3. Auth modernization: replace login/signup pages with modal-based flow
   - Replace page navigation for login/signup with a more modern UX (e.g., modal)
4. Saved birds: saved birds table styling improvements
   - Improve table styling (spacing, borders, alignment, responsive layout)
5. Saved birds: delete individual saved bird record
   - Add per-row delete button (delete individual saved bird record)
6. Map: circular search radius visualization + filter results to circle
   - Make the search radius visualization circular (not rectangular)
   - Ensure only birds inside the search radius are displayed
7. UI/UX: add a loading spinner during API calls
   - Add loading indicators for long-running requests (search + saved birds)
8. Deactivate “Confirm that bird” button after bird is confirmed
   - Prevent double-click/double-save
   - Replace with a clear “Saved” state (or disable with helper text)
9. Indicate logged-in user's bird sightings and adjust UI elements to reflect this
   - Visually differentiate “already saved” sightings from new sightings
   - Ensure action buttons reflect current saved/unsaved state
10. Map: cluster dense bird results on map
    - Cluster dense results at lower zoom levels
    - Ensure popups and “confirm bird” behavior still work on clustered markers
11. Search Results: results side panel (common + scientific name, quality, notes/type)
    - Add a side panel list for results while keeping the map as the primary view
    - List items should show at least:
      - common name + scientific name
      - call quality
      - call notes/type
    - Clicking a list item should focus the corresponding marker (and/or open its popup)
12. Map: hover map marker to preview popup
    - Add hover-to-preview behavior (hover list item or map marker shows popup)
    - Mobile fallback: tap-to-preview
13. Saved birds: add editable fields: scientific name + notes (+ optional metadata)
    - Store scientific name + notes for a saved bird
    - Allow editing existing saved bird records
14. Auth modernization: security review: CSRF/session + rate limiting + password policy
    - Review CSRF + session cookie behavior in both dev (Vite proxy) and production (nginx + gunicorn)
    - Add rate limiting for login/signup endpoints
    - Confirm password policy requirements
15. Auth modernization: evaluate SSO with strict privacy constraints
    - Keep the “no trackers / no privacy regression” constraint explicit in the implementation approach
16. Search center: explicit “set search center” UX
    - Allow the user to set a new search center (click-to-set and/or “use map center” button)
    - Ensure panning/zooming does not automatically change the search center without explicit action
    - If location cannot be determined, provide a way for the user to pick a location
17. Auth modernization: improve form validation and error handling
    - Improve client-side validation (fast feedback)
    - Improve server error display (clear, user-friendly messaging)
18. Saved birds: clarify save behavior and messaging (e.g., “Saving bird at your current location.”)
    - Consider showing the saved timestamp + coordinates in the UI as confirmation
19. Saved birds: consider “quick save” vs “custom save” flow
    - Decide whether “quick save” is the default path, with “edit details” as an optional follow-up

### Later (backlog ideas)

- (Add new ideas here that are not yet represented as Kanban cards.)

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
