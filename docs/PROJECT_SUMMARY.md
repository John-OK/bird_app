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
- **Saved birds table styling improvements:**
  - Applied professional Bootstrap styling (table-striped, table-hover, table-bordered)
  - Added responsive wrapper for mobile support
  - Styled empty state with subtle background and rounded corners
  - Added proper spacing and visual hierarchy
  - Changed "Delete?" column header to "Actions" for professionalism
- **Delete individual bird functionality:**
  - Backend: Created `/delete_bird/<int:bird_id>/` endpoint with user ownership verification
  - Backend: Added proper error handling (404 for not found, 500 for server errors)
  - Backend: Used `@api_view(["DELETE"])` decorator for consistency
  - Frontend: Added delete button to each table row with Bootstrap styling
  - Frontend: Implemented confirmation dialog to prevent accidental deletion
  - Frontend: Added immediate UI state update after successful deletion
  - Frontend: Enhanced "Delete All" function with confirmation and state management
  - Frontend: Moved "Delete All" button from navbar to table footer for better UX
  - Frontend: Used semantic HTML `<tfoot>` with visual separation (table-secondary background)
  - Frontend: Added bird count to "Delete All" button text for user awareness
  - Result: Professional, user-friendly delete functionality with proper security and UX
- **Map: intermittent search bounding box shifts west:**
  - Backend: `/find_birds/` now accepts `coords` in request body with validation (backward compatible)
  - Frontend: Created `useUserLocation` hook for location state management
  - Frontend: `checkBird()` now sends `coords` with every search request
  - Frontend: Search disabled until location available
  - Frontend: Extracted validation utilities to `searchValidation.js`
  - Result: Bounding box now appears in correct location, no more westward shift
  - Cleanup completed: Backend global `user_coords` and `/update_user_coords/` endpoint removed (PR: feat/geolocation-reliability)
- **Geolocation fallback: Fix IP geolocation fallback reliability:**
  - Backend: Implemented three-tier API fallback cascade (IPLocate.io → ipgeolocation.io → Abstract API)
  - Backend: Added rate limiting (20 requests/minute per IP) using Django cache
  - Backend: Removed race condition code (`user_coords` global, `update_user_coords()` endpoint)
  - Backend: Updated `find_birds_post()` to require `coords` parameter (no fallback to global state)
  - Backend: Created `DEFAULT_COORDS` constant for legacy `find_birds()` GET endpoint
  - Tests: Added comprehensive test suite (`test_geolocate.py`) with 5 tests covering fallback cascade and rate limiting
  - Tests: Updated `test_find_birds_post_coords.py` to expect 400 error when coords not provided
  - Result: Reliable IP geolocation with automatic failover, no race conditions
  - Note: Production `.env` updated with `IPLOCATE_API_KEY` and `IPGEOLOCATION_API_KEY`
- **Map UX: Implement flyTo animation on location determination:**
  - Frontend: Created `FlyToLocation` component using `useMap()` hook
  - Frontend: Map initializes at zoom level 3, center `[12.5, 12.5]`
  - Frontend: `FlyToLocation` watches `position` changes and triggers smooth `flyTo` animation
  - Frontend: Animation only triggers once when real position is determined (ignores default fallback `[12.5, 12.5]`)
  - Frontend: User location marker only appears after real position is determined
  - Frontend: Uses `useRef` to prevent multiple animations
  - Animation: 1.5 second duration, flies from initial view to user location at zoom level 9
  - Result: Smooth, professional map animation on location determination, improved UX
  - HOTFIX (production bug): Fixed IP geolocation fallback crash with "Invalid LatLng object: (undefined, undefined)"
    - Root cause: Backend returns `{coords: [lat, lng]}` but frontend was accessing `data.latitude` and `data.longitude`
    - Additional issue: React StrictMode caused `useEffect` to run twice, triggering both success and error callbacks
    - Fix 1: Updated `useUserLocation.js` to parse `data.coords` array instead of `data.latitude/longitude`
    - Fix 2: Added `useRef` to track if browser geolocation succeeded, preventing IP fallback from overwriting precise location
    - Result: IP geolocation fallback works correctly, browser geolocation takes precedence when available
- **Frontend cleanup: Standardize on Axios (convert fetch to axios):**
  - Decision: Keep Axios as the standard HTTP client library
  - Rationale: Axios handles Django CSRF tokens automatically, better error handling, automatic JSON transformation, cleaner code
  - Bundle size impact negligible (~15.4 KB gzipped, 6% of React-DOM)
  - Action taken: Convert `useUserLocation.js` from fetch to axios for consistency
  - Result: All HTTP requests now use Axios consistently across the codebase
- **Map: circular search radius visualization + filter results to circle:**
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
  - Result: Professional circular radius visualization, accurate distance-based filtering, improved UX

### Next priorities (ordered by: Security → Auth → Frontend → Features → Enhancements)

## SECURITY PRIORITIES (Complete these BEFORE Auth overhaul)

**Note:** Rate limiting, password policies, CSRF handling, and session cookie security will be covered in **Priority #5 (Auth Backend: Security Hardening)**. The priorities below are security issues NOT covered by the Auth overhaul.

---

### 1. Security: Environment Variables Audit

**Branch:** `security/env-audit`  
**Difficulty:** Low  
**Estimated Time:** 1 hour  
**Urgency:** CRITICAL - Potential leaked secrets

**Scope:**

- Verify `backend/.env` is NOT tracked in git (`git ls-files backend/.env`)
- If tracked, remove from git history and rotate all API keys immediately
- Verify `.gitignore` properly excludes `.env` files
- Update `backend/.env.example` with all required variables (no actual values)
- Document environment variable setup in README
- Add pre-commit hook to prevent `.env` commits

**Rationale:** Memory indicates potential `.env` file in git history (security risk). Must verify and fix before any other work.

---

### 2. Security: API Key Rotation & Secrets Management

**Branch:** `security/secrets-management`  
**Difficulty:** Medium  
**Estimated Time:** 2-3 hours  
**Urgency:** HIGH (only if Priority #1 confirms leak)

**Scope:**

- Rotate all API keys (Xeno-Canto, IP geolocation services, Thunder Forest)
- Update production `.env` with new keys
- Document key rotation procedure
- Add key expiration reminders
- Review all external API usage for security best practices

**Rationale:** If `.env` was committed, all secrets are compromised and must be rotated

**Note:** Only complete this if Priority #1 confirms `.env` was tracked. Otherwise, skip for now.

---

### 3. Security: Content Security Policy (CSP) Headers

**Branch:** `security/csp-headers`  
**Difficulty:** Medium  
**Estimated Time:** 3-4 hours

**Scope:**

- Add CSP headers to Django responses (middleware or decorator)
- Configure CSP for production (nginx)
- Allow only necessary external resources (maps, APIs, CDNs)
- Test CSP doesn't break functionality
- Add CSP violation reporting endpoint

**Rationale:** Protect against XSS and injection attacks across entire application

**Note:** This is application-wide security, not covered by Auth overhaul.

---

## AUTH SYSTEM OVERHAUL

**Goal:** Build a modern, secure, professional authentication system from scratch using Django's built-in auth with best practices, proper validation, error handling, and comprehensive testing.

### 4. Auth Backend: Core Endpoints with TDD

**Branch:** `feat/auth-backend-core`  
**Difficulty:** Medium  
**Estimated Time:** 4-6 hours

**Scope:**

- Write tests FIRST for all auth endpoints (pytest + pytest-django)
- Rebuild `sign_up()` endpoint:
  - Standardize to JsonResponse with proper status codes (201 Created, 400 Bad Request, 409 Conflict)
  - Add input validation (email format, password strength)
  - Check for duplicate users before creation
  - Return structured JSON responses with clear error messages
  - Remove debugging print statements
- Rebuild `log_in()` endpoint:
  - Standardize to JsonResponse with proper status codes (200 OK, 401 Unauthorized)
  - Improve error messages (don't reveal whether email exists)
  - Remove debugging code and comments
  - Clean up request.\_request access pattern
- Rebuild `log_out()` endpoint:
  - Already uses JsonResponse ✓
  - Clean up comments
  - Add test coverage
- Improve `who_am_i()` endpoint:
  - Simplify user serialization
  - Add test coverage

**Tests to write:**

- `test_signup_success` - Valid signup creates user and returns 201
- `test_signup_duplicate_email` - Returns 409 Conflict for existing email
- `test_signup_invalid_email` - Returns 400 for malformed email
- `test_signup_weak_password` - Returns 400 for weak password
- `test_signup_missing_fields` - Returns 400 for missing email/password
- `test_login_success` - Valid credentials return 200 and create session
- `test_login_invalid_credentials` - Wrong password returns 401
- `test_login_nonexistent_user` - Non-existent email returns 401
- `test_login_missing_fields` - Returns 400 for missing fields
- `test_logout_success` - Logout destroys session and returns 200
- `test_whoami_authenticated` - Returns user data when logged in
- `test_whoami_anonymous` - Returns null user when not logged in

**Deliverables:**

- 12+ passing backend auth tests
- Clean, professional auth endpoints with consistent JSON responses
- Proper HTTP status codes throughout
- Input validation and security checks
- No debugging code or comments

---

### 5. Auth Backend: Security Hardening

**Branch:** `feat/auth-backend-security`  
**Difficulty:** Medium-High  
**Estimated Time:** 3-4 hours

**Scope:**

- Add rate limiting to auth endpoints (prevent brute force attacks)
  - Use Django cache (already configured)
  - Limit: 5 login attempts per IP per 15 minutes
  - Limit: 3 signup attempts per IP per hour
- Implement password policy:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - Optional: special character requirement
- Review CSRF token handling:
  - Verify dev (Vite proxy) CSRF works correctly
  - Verify production (nginx + gunicorn) CSRF works correctly
  - Document CSRF configuration in code comments
- Add security headers review:
  - Ensure secure session cookies in production
  - Verify HTTPS-only cookies
  - Check SameSite cookie settings

**Tests to write:**

- `test_login_rate_limiting` - Blocks after 5 failed attempts
- `test_signup_rate_limiting` - Blocks after 3 signups from same IP
- `test_password_policy_enforcement` - Rejects weak passwords
- `test_csrf_token_required` - Auth endpoints require CSRF token

**Deliverables:**

- Rate limiting on auth endpoints
- Strong password policy enforcement
- CSRF verification documented and tested
- 4+ additional security tests passing

---

### 6. Auth Frontend: Login Page Rebuild

**Branch:** `feat/auth-frontend-login`  
**Difficulty:** Medium  
**Estimated Time:** 3-4 hours

**Scope:**

- Rebuild `login.jsx` with modern React patterns:
  - Convert to controlled components (useState for email/password)
  - Add error state management (display backend errors to user)
  - Add loading state (disable form during API call, show spinner)
  - Style form with Bootstrap (Form, Form.Group, Form.Control, Button)
  - Add client-side validation (email format, required fields)
  - Display user-friendly error messages in Bootstrap Alert
  - Fix navigation race condition (await API response before navigate)
  - Remove hardcoded form access (event.target[0].value)
- Add frontend tests (Vitest + React Testing Library):
  - Test form submission with valid credentials
  - Test error display for invalid credentials
  - Test loading state during API call
  - Test client-side validation

**Tests to write:**

- `test_login_form_renders` - Form displays correctly
- `test_login_success_redirects` - Successful login navigates to home
- `test_login_error_displays` - Error message shown for invalid credentials
- `test_login_loading_state` - Submit button disabled during API call
- `test_login_validation` - Client-side validation prevents invalid submission

**Deliverables:**

- Modern, professional login page with Bootstrap styling
- Controlled components with proper state management
- User-friendly error messages
- Loading states and validation
- 5+ passing frontend tests

---

### 7. Auth Frontend: Signup Page Rebuild

**Branch:** `feat/auth-frontend-signup`  
**Difficulty:** Medium  
**Estimated Time:** 4-5 hours

**Scope:**

- Rebuild `signup.jsx` with modern React patterns:
  - Convert to controlled components (useState for email/password/confirmPassword)
  - Add password confirmation field (must match password)
  - Add error state management
  - Add loading state
  - Style form with Bootstrap
  - Add client-side validation:
    - Email format validation
    - Password strength indicator (visual feedback)
    - Password confirmation match
    - Required fields
  - Display user-friendly error messages
  - Fix navigation race condition
  - Remove hardcoded form access
  - Implement auto-login after successful signup
- Implement auto-login after successful signup:
  - Call login endpoint after successful signup
  - Navigate to home page
  - Update App.jsx user state
- Add frontend tests

**Tests to write:**

- `test_signup_form_renders` - Form displays with all fields
- `test_signup_success_auto_login` - Successful signup logs user in and redirects
- `test_signup_password_mismatch` - Error shown when passwords don't match
- `test_signup_weak_password` - Error shown for weak password
- `test_signup_duplicate_email` - Backend error displayed for existing email
- `test_signup_loading_state` - Submit button disabled during API call
- `test_password_strength_indicator` - Visual feedback as user types

**Deliverables:**

- Modern, professional signup page with Bootstrap styling
- Password confirmation field
- Password strength indicator
- Auto-login after signup
- Client-side validation
- 7+ passing frontend tests

---

### 8. Auth Frontend: Logout Improvement

**Branch:** `feat/auth-frontend-logout`  
**Difficulty:** Low  
**Estimated Time:** 1-2 hours

**Scope:**

- Improve `submitLogout.js`:
  - Add error handling (display error if logout fails)
  - Update App.jsx user state after logout
  - Consider adding confirmation dialog for logout (optional)
- Add tests for logout flow

**Tests to write:**

- `test_logout_success` - Logout clears user state and redirects
- `test_logout_error_handling` - Error displayed if logout fails

**Deliverables:**

- Improved logout with error handling
- 2+ passing tests

---

## FRONTEND ARCHITECTURE REWORK

**Goal:** Restructure frontend to follow React best practices, single responsibility principle, proper separation of concerns, and industry-standard naming conventions.

### 9. Frontend: Code Organization Audit

**Branch:** `chore/frontend-audit`  
**Difficulty:** Low  
**Estimated Time:** 2-3 hours

**Scope:**

- Audit all frontend files and document issues:
  - Identify functions in wrong locations (e.g., business logic in components)
  - Identify violations of single responsibility principle
  - Identify poor naming conventions
  - Identify missing custom hooks
  - Identify duplicated code
  - Identify components that should be split
  - Identify missing prop validation
  - Identify missing error boundaries
- Create detailed refactoring plan document
- Add TODO comments to code for future test coverage
- Prioritize refactoring tasks by impact

**Deliverables:**

- `docs/FRONTEND_REFACTORING_PLAN.md` with detailed audit results
- TODO comments in code for test coverage gaps
- Prioritized list of refactoring tasks

---

### 10. Frontend: Extract Custom Hooks

**Branch:** `refactor/frontend-custom-hooks`  
**Difficulty:** Medium  
**Estimated Time:** 4-5 hours

**Scope:**

- Extract reusable logic into custom hooks:
  - `useAuth()` - Handle auth state, login, logout, signup
  - `useBirdSearch()` - Handle bird search logic from NavBarBC
  - `useSavedBirds()` - Handle saved birds CRUD operations
  - `useMap()` - Handle map state and interactions (if needed)
- Move hooks to `frontend/src/hooks/` directory
- Add tests for each custom hook
- Update components to use new hooks

**Tests to write:**

- Tests for each custom hook using `@testing-library/react-hooks`
- Integration tests for components using the hooks

**Deliverables:**

- 4+ custom hooks with single responsibility
- Tests for all hooks
- Components refactored to use hooks
- Cleaner, more maintainable code

---

### 11. Frontend: Component Decomposition

**Branch:** `refactor/frontend-components`  
**Difficulty:** Medium-High  
**Estimated Time:** 5-6 hours

**Scope:**

- Break down large components following single responsibility:
  - Split `NavBarBC.jsx` into:
    - `Navbar.jsx` - Navigation UI only
    - `BirdSearchForm.jsx` - Search form component
    - `SearchResults.jsx` - Results display (prepare for future side panel)
  - Split `BirdMap.jsx` into:
    - `BirdMap.jsx` - Map container
    - `BirdMarker.jsx` - Individual bird marker
    - `UserLocationMarker.jsx` - User location marker
    - `SearchRadiusCircle.jsx` - Search radius visualization
  - Review `MyBirdsPage.jsx` for potential splits:
    - `SavedBirdsTable.jsx` - Table component
    - `SavedBirdRow.jsx` - Individual row component
    - `EmptyBirdsState.jsx` - Empty state component
- Add PropTypes or TypeScript interfaces for all components
- Add tests for each new component

**Tests to write:**

- Unit tests for each new component
- Integration tests for component composition

**Deliverables:**

- Smaller, focused components with single responsibility
- PropTypes validation on all components
- Comprehensive test coverage
- More maintainable and reusable code

---

### 12. Frontend: Naming Conventions & Code Style

**Branch:** `refactor/frontend-naming`  
**Difficulty:** Low-Medium  
**Estimated Time:** 3-4 hours

**Scope:**

- Rename variables/functions to follow industry standards:
  - Use descriptive names (no `data`, `response`, `temp`)
  - Use camelCase for variables/functions
  - Use PascalCase for components
  - Use UPPER_SNAKE_CASE for constants
  - Prefix boolean variables with `is`, `has`, `should`
  - Prefix event handlers with `handle` (e.g., `handleSubmit`)
- Standardize file naming:
  - Components: PascalCase (e.g., `BirdMap.jsx`)
  - Hooks: camelCase with `use` prefix (e.g., `useAuth.js`)
  - Utils: camelCase (e.g., `searchValidation.js`)
- Add JSDoc comments to complex functions
- Remove all commented-out code
- Standardize import order (React, libraries, components, hooks, utils, styles)

**Deliverables:**

- Consistent naming throughout frontend
- Clean, professional code
- JSDoc documentation
- No commented-out code

---

### 13. Frontend: Error Boundaries & Loading States

**Branch:** `feat/frontend-error-handling`  
**Difficulty:** Medium  
**Estimated Time:** 3-4 hours

**Scope:**

- Add React Error Boundaries:
  - Create `ErrorBoundary` component
  - Wrap main app sections
  - Display user-friendly error messages
  - Log errors for debugging
- Add loading states to all async operations:
  - Bird search loading
  - Saved birds loading
  - Auth operations loading
  - Map loading
- Create reusable `LoadingSpinner` component
- Create reusable `ErrorMessage` component
- Add tests for error scenarios

**Tests to write:**

- `test_error_boundary_catches_errors` - Error boundary displays fallback UI
- `test_loading_states_display` - Loading spinners show during async operations
- `test_error_messages_display` - Error messages show on failures

**Deliverables:**

- Error boundaries protecting app sections
- Loading states on all async operations
- Reusable error/loading components
- Better error handling and UX

---

## FEATURE PRIORITIES

### 14. Map: Cluster dense bird results

**Branch:** `feat/map-clustering`  
**Difficulty:** High  
**Estimated Time:** 6-8 hours

**Scope:**

- Implement marker clustering for dense results:
  - Use Leaflet.markercluster plugin
  - Cluster markers at lower zoom levels
  - Expand clusters on click
  - Ensure popups work on clustered markers
  - Ensure "confirm bird" works on clustered markers
- Add cluster styling
- Add tests for clustering behavior

---

### 15. Search Center: Explicit "set search center" UX

**Branch:** `feat/search-center-control`  
**Difficulty:** Medium  
**Estimated Time:** 4-5 hours

**Scope:**

- Add UI for setting search center:
  - "Use current location" button
  - "Use map center" button
  - Click-to-set on map
  - Optional: search by place name
  - Optional: manual lat/lng entry
- Visual indicator of current search center
- Ensure panning/zooming doesn't auto-change search center
- Add tests

---

## REMAINING PRIORITIES (Ordered by: Security → Visual → UX)

### 17. UI/UX: Disable "Confirm that bird" after confirmation

**Branch:** `feat/confirm-button-state`  
**Difficulty:** Low  
**Estimated Time:** 1-2 hours

**Scope:**

- Prevent double-click/double-save:
  - Disable button after first click
  - Show loading spinner during save
  - Replace with "Saved!" message after success
  - Re-enable if save fails
- Add visual feedback (success animation/message)
- Add tests

---

### 18. UI/UX: Indicate saved bird sightings on map

**Branch:** `feat/map-saved-indicators`  
**Difficulty:** Medium  
**Estimated Time:** 3-4 hours

**Scope:**

- Visually differentiate saved vs unsaved bird markers:
  - Different marker color/icon for saved birds
  - Disable "Confirm that bird" button for already-saved birds
  - Show "Already Saved" badge/text on saved bird popups
- Update marker state when bird is saved
- Add tests for saved bird indicators

---

### 19. UI: Consistent Navbar Across All Pages

**Branch:** `feat/consistent-navbar`  
**Difficulty:** Low  
**Estimated Time:** 2-3 hours

**Scope:**

- Create single `Navbar` component used across all pages
- Remove duplicate navbar code from login.jsx, signup.jsx, mybirds.jsx
- Ensure consistent styling and behavior
- Add active page indicator
- Add user email/avatar in navbar when logged in

**Rationale:** Currently each page has its own navbar (code duplication, inconsistent UX)

---

### 20. UI: Professional Landing Page

**Branch:** `feat/landing-page`  
**Difficulty:** Medium  
**Estimated Time:** 4-5 hours

**Scope:**

- Create attractive landing page for non-logged-in users
- Explain what HelloBirdie does
- Show screenshots/demo
- Clear call-to-action (Sign Up / Log In)
- Professional design with Bootstrap
- Responsive layout

**Rationale:** Current home page is just the search - no onboarding for new users

---

### 21. UI: Loading Skeleton Screens

**Branch:** `feat/skeleton-screens`  
**Difficulty:** Low-Medium  
**Estimated Time:** 2-3 hours

**Scope:**

- Replace loading spinners with skeleton screens:
  - Bird search results skeleton
  - Saved birds table skeleton
  - Map loading skeleton
- Use Bootstrap placeholders or custom CSS
- Smoother perceived performance

**Rationale:** Skeleton screens feel faster than spinners (better UX)

---

### 22. UX: Toast Notifications System

**Branch:** `feat/toast-notifications`  
**Difficulty:** Medium  
**Estimated Time:** 3-4 hours

**Scope:**

- Replace `alert()` calls with toast notifications:
  - Use Bootstrap Toast component or react-toastify
  - Success toasts (bird saved, deleted, etc.)
  - Error toasts (API failures, validation errors)
  - Info toasts (helpful tips)
- Non-blocking, auto-dismiss
- Stack multiple toasts
- Accessible (screen reader support)

**Rationale:** `alert()` is jarring and blocks UI - toasts are more professional

---

### 23. UX: Undo/Redo for Bird Deletion

**Branch:** `feat/undo-delete`  
**Difficulty:** Medium  
**Estimated Time:** 3-4 hours

**Scope:**

- Add "Undo" option after deleting bird:
  - Show toast with "Undo" button for 5 seconds
  - Delay actual deletion until toast expires
  - Restore bird if user clicks "Undo"
- Works for both individual and bulk delete
- Add tests

**Rationale:** Prevents accidental permanent deletion (better UX, less anxiety)

---

### 24. UX: Keyboard Shortcuts

**Branch:** `feat/keyboard-shortcuts`  
**Difficulty:** Medium  
**Estimated Time:** 3-4 hours

**Scope:**

- Add keyboard shortcuts for common actions:
  - `/` - Focus search input
  - `Esc` - Close popups/modals
  - `?` - Show keyboard shortcuts help
  - Arrow keys - Navigate search results
  - `Enter` - Confirm bird (when marker selected)
- Show shortcuts in help modal
- Make shortcuts discoverable

**Rationale:** Power users appreciate keyboard shortcuts (faster workflow)

---

### 25. UX: Search History

**Branch:** `feat/search-history`  
**Difficulty:** Medium  
**Estimated Time:** 4-5 hours

**Scope:**

- Store recent searches (localStorage or backend):
  - Last 10 searches
  - Show in dropdown when focusing search input
  - Click to re-run search
  - Clear history option
- Add tests

**Rationale:** Users often search for same birds - quick access improves UX

---

### 26. Performance: Debounce Search Input

**Branch:** `perf/debounce-search`  
**Difficulty:** Low  
**Estimated Time:** 1-2 hours

**Scope:**

- Add debounce to search input (300ms delay)
- Prevent API calls on every keystroke
- Show loading indicator while debouncing
- Cancel pending requests if user types again

**Rationale:** Reduces API calls, improves performance, better UX

---

### 27. Search Results: Side panel with bird list

**Branch:** `feat/results-side-panel`  
**Difficulty:** High  
**Estimated Time:** 8-10 hours

**Scope:**

- Add collapsible side panel for search results:
  - List view of all birds found
  - Show: common name, scientific name, quality, call type
  - Clicking list item focuses map marker and opens popup
  - Sync selection between list and map
  - Responsive: collapse on mobile, expand on desktop
  - Add sorting/filtering options
- Style with Bootstrap
- Add tests

---

### 28. Map: Hover preview for markers

**Branch:** `feat/map-hover-preview`  
**Difficulty:** Medium  
**Estimated Time:** 3-4 hours

**Scope:**

- Add hover-to-preview behavior:
  - Hovering map marker shows popup preview
  - Hovering list item (when side panel exists) highlights marker
  - Mobile: tap-to-preview (no hover)
- Add smooth transitions
- Add tests

---

### 29. Saved Birds: Add editable fields (scientific name, notes)

**Branch:** `feat/saved-birds-edit`  
**Difficulty:** Medium-High  
**Estimated Time:** 5-6 hours

**Scope:**

- Add fields to Bird model:
  - Scientific name (optional)
  - Notes (text field)
  - Call quality (optional)
  - Call type (optional)
  - Source recording URL (optional)
- Create edit UI:
  - Edit button on each saved bird row
  - Modal or inline edit form
  - Save/cancel buttons
- Add backend endpoint for updating bird
- Add validation
- Add tests (backend + frontend)

---

### 30. Saved Birds: Improve save confirmation messaging

**Branch:** `feat/save-confirmation-ux`  
**Difficulty:** Low  
**Estimated Time:** 2-3 hours

**Scope:**

- Improve save confirmation UX:
  - Show "Saving bird at [coordinates]..." message
  - Show timestamp and coordinates after save
  - Toast notification for successful save
  - Clear visual feedback
- Add tests

---

### 31. Saved Birds: Quick save vs custom save flow

**Branch:** `feat/save-flow-options`  
**Difficulty:** Medium  
**Estimated Time:** 4-5 hours

**Scope:**

- Implement two-tier save flow:
  - "Quick Save" - One click, saves with defaults
  - "Save with Details" - Opens form to add notes, scientific name, etc.
  - User can edit details later
- Update UI to support both flows
- Add tests

---

### Later (backlog ideas)

- Auth: Evaluate SSO with strict privacy constraints (Google, GitHub, etc.)
  - Constraint: No trackers, no privacy regression
  - Research privacy-preserving SSO implementations
- Auth: "Remember me" checkbox for extended sessions
- Auth: "Forgot password" flow with email reset
- Auth: Email verification on signup
- Auth: Two-factor authentication (2FA) option
- Performance: Implement service worker for offline support
- Performance: Add caching strategy for bird data
- Performance: Lazy load map markers for large result sets
- Accessibility: Full keyboard navigation support
- Accessibility: Screen reader optimization
- Accessibility: ARIA labels and roles throughout app
- Analytics: Privacy-preserving usage analytics (self-hosted)
- Export: Allow users to export saved birds (CSV, JSON)
- Import: Allow users to import bird sightings from other apps
- Social: Share bird sightings (with privacy controls)
- Mobile: Progressive Web App (PWA) support
- Mobile: Native mobile app (React Native)

### Decisions and constraints

- Search radius: default to 100km; user can change it
- Search center: default to "current location" unless explicitly changed
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

- **Learning-first approach:** Guide with questions and hints; let the user implement solutions
- **TDD workflow:** Write tests first, then minimal implementation, then refactor
- **Explain concepts:** Provide intent, mental model, syntax, options, gotchas, examples, then application
- **Branch discipline:** Always work on feature branches off `main`, never directly on `main`
- **Code quality:** Follow SOLID principles, single responsibility, DRY, YAGNI
- **Security first:** Never auto-run potentially unsafe commands; verify `.env` exclusion
- **Documentation:** Keep PROJECT_SUMMARY.md updated with progress and decisions
