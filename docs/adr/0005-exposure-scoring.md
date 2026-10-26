# ADR 0005 — How exposure is scored

- **Status:** Accepted
- **Date:** 2026-10-21
- **Deciders:** Aniruddha Adak

## Context

The product needs one number that answers "how bad is this for me?" without pretending to be a
probability. Three naive options were available:
1. **Count matches.** `n / 27 × 100`. Simple, but treats a critical CA compromise and a low-severity
   browser bug as equal.
2. **Sum CVSS.** Familiar, but CVSS describes a vulnerability in the abstract, not whether _this_
   stack is on its path, and many incidents in the dataset have no CVSS at all.
3. **Machine learning.** No labelled data, no reproducibility, and an unexplainable number in a
   product whose entire argument is explainability.

A fourth problem sits underneath all three: risk must stay bounded. If the dataset grows to 200
incidents, a linear model produces 400/100.

## Decision

Score with a **weighted, mitigated, exponentially saturated sum**.

### 1. Matching

An incident matches when at least one of its `affected` stack ids is present in the profile:

```
present    = affected ∩ declared
matched    = |present| > 0
confidence = 0.55 + 0.45 × (|present| / |affected|)
```

`confidence` is a **coverage fraction**, not a probability. Running all four affected components
yields 1.0; one of four yields 0.6625. The 0.55 floor exists because a single shared component is
still a real intersection.

Incidents with **no** stack surface by design are matched by region and account type:

| Vector        | Condition                             | Confidence |
| ------------- | ------------------------------------- | ---------- |
| `banking`     | region matches **and** `profile.bank` | 0.9        |
| `data-breach` | region matches                        | 0.6        |
| `state-actor` | region matches                        | 0.6        |

### 2. Mitigation

Hygiene controls subtract from impact, per vector, then cap:

| Control                | Vectors                                                                | Value    |
| ---------------------- | ---------------------------------------------------------------------- | -------- |
| Phishing-resistant 2FA | identity, banking, supply-chain, ai-agent, network, state-actor        | +0.22    |
| Password manager       | identity, banking, supply-chain                                        | +0.18    |
| Automatic updates      | endpoint, runtime, browser, web-server, network, certificate-authority | +0.25    |
| **Cap**                | all                                                                    | **0.80** |

```
mitigation = min(0.80, Σ applicable controls)
```

The cap is the important part. Ticking every box cannot produce zero risk, because none of these
controls is a force field. Mitigation ≥ 0.40 also downgrades the displayed `effectiveSeverity` by one
step, which is why a hardened profile sees fewer red chips without seeing fewer matches.

### 3. Raw weight and score

```
weight_i = mean(riskWeight of present components)   // 0.5 if none
raw_i    = severityWeight_i × weight_i × confidence_i × (1 − mitigation_i)

risk  = round(100 × (1 − e^(−0.55 × Σ raw_i)))
score = 100 − risk
```

`severityWeight` is `critical 1.0, high 0.72, medium 0.42, low 0.18`. `riskWeight` lives on each stack
item in `packages/seed/src/stack.ts` and reflects how much a component tends to matter when it is on
the path (a CA root is weighted higher than a text editor).

The saturation constant `0.55` was chosen so the default profile lands at **56**, not at 95. It also
guarantees the score cannot leave `0..100` as the dataset grows.

### 4. Contributions

Per-incident contribution is a proportional share of the final risk:

```
contribution_i = round((raw_i / Σ raw) × risk)
```

Contributions therefore sum to the risk (modulo rounding), and the atlas can show "+33" next to
eMudhra without inventing a second scale.

### 5. Bands

| Band        | Risk   |
| ----------- | ------ |
| `fortified` | 0–19   |
| `watchful`  | 20–44  |
| `exposed`   | 45–69  |
| `critical`  | 70–100 |

## Consequences

- The default profile computes **risk 58 / score 42 / band exposed**, pinned by tests in
  `packages/core/src/exposure.test.ts` and `packages/seed/src/dataset.test.ts`.
- Adding a low-severity incident to a profile that is already at 90 moves the number by less than a
  point. That is correct behaviour, and it surprises people — the method page says so explicitly.
- The model is auditable: four multiplications, one exponential, one clamp.
- It is **not** a forecast. A 58 does not mean a 58% chance of compromise. The UI says this in three
  places, including the report footer.

## Alternatives considered

- **Plain match count.** Rejected: no severity, no mitigation, no confidence.
- **Additive CVSS.** Rejected: unbounded, and absent for a third of the dataset.
- **Bayesian network.** Rejected: requires priors nobody can defend, and hides the arithmetic from
  the person who needs to act on it.
- **Linear with a clamp at 100.** Rejected: produces a large flat region where additional exposure
  is invisible, which is worse than saturating.

## Related

- `packages/core/src/exposure.ts`
- `packages/core/src/severity.ts`
- `/method` on the live site
