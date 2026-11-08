---
name: webapp-testing
description: Toolkit for interacting with and testing local web applications using Playwright and Vitest. Supports verifying frontend functionality, debugging UI behavior, and inspecting DOM state.
license: Complete terms in LICENSE.txt
---

# Web Application Testing

Guidelines for robust web application verification, debugging UI behavior, and component testing.

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright / Vitest test using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Run test suite via Vitest / Jest (e.g., npm test -- --run)
        │
        └─ Yes → Reconnaissance-then-action:
            1. Verify endpoint response via curl / HTTP request
            2. Inspect DOM selectors and accessibility roles
            3. Execute targeted unit or end-to-end assertions
```

## Reconnaissance-Then-Action Pattern

1. **Inspect rendered DOM and Accessibility Roles**:
   - Query by accessible role first (`getByRole('button', { name: ... })`)
   - Query by label text (`getByLabelText(...)`)
   - Query by visible text (`getByText(...)`)

2. **Identify selectors from inspection results**:
   - Ensure role names and text match accessibility trees.
   - Avoid brittle CSS class name queries unless testing specific styling classes.

3. **Execute actions with discovered selectors**:
   - Fire user interactions (`fireEvent.click`, `fireEvent.change`)
   - Wrap assertions in `waitFor` when waiting for asynchronous state updates.

## Best Practices

- Always test from the end user's perspective.
- Clean up mocks and spies (`vi.clearAllMocks()` or `vi.restoreAllMocks()`) between test cases.
- Avoid inspecting the DOM before waiting for state transitions to settle.
- Wrap state-updating events in `act(...)` or `waitFor(...)` to mirror browser runtime behavior accurately.

