# CODEX_TASK_BRIEF.md — Low-Credit Task Template

Use this checklist when you want Codex to spend fewer credits per task.

## Recommended prompt shape
Include only:
- the exact goal
- the affected area or files
- the expected output
- hard constraints that truly matter

Good example:

```text
Fix the mobile layout bug in `src/experiences/storefront/pages/home-page.tsx`.
Do not change colors or copy.
Run only the minimum validation needed.
```

Avoid broad prompts like:

```text
Review the whole project, all docs, and all architecture, then improve everything.
```

## Low-credit collaboration rules
1. Ask for one scoped change at a time when possible.
2. Mention exact files, routes, components, or features if you already know them.
3. Ask for "analysis only" when you do not want edits yet.
4. Ask for "no docs update unless required" when behavior is unchanged.
5. Ask for "minimal validation" when a full test/build run is unnecessary.
6. Batch related tiny fixes together, but split unrelated work into separate tasks.

## Good prompt add-ons
- `Focus only on the affected files.`
- `Do not scan unrelated folders.`
- `Keep the solution minimal.`
- `Summarize findings before making larger changes.`
- `If docs are unaffected, skip them.`

## When broader context is worth it
Use wider review only when changing:
- data models
- RBAC behavior
- tenant isolation
- security posture
- shared UI primitives
- testing strategy
- build or deployment workflows
