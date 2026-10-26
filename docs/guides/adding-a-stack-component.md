# Guide — adding a stack component

A stack item is a thing a person can declare about themselves. It only earns a place in the catalogue
if the matcher can reason about it: some incident must be able to intersect it, or some action must
be able to reduce it.

Estimated time: **10 minutes**.

---

## 1. Check it does not exist

```bash
grep -n 'id: "' packages/seed/src/stack.ts | grep -i nginx
```

Ids are namespaced by category: `os-`, `browser-`, `runtime-`, `server-`, `svc-`, `ca-`, `acct-`,
`pkg-`, `ai-`, `device-`. Keep the prefix even if the label is obvious.

## 2. Add the record

```ts
{
  id: "server-nginx",
  label: "NGINX",
  vendor: "F5 / open source",
  category: "server",
  riskWeight: 0.72,
  note: "Reverse proxy and static host. Version matters more than configuration for most CVEs.",
  defaultOn: false,
}
```

### Choosing `riskWeight`

`riskWeight` is `0..1` and answers: _when this component is on the path of an incident, how much does
it usually cost?_ It feeds the weighted average in `exposure.ts`.

| Weight    | Meaning                                                                 | Examples                                           |
| --------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| 0.80–1.00 | Compromise is usually total: keys, trust, or code execution at the root | CA roots, password managers, CI with deploy tokens |
| 0.60–0.79 | Serious but scoped: a host, a runtime, a database client                | NGINX, Node, Python, WordPress                     |
| 0.40–0.59 | Meaningful context, rarely the whole story                              | Browsers, editors, package managers                |
| 0.10–0.39 | Peripheral. Included so the graph is honest, not to move the score      | Note-taking apps, media players                    |

Two rules:
1. **Do not use 1.0 casually.** It is reserved for a compromise that invalidates trust itself.
2. **Stay consistent with neighbours.** If NGINX is 0.72, Apache should be within 0.05.

### `defaultOn`

`true` only for components present on a **stock developer laptop** recorded in the original audit:
Windows, Edge, Node, Python, GitHub, Vercel, npm, PyPI, and the like. Everything else is `false`.
The default profile is a real machine, not a worst case; inflating it would make the first screen
dishonest.

## 3. Wire it into at least one incident or action

A stack item nobody can match is decoration. Add it to an incident's `affected` array, or to an
action's scope, in the same PR.

```ts
// packages/seed/src/incidents-48h.ts
affected: ["server-nginx", "server-php"],
```

## 4. Add it to the profile editor categories

The editor groups by `category`, which is already typed. No component change is needed — but check
that the category label exists in `apps/web/components/profile-editor.tsx` under `CATEGORY_LABEL`.

## 5. Test

```bash
bun run --filter @ferroscope/seed test
bun run test
bun run build
```

The dataset test asserts that every incident's `affected` id resolves. If you added the item but did
not wire it, the test still passes — which is why step 3 matters and why reviewers check it.

Then verify the editor:

```bash
bun run dev
# http://localhost:3000/profile
```

Search for the label, toggle it, and watch the declared count and live model change.

## 6. PR

```bash
git checkout -b feat/stack-nginx
git commit -m "feat(seed): add NGINX to the stack catalogue"
```

Include in the description: which incident now intersects it, and what the default profile's score
does (it should not change unless `defaultOn` is true).

---

## When to split an item

One item per **trust boundary**, not per product SKU. "Windows" is one item because a Windows
compromise has one shape. "GitHub" and "GitHub Actions" are two, because a stolen personal token and
a compromised workflow have different blast radii.

If two items always appear together in every incident and every action, they are probably one item.
