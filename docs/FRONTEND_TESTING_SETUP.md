# Frontend Testing Setup (Vitest + React Testing Library)

This project uses Vite for the frontend build and uses **Vitest** as the test runner.

This doc captures the exact setup used to get a working “frontend unit test harness” with:

- Vitest (test runner)
- jsdom (browser-like DOM for tests)
- React Testing Library (render + query utilities)
- jest-dom matchers (e.g. `toBeInTheDocument()`)

## Goal

Be able to run fast, isolated frontend tests from `frontend/` without needing to run Django.

## Where this lives

- Frontend root: `frontend/`
- Test runner config: `frontend/vite.config.js`
- One-time test setup: `frontend/src/setupTests.js`
- Example tests:
  - `frontend/src/smoke.test.jsx`
  - `frontend/src/rtl-smoke.test.jsx`

## Install / verify dependencies

From `frontend/`:

1. Install dependencies:

```bash
npm install
```

Notes:

- If you edit `package.json` (add devDependencies) you should **always** run `npm install` afterwards.
- `npm install` updates `package-lock.json`; commit it with `package.json`.

## Configure package scripts

In `frontend/package.json`, add scripts.

Where it goes:

- In the top-level JSON object, inside the existing `"scripts"` object.

Copy/paste these two lines into the existing `"scripts"` object:

```json
"test": "vitest run",
"test:watch": "vitest"
```

What it should look like when done (example):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "watch": "vite build --watch",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- `test`: run tests once in CI mode
- `test:watch`: run tests in watch mode (local dev)

This project uses:

- `npm run test`
- `npm run test:watch`

## Add devDependencies

In `frontend/package.json`, add the following devDependencies.

Where it goes:

- In the top-level JSON object, inside the existing `"devDependencies"` object.

Copy/paste these lines into the existing `"devDependencies"` object:

```json
"@testing-library/jest-dom": "^6.9.1",
"@testing-library/react": "^16.3.2",
"@testing-library/user-event": "^14.6.1",
"jsdom": "^27.4.0",
"vitest": "^4.0.18"
```

Important:

- Do not replace your entire `package.json` with a snippet.
- You are adding keys inside an existing JSON object.
- JSON does not allow trailing commas, so make sure the surrounding lines have correct commas.

Notes:

- The versions above match the currently-working harness in this repo.
- After updating dependencies, always run `npm install`.

What `frontend/package.json` should look like when done (copy/paste reference):

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "watch": "vite build --watch",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "axios": "^1.5.1",
    "bootstrap": "^5.2.0",
    "leaflet": "^1.8.0",
    "react": "^18.2.0",
    "react-bootstrap": "^2.8.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.0.1",
    "react-router-dom": "^6.3.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^18.0.15",
    "@types/react-dom": "^18.0.6",
    "@vitejs/plugin-react": "^4.1.0",
    "jsdom": "^27.4.0",
    "vite": "^4.4.9",
    "vitest": "^4.0.18"
  }
}
```

## Configure Vitest in Vite config

Edit `frontend/vite.config.js` and add a `test` section.

Where it goes:

- Inside `defineConfig({ ... })`, typically near the top.
- In this repo, it is placed immediately after `export default defineConfig({`.

Minimum required:

- `environment: "jsdom"`
  - gives tests a DOM so React can render
- `setupFiles: "./src/setupTests.js"`
  - runs before every test file

Why `./src/...`?

- Using a relative path here avoids path-resolution confusion.

What `frontend/vite.config.js` should look like when done (copy/paste):

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // vite uses this as a prefix for href and src URLs
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
  base: "/static/",
  build: {
    // this is the folder where vite will generate its output. Make sure django can serve files from here!
    outDir: "../backend/static",
    emptyOutDir: true,
    sourcemap: true, // aids in debugging by giving line numbers and readable code
  },
  plugins: [react()],
});
```

## Add `setupTests.js`

Create `frontend/src/setupTests.js` and import jest-dom matchers:

- `import "@testing-library/jest-dom/vitest";`

Why?

- React Testing Library focuses on querying the DOM.
- `@testing-library/jest-dom` adds readable assertions like:
  - `expect(node).toBeInTheDocument()`
  - `expect(node).toHaveTextContent("...")`

What `frontend/src/setupTests.js` should look like when done (copy/paste):

```js
import "@testing-library/jest-dom/vitest";
```

## Add smoke tests

### 1) Vitest smoke test

Create `frontend/src/smoke.test.jsx`:

- Purpose: prove Vitest is running at all.
- Should contain a basic assertion like `expect(true).toBe(true)`.

What `frontend/src/smoke.test.jsx` should look like when done (copy/paste):

```jsx
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs a basic assertion", () => {
    expect(true).toBe(true);
  });
});
```

### 2) RTL + jsdom smoke test

Create `frontend/src/rtl-smoke.test.jsx`:

- Purpose: prove React renders into jsdom and jest-dom matchers work.
- Minimal structure:
  - render a simple element
  - query it with `screen.getByText`
  - assert with `toBeInTheDocument`

What `frontend/src/rtl-smoke.test.jsx` should look like when done (copy/paste):

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("RTL", () => {
  it("renders React into jsdom", () => {
    render(<div>hello!</div>);
    const element = screen.getByText("hello!");
    expect(element).toBeInTheDocument();
  });
});
```

Important rules:

- If you use JSX in a test file, the file must end in `.jsx` (or `.tsx`).
- Keep `render(...)` and DOM queries inside the `it(...)` block (not at the top level).

Test file discovery notes:

- Vitest will find files like `*.test.js`, `*.test.jsx`, `*.spec.js`, `*.spec.jsx` by default.
- In this repo we put quick harness tests in `frontend/src/`.

## Run tests

From `frontend/`:

- Run once:
  - `npm run test`
- Watch mode:
  - `npm run test:watch`

## Primer: how to write a good React Testing Library test

### Minimal test shape

Most component tests follow the same pattern:

- Arrange: render the UI
- Act: interact with it (optional)
- Assert: verify what the user would see

Example:

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Example", () => {
  it("shows a greeting", () => {
    render(<div>Hello</div>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### Choosing queries

- `getBy...`:
  - Use when the element should be there immediately.
  - Throws if not found.
- `queryBy...`:
  - Use when the element might not exist.
  - Returns `null` instead of throwing.
- `findBy...`:
  - Use for async UI updates (e.g. data loaded in `useEffect`).
  - Returns a Promise and waits up to a timeout.

Rule of thumb:

- If the UI changes after an async call (axios, timers, `useEffect` work), prefer `findBy...`.

### Interactions

For user-like interactions, prefer `@testing-library/user-event` over manually firing DOM events.

## Common mistakes / troubleshooting

### “Failed to parse source… invalid JS syntax… If you are using JSX, name the file .jsx”

Cause:

- The test file contains JSX (e.g. `render(<div />)`) but the file extension is `.js`.

Fix:

- Rename the file to `.jsx` (or `.tsx`).

Rule of thumb:

- If a file contains JSX, name it `*.jsx`.

Related mistake:

- If you see an import-analysis error pointing at a line like `render(<div />)`, it is almost always because the file extension is `.js`.

### “The symbol X has already been declared”

Cause:

- Duplicate import lines in the same file (often from copy/paste).

Fix:

- Remove the duplicate imports so each symbol is imported once.

How it usually happens:

- Copy/pasting a snippet into the top of a file that already has the same imports.

### Tests run, but you see “0 tests”

Cause:

- The test file failed to import/transform, so the suite never loaded.

Fix:

- Scroll up to the first error; it’s usually a transform/import issue (like JSX-in-`.js`).

### “useNavigate() may be used only in the context of a <Router>” (or similar)

Cause:

- The component (or a child it renders) calls a `react-router-dom` hook.

Fix:

- Wrap the component under test in a router when rendering in RTL.
- Typical test wrapper is `MemoryRouter`.

Where to look:

- The component under test, and any child components it renders, for `react-router-dom` hook usage.

### “My component makes network calls (axios) in useEffect; how do I test it?”

Recommended approach in this repo (unit-level):

- **Mock the axios module** in the test.

Why:

- Lower setup cost than MSW.
- Great for deterministic unit tests.

When you may want MSW:

- If you want more “integration-like” tests where you define request handlers per endpoint.

### “`npm run test` passed even though I didn’t run `npm install` after editing package.json”

Why it can happen:

- You may already have had those packages installed in `node_modules` from earlier.

Best practice:

- Always run `npm install` after changing dependencies.

### `npm audit` vulnerabilities

You may see vulnerability output after `npm install`.

Recommendation:

- Don’t run automatic fix commands as part of this test-harness setup unless you intentionally want a dependency-update PR.
- Consider a separate “dependency update” PR later.

## Testing boundary (what to test, and what to mock)

A useful mental model:

- Component-level test: render a single page/component and mock its dependencies.
  - Example: test `MyBirdsPage` by mocking `axios.get('/get_users_birds/')`.
- App-level/integration-ish test: render `<App />` and navigate.
  - Then you may need to mock endpoints called by `App` too (like `/whoami`).

Choose the smallest boundary that proves the behavior you care about.
