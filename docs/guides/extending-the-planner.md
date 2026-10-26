# Guide — extending the planner

The planner is the product's opinion. It says: do **this** first, because it removes the most risk per
minute you will actually spend. Changing it changes what people do tonight.

Estimated time: **15 minutes** per action.

---

## The model, in one screen

```
relevant      = exposed incidents where the action's vectors or slugs intersect
relevantRisk  = Σ contribution of those incidents
riskReduced   = min(totalRisk, round(relevantRisk × action.reduces))
efficiency    = riskReduced / max(action.minutes, 1)

residual      = fold(risk, completed, (r, a) => r − r × a.reduces × 0.72)
```

Ranking: unfinished before completed, then **efficiency descending**, then relevant-incident count,
then minutes ascending. Every comparison has a deterministic tie-break so the order never depends on
array position.

`0.72` is the competence haircut. Doing the action is not the same as doing it perfectly, and the
number should not pretend otherwise.

## 1. Add the action

`packages/seed/src/actions.ts`:

```ts
{
  id: "act-rotate-deploy-keys",
  title: "Rotate deploy keys and scope them to one repo",
  detail:
    "A deploy key that can write to every repository turns one leaked laptop into a supply-chain incident.",
  category: "supply-chain",        // identity | patching | network | supply-chain | certificates | banking | device
  minutes: 18,                     // realistic for a competent adult
  reduces: 0.45,                   // 0..1, share of the affected risk this removes
  vectors: ["supply-chain", "hosting"],
  incidentSlugs: ["litellm", "railway"],  // optional precision on top of vectors
  steps: [
    "List every deploy key on every repository you own.",
    "Delete keys you cannot identify, starting with the oldest.",
    "Create one key per repository, read-only unless a workflow must push.",
    "Store the private half in a manager, never in a shell history.",
  ],
  command: "gh repo deploy-key list --repo <owner>/<repo>",
}
```

### Choosing `minutes`

Time the task yourself, once, on a normal machine. Then round up.

| Range  | Use for                                                  |
| ------ | -------------------------------------------------------- |
| 1–5    | A single command, a toggle, a download                   |
| 6–20   | A settings tour, a small audit, one dashboard            |
| 21–45  | Repository-wide change, key rotation, account cleanup    |
| 46–120 | Migration, rebuild, coordinated rotation across services |

Do not encode "should take" minutes. A 3-minute action that actually takes 20 will dominate the queue
and erode trust in every other number.

### Choosing `reduces`

`reduces` is the share of the **relevant** risk this action removes, not of total risk.

| Value     | Meaning                                                                        |
| --------- | ------------------------------------------------------------------------------ |
| 0.85–0.95 | The action closes the vector for this incident (remove a root, revoke a token) |
| 0.50–0.80 | It removes the common path but not every path                                  |
| 0.20–0.49 | Partial mitigation: reduces likelihood or impact                               |
| 0.05–0.19 | Hygiene with a small marginal effect                                           |

Never use `1.0`. Nothing removes all risk, and the multiplicative residual would claim a zero that
does not exist.

### Vectors vs slugs

- `vectors` is broad: "this helps with every supply-chain incident".
- `incidentSlugs` is narrow: "this specifically helps with LiteLLM".

Use vectors by default. Add slugs when the action would otherwise appear relevant to incidents it
cannot actually help with. `relevant` is the union, so an over-broad vector list inflates the queue.

## 2. Link it from the incidents it mitigates

In `packages/seed/src/incidents-*.ts`, add the action id to `mitigations`:

```ts
mitigations: ["act-rotate-deploy-keys", "act-pin-actions"],
```

This is what the incident page renders under "Remediation". An action with no incident and no vector
is invisible in practice.

## 3. Test the arithmetic

```bash
bun run --filter @ferroscope/core test
bun run --filter @ferroscope/seed test
```

Then add an assertion for anything you care about. The existing suite pins:
- the first-ranked action on the default profile
- descending efficiency
- `riskReduced ≤ report.risk`
- residual risk reaching near zero but never negative
- completed actions moving down

If your action changes the default profile's top three, say so in the PR. That is a product change,
not a data change.

## 4. Check the three surfaces that consume it

| Surface         | What to look for                                   |
| --------------- | -------------------------------------------------- |
| `/planner`      | Ranking, meter, expandable steps, command block    |
| `/atlas/<slug>` | Appears under Remediation for the linked incidents |
| `/report`       | Top six relevant actions, with minutes and points  |

```bash
bun run dev
```

## 5. PR

```bash
git checkout -b feat/action-rotate-deploy-keys
git commit -m "feat(seed): add a deploy-key rotation action"
```

Include: the new top-three for the default profile, the minutes you actually measured, and why
`reduces` is the value you chose.

---

## Anti-patterns

- **A 90-minute action with `reduces: 0.9`.** It will rank below a 3-minute action that removes a
  third as much, which is correct. Do not "fix" the ranking by inflating `reduces`.
- **An action that is really three actions.** Split it. The planner's value is granularity.
- **A command that needs editing before it runs.** Put placeholders in angle brackets and say so in
  the step text.
- **A step that assumes a paid product.** Offer the free path first, mention the paid one second.
- **Advice that cannot be completed.** "Adopt a zero-trust architecture" is not an action.
