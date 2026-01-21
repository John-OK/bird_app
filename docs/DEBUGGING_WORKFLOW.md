# Debugging workflow

## Goals

- Make bugs reproducible
- Identify the failing boundary (frontend, backend, integration, data)
- Lock the bug in with a regression test
- Fix with the smallest change
- Verify end-to-end and prevent regressions

## Toolbelt

### Frontend

- Browser DevTools
  - Console: runtime errors
  - Network: request URL, status code, response body, headers, timing
  - Application/Storage: localStorage/sessionStorage/cookies
- React DevTools
  - Inspect props/state, component tree

### Backend (Django)

- Django logging
  - Use logs to confirm code paths and variable values
- Django shell
  - Use for quick model/query validation
- Django test runner or pytest
  - Prefer writing regression tests for fixes

### Integration

- curl
  - Hit a backend endpoint directly to remove frontend variables

### Production/VPS

- systemd/journald logs
  - `systemctl status <service>`
  - `journalctl -u <service> -n 200 --no-pager`

## Workflow

### 0. Describe the symptom

- What did you do?
- What did you expect?
- What happened instead?
- Is it consistent?

### 1. Reproduce locally

- Prefer reproducing on your machine first.
- If it only fails on the VPS, assume config/env/data differences.

### 2. Find the first failing boundary

- If the browser shows a failed request, start at Network.
- If the backend returns 500, start at backend logs.
- If the backend returns 200 but UI is wrong, start at React state/rendering.

### 3. Reduce the reproduction

- Minimize inputs and steps until it still fails.
- Identify the smallest request / dataset that triggers the bug.

### 4. Add a regression test (TDD)

- Write a test that fails for the bug.
- Verify it fails for the right reason.

### 5. Fix with the smallest change

- Make the test pass.
- Avoid refactoring until green.

### 6. Refactor with tests green

- Improve readability and structure.
- Keep behavior stable.

### 7. Verify end-to-end

- UI behavior
- Backend endpoint behavior
- No new errors in logs

## Local debug quickstart (Windsurf Run and Debug)

- Use `Backend: Django runserver` to run Django under a debugger.
- Use `Backend: Pytest (all)` to run tests under a debugger.
- Use `Frontend: Vite dev server` to run the frontend dev server.

## Notes on environment variables

- Keep secrets out of git history.
- Use a local untracked `.env` file for development.
- Prefer GitHub Secrets for CI/CD and a protected `.env` on the VPS.
