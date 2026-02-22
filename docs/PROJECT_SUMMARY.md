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

1. ✅ **RESOLVED:** Map: intermittent search bounding box shifts west
   - **Solution implemented (PR1 + PR2):**
     - Backend: `/find_birds/` now accepts `coords` in request body with validation (backward compatible)
     - Frontend: Created `useUserLocation` hook for location state management
     - Frontend: `checkBird()` now sends `coords` with every search request
     - Frontend: Search disabled until location available
     - Frontend: Extracted validation utilities to `searchValidation.js`
   - **Result:** Bounding box now appears in correct location, no more westward shift
   - **Cleanup completed:** Backend global `user_coords` and `/update_user_coords/` endpoint removed (PR: feat/geolocation-reliability)

2. ✅ **RESOLVED:** Geolocation fallback: Fix IP geolocation fallback reliability
   - **Solution implemented (PR: feat/geolocation-reliability):**
     - Backend: Implemented three-tier API fallback cascade:
       1. IPLocate.io (primary) - postal/ZIP code precision
       2. ipgeolocation.io (fallback 1) - postal/ZIP code precision
       3. Abstract API (fallback 2) - postal/ZIP code precision
     - Backend: Added rate limiting (20 requests/minute per IP) using Django cache
     - Backend: Removed race condition code (`user_coords` global, `update_user_coords()` endpoint)
     - Backend: Updated `find_birds_post()` to require `coords` parameter (no fallback to global state)
     - Backend: Created `DEFAULT_COORDS` constant for legacy `find_birds()` GET endpoint
     - Tests: Added comprehensive test suite (`test_geolocate.py`) with 5 tests covering fallback cascade and rate limiting
     - Tests: Updated `test_find_birds_post_coords.py` to expect 400 error when coords not provided
   - **Result:** Reliable IP geolocation with automatic failover, no race conditions
   - **Note:** Production `.env` updated with `IPLOCATE_API_KEY` and `IPGEOLOCATION_API_KEY`

3. ✅ **RESOLVED:** Map UX: Implement flyTo animation on location determination
   - **Solution implemented (PR: feat/map-flyto-animation):**
     - Frontend: Created `FlyToLocation` component using `useMap()` hook
     - Frontend: Map initializes at zoom level 3, center `[12.5, 12.5]`
     - Frontend: `FlyToLocation` watches `position` changes and triggers smooth `flyTo` animation
     - Frontend: Animation only triggers once when real position is determined (ignores default fallback `[12.5, 12.5]`)
     - Frontend: User location marker only appears after real position is determined
     - Frontend: Uses `useRef` to prevent multiple animations
     - Animation: 1.5 second duration, flies from initial view to user location at zoom level 9
   - **Result:** Smooth, professional map animation on location determination, improved UX
   - **HOTFIX (production bug):**
     - **Bug:** IP geolocation fallback caused white screen crash with "Invalid LatLng object: (undefined, undefined)"
     - **Root cause:** Backend returns `{coords: [lat, lng]}` but frontend was accessing `data.latitude` and `data.longitude`, resulting in `undefined` coordinates
     - **Additional issue:** React StrictMode caused `useEffect` to run twice, triggering both success and error callbacks, with IP fallback overwriting browser geolocation
     - **Fix 1:** Updated `useUserLocation.js` to parse `data.coords` array instead of `data.latitude/longitude`
     - **Fix 2:** Added `useRef` to track if browser geolocation succeeded, preventing IP fallback from overwriting precise location
     - **Files changed:** `frontend/src/hooks/useUserLocation.js`
     - **Result:** IP geolocation fallback works correctly, browser geolocation takes precedence when available

4. ✅ **RESOLVED:** Frontend cleanup: Standardize on Axios (convert fetch to axios)
   - **Decision:** Keep Axios as the standard HTTP client library
   - **Rationale:**
     - Axios handles Django CSRF tokens automatically via global config
     - Better error handling (rejects on HTTP errors, fetch does not)
     - Automatic JSON transformation (no manual `.json()` calls)
     - Cleaner, more maintainable code
     - Bundle size impact negligible (~15.4 KB gzipped, 6% of React-DOM)
     - Switching to fetch would require 2-3 hours with high risk, zero user benefit
   - **Action taken:** Convert `useUserLocation.js` from fetch to axios for consistency
   - **Files changed:** `frontend/src/hooks/useUserLocation.js`, `frontend/src/hooks/__tests__/useUserLocation.test.jsx`
   - **Result:** All HTTP requests now use Axios consistently across the codebase

5. Auth modernization: replace login/signup pages with modal-based flow
   - Replace page navigation for login/signup with a more modern UX (e.g., modal)
6. Saved birds: saved birds table styling improvements
   - Improve table styling (spacing, borders, alignment, responsive layout)
7. Saved birds: delete individual saved bird record
   - Add per-row delete button (delete individual saved bird record)
8. ✅ **RESOLVED:** Map: circular search radius visualization + filter results to circle
   - **Solution implemented (PR: feat/circular-search-radius):**
     - Frontend: Replaced `Rectangle` with `Circle` component in `BirdMap.jsx`
     - Frontend: Updated `NavBarBC.jsx` to handle `radius` prop instead of `boxLimits`
     - Frontend: Circle displays at 100km radius (100000 meters) centered on user location
     - Backend: Added `filter_by_circular_distance()` function in `xeno_canto_processing.py`
     - Backend: Filters birds by great circle distance using `distance_on_unit_sphere()`
     - Backend: Two-stage filtering: box query to Xeno-Canto API (required), then circular distance filter
     - Backend: Handles missing/invalid bird coordinates gracefully
     - Backend: Returns `radius` in meters for frontend Circle component
     - Backend: Removed unused `filter_bird_data()` function (YAGNI)
     - Backend: Fixed coordinate key names (`"lon"` not `"lng"` per Xeno-Canto API)
     - Backend: Cleaned up imports (removed alias, use `distance_on_unit_sphere` directly)
   - **Result:** Professional circular radius visualization, accurate distance-based filtering, improved UX
9. UI/UX: add a loading spinner during API calls
   - Add loading indicators for long-running requests (search + saved birds)
10. Deactivate “Confirm that bird” button after bird is confirmed
    - Prevent double-click/double-save
    - Replace with a clear “Saved” state (or disable with helper text)
11. Indicate logged-in user's bird sightings and adjust UI elements to reflect this
    - Visually differentiate “already saved” sightings from new sightings
    - Ensure action buttons reflect current saved/unsaved state
12. Map: cluster dense bird results on map
    - Cluster dense results at lower zoom levels
    - Ensure popups and “confirm bird” behavior still work on clustered markers
13. Search Results: results side panel (common + scientific name, quality, notes/type)
    - Add a side panel list for results while keeping the map as the primary view
    - List items should show at least:
      - common name + scientific name
      - call quality
      - call notes/type
    - Clicking a list item should focus the corresponding marker (and/or open its popup)
14. Map: hover map marker to preview popup
    - Add hover-to-preview behavior (hover list item or map marker shows popup)
    - Mobile fallback: tap-to-preview
15. Saved birds: add editable fields: scientific name + notes (+ optional metadata)
    - Store scientific name + notes for a saved bird
    - Allow editing existing saved bird records
16. Auth modernization: security review: CSRF/session + rate limiting + password policy
    - Review CSRF + session cookie behavior in both dev (Vite proxy) and production (nginx + gunicorn)
    - Add rate limiting for login/signup endpoints
    - Confirm password policy requirements
17. Auth modernization: evaluate SSO with strict privacy constraints
    - Keep the “no trackers / no privacy regression” constraint explicit in the implementation approach
18. Search center: explicit “set search center” UX
    - Allow the user to set a new search center (click-to-set and/or “use map center” button)
    - Ensure panning/zooming does not automatically change the search center without explicit action
    - If location cannot be determined, provide a way for the user to pick a location
19. Auth modernization: improve form validation and error handling
    - Improve client-side validation (fast feedback)
    - Improve server error display (clear, user-friendly messaging)
20. Saved birds: clarify save behavior and messaging (e.g., “Saving bird at your current location.”)
    - Consider showing the saved timestamp + coordinates in the UI as confirmation
21. Saved birds: consider “quick save” vs “custom save” flow
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
