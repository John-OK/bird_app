# AI testing coaching guide (teach-first)

## Goal

This guide defines _how_ the AI assistant should teach testing in this repo.

Key outcomes:

- Explain new testing concepts _before_ asking you to use them.
- Use beginner-friendly language and mental models.
- Keep changes small: one concept + one failing test at a time.
- Make tests readable and stable.

## Coaching methodology (explain-then-implement)

When introducing a new testing concept (e.g. `vi.mock`, `beforeEach`, `waitFor`), the AI should follow this sequence:

1. **Intent (what problem does this solve?)**
2. **Mental model (what is happening when the test runs?)**
3. **Syntax (what do I type?)**
4. **Common options (what variations will I see?)**
5. **Gotchas (common beginner mistakes)**
6. **Generic example (similar problem, not the exact project code)**
7. **Apply to our code (exact next steps for this repo)**

## Vocabulary

- **Test runner**: runs your tests and provides APIs like `describe`, `it`, `expect` (here: Vitest).
- **Assertion**: a statement that must be true for the test to pass (e.g. `expect(x).toBe(y)`).
- **Mock**: a fake replacement for a dependency (e.g. replacing real HTTP with a fake function).
- **Unit test boundary**: how much code you are testing (single component vs the whole app).

## `describe` and `it`

### Purpose

- `describe(name, fn)`: groups related tests (a “suite”).
- `it(name, fn)` (or `test(name, fn)`): a single test case.

### Syntax

```js
describe("ThingUnderTest", () => {
  it("does something", () => {
    // arrange / act / assert
  });
});
```

### How to name them

- `describe` should usually be the unit under test:
  - component name: `MyBirdsPage`
  - module name: `submitLogout`
  - feature: `Saved birds page`
- `it` should read like a requirement:
  - “shows an empty state when no birds are returned”
  - “renders a row per saved bird”

Tips:

- Prefer “what the user sees/gets” over “how it is implemented”.
- Avoid quoting exact strings in the test name unless needed.

## `beforeEach` / `afterEach`

### Purpose

- `beforeEach(fn)`: run setup code _before every test_.
- `afterEach(fn)`: run cleanup code _after every test_.

Typical uses:

- Reset mock call history so tests don’t affect each other.
- Clean up DOM between tests.

### Syntax

```js
beforeEach(() => {
  // reset state
});

afterEach(() => {
  // cleanup
});
```

### Common options

- `beforeAll` / `afterAll`: run once for the whole file.

### Gotchas

- If you forget to reset mocks, later tests may pass/fail depending on earlier tests.

## `waitFor` (React Testing Library)

### Purpose

`waitFor` repeatedly runs an assertion until it passes or times out.

You use it when:

- The UI updates _after_ an async action (e.g. network request, `useEffect`, timers).

### Mental model

React often renders once, then runs effects, then updates state later.

So your test must sometimes “wait until the UI catches up”.

### Syntax

```js
await waitFor(() => {
  expect(something).toBe(true);
});
```

### Common options

`waitFor` accepts options like:

- `timeout`: how long to keep retrying
- `interval`: how often to retry

### Related tool

- `findBy...` queries (e.g. `await screen.findByText("...")`) are essentially “waitFor + query” combined.

## `vi.mock` (Vitest)

### Purpose

`vi.mock` replaces a module import with a fake implementation.

You use it when you want unit tests that don’t:

- perform real HTTP
- depend on auth/session
- depend on a database

### Mental model

1. The test file is loaded.
2. Top-level code runs.
3. Imports are resolved.

If you want a module mocked, Vitest needs to know _before_ the module-under-test imports it.

### Syntax (common)

Mock with a factory function:

```js
vi.mock("some-module", () => {
  return {
    default: {
      someFn: vi.fn(),
    },
  };
});
```

### Gotchas

- Default export vs named export matters.
  - If production code uses `import thing from "x"`, the mock must provide `default`.
  - If production code uses `import { thing } from "x"`, the mock must provide `thing`.

## Mocked async return values: `mockResolvedValueOnce` vs `mockResolvedValue`

### Purpose

These configure what a mocked function returns.

- `mockResolvedValueOnce(value)`: next call returns a resolved Promise of `value`.
- `mockResolvedValue(value)`: _every_ call returns a resolved Promise of `value`.

### Why “Once” is common in tests

- It keeps tests explicit and independent.
- If code calls the function twice, the test will reveal it (you’ll need to decide what the 2nd call returns).

### Generic example (not project code)

Imagine a page calls `api.getWeather()` on mount.

```js
api.getWeather.mockResolvedValueOnce({ data: { tempC: 20 } });
```

Then your UI can render “20°C” and you can assert it.

## Structure: Arrange / Act / Assert

A beginner-friendly structure for test bodies:

- **Arrange**: set up mocks + data
- **Act**: render / click / type
- **Assert**: check visible output and key interactions

## How to review a new test file (checklist)

- Does the file contain at least one `describe` + `it`?
- Is the mocking shape correct for default vs named exports?
- Are async UI updates handled with `findBy...` or `waitFor`?
- Are tests independent (mocks cleared, DOM cleaned up)?
- Are assertions stable (user-visible text / roles) rather than brittle markup?
