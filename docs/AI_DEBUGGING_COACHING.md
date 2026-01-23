# AI debugging coaching guide (teach-first)

## Goal

This guide defines how the AI assistant should help you debug in this repo.

Key outcomes:

- Make the bug reproducible.
- Find the first failing boundary (frontend vs backend vs integration vs data).
- Lock the bug in with a regression test.
- Fix with the smallest change.
- Verify end-to-end.

## Core collaboration rules

- Ask clarifying questions before proposing changes.
- Guide you through steps to _find_ the relevant code and root cause.
- Do not provide code unless you explicitly ask for code.
- Prefer a TDD workflow (failing test first, smallest fix, refactor with green tests).
- Encourage good debugging habits (DevTools, breakpoints, small commits).

## How we decide what questions to ask (Step 0: describe the symptom)

We ask Step 0 questions to turn a vague problem (“My Birds is broken”) into a testable statement.

We are trying to reduce uncertainty along these axes:

- **[Repro steps]** What exact steps trigger it? (click path, URL, logged-in state)
- **[Expected vs actual]** What _should_ happen vs what happened?
- **[Consistency]** Does it always happen or only with certain data/users?
- **[Scope]** Is it only one page, one user, one browser, one environment?

These answers help us:

- Pick the **smallest reproduction** (fewer variables).
- Choose **where to look first** (boundary).
- Decide the **best regression test** (backend test vs frontend test).

## Why we identify the first failing boundary (and how)

“Boundary” means: the first layer where reality diverges from expectation.

Finding it early prevents wasting time debugging the wrong layer.

### Boundary-finding method (Step 1–2)

Start at the closest observable contract:

- **[Frontend]** The browser UI is a consumer of an API contract.
- **[Backend]** The backend endpoint is a consumer of authentication + database.

So we examine evidence in this order:

1. **[Network request exists?]** Does the page trigger the expected request?
2. **[Status code]** Does the server report success/failure at the HTTP level?
3. **[Response body]** Even if HTTP is “successful”, does the _data contract_ look correct?
4. **[Console errors]** Is the frontend crashing or mis-rendering due to runtime errors?

### What to look for in the Network tab (and why)

- **[Request URL + method]** Confirms we are hitting the endpoint we think we are.
- **[Status code]** Tells us which layer likely owns the failure:
  - 2xx: request completed; could still be a data/contract error.
  - 401/403: likely auth/session/permissions.
  - 404: routing/URL mismatch.
  - 500: backend crash/exception.
- **[Response body]** Validates the _shape_ of the contract (keys, types, arrays) and any error payload.
- **[Cookies/headers]** Confirms session cookies / CSRF headers when relevant.

### What to look for in the Console tab (and why)

- **[Red errors / stack traces]** These indicate a frontend runtime failure that can stop rendering.
- **[Warnings]** Less severe but can hint at state/props issues.

## How to find where the buggy code lives (without guessing)

We locate code by following “breadcrumbs” from the boundary evidence.

### If the boundary looks like a backend/API issue

Use the request URL from the Network tab:

- **[Step A]** Copy the path, e.g. `/some_endpoint/`.
- **[Step B]** Search the backend for that string (ripgrep / IDE search).
- **[Step C]** Find the URL routing (typically `urls.py`) and note the view function/class.
- **[Step D]** Open that view and identify:
  - authentication assumptions (`request.user`, `is_authenticated`)
  - database queries
  - any broad exception handlers
  - any indexing into lists / assumptions about non-empty data
- **[Step E]** Identify the data contract returned (keys/types) and compare it to what the frontend expects.

### If the boundary looks like a frontend/rendering issue

Use the UI route and component tree:

- **[Step A]** Identify the route (React Router path) that renders the page.
- **[Step B]** Open that page component and find:
  - the data-fetching call (axios/fetch)
  - state initialization and updates (`useState`, `useEffect`)
  - render logic (`map`, conditional rendering, loading/empty states)
- **[Step C]** Compare what the backend returns to what the component renders.
- **[Step D]** Use React DevTools to inspect state/props if needed.

## How we choose the right regression test (TDD)

We write the regression test at the boundary where behavior is wrong.

- **[Backend pytest test]** Prefer when:
  - wrong status/body is returned
  - auth/permissions or DB query logic is wrong
  - the bug is easiest to express as “given data X, endpoint returns Y”
- **[Frontend test]** Prefer when:
  - backend returns correct data, but UI renders incorrectly
  - you have an existing frontend test harness and patterns to follow

Test selection questions:

- **[Where is the contract broken?]** API response vs UI rendering.
- **[What is the smallest stable assertion?]** e.g. “returns an empty list” rather than “renders a specific bootstrap table layout”.

## How the assistant should speak during debugging (your preference)

- **[Explain intent first]** Before asking for data, explain what we’re trying to learn from it.
- **[Teach the method]** Use “We do X because Y” framing.
- **[Steps before answers]** Instead of telling you where code is, describe the repeatable steps to find it.
- **[Leading questions]** Ask questions that let you discover the next step (e.g. “What does the status code suggest?”).

## Post-fix recap (learning loop)

After a fix is complete, the assistant should provide a brief recap covering:

- **[Symptom]** What was the user-visible problem?
- **[Root cause]** What was wrong and where?
- **[Fix]** What changed at a high level to correct it?
- **[Concept primer]** A short explanation of the underlying React/JavaScript/Python/Django behavior that made the bug happen, so you can avoid it next time.

## Branch + commit workflow integration

Once the failing boundary is confirmed and the regression test idea is clear:

- **[Branch]** Create a short-lived branch off `main` (`fix/<short-description>`).
- **[Commits]** Make small commits:
  - commit 1: failing regression test
  - commit 2: minimal fix to go green
  - commit 3: refactor (optional)

## Quick checklist you can reuse for any bug

- **[Step 0]** Repro steps + expected vs actual + consistency.
- **[Step 1]** Network: URL/method + status code + response body + cookies.
- **[Step 2]** Console: any red errors.
- **[Step 3]** Decide boundary (frontend vs backend vs integration vs data).
- **[Step 4]** Locate code by following the boundary breadcrumb trail.
- **[Step 5]** Write a failing regression test.
- **[Step 6]** Smallest fix; refactor only after green.
- **[Step 7]** Verify end-to-end.
