# ADR 0004 — A deterministic engine with a fixed seed

- **Status:** Accepted
- **Date:** 2026-10-21
- **Deciders:** Aniruddha Adak

## Context

A risk tool has a credibility problem: if the number changes between two runs with identical input,
nothing downstream can be trusted. Screenshots stop matching production, tests assert nothing
meaningful, and users learn to refresh until they see a number they like.

The graph layout makes this concrete. A force-directed layout is the obvious way to draw a blast
radius, and it is inherently iterative and order-dependent. Two loads produce two pictures of the
same data.

## Decision

**Every function in `packages/core` is pure and deterministic.**
- No `Math.random()`, no `Date.now()`, no locale-dependent formatting, no iteration over unsorted
  `Set` or `Map` without sorting first.
- Graph positions come from polar coordinates plus a jitter derived from an **FNV-1a hash of the node
  id**, mapped into a small radius. Same node, same offset, every time.
- The dataset carries `SEED = 2718` (e ≈ 2.718, π ≈ 3.14). It is exposed in the footer,
  `/api/healthz`, and every exported report.
- Cascade frames are indexed, not timed. The UI animates with a timer, but the frame content is a
  pure function of `(incident, profile, tick)`.
- Tests assert byte-level equality between two calls with the same input, not just "shape is valid".

```ts
// packages/core/src/blast.ts
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0xffffffff;
}
```

## Consequences

- The same profile produces the same report, graph, and cascade on any machine, in any timezone.
- Screenshots in `docs/assets` are reproducible artefacts, not marketing renders.
- A report exported today can be re-derived from the repository at the version it names.
- The layout is less "organic" than a force simulation. Accepted: legibility beats novelty, and the
  radial arrangement communicates distance from _you_.
- Any future feature that needs randomness must route it through the seed, not `Math.random()`.

## Alternatives considered

- **Force-directed graph (d3-force).** Rejected: non-deterministic and adds a dependency for one view.
- **Pre-computed coordinates per node.** Rejected: breaks when a user declares a component the author
  did not anticipate.
- **No jitter at all.** Rejected: overlapping nodes at identical angles; jitter is what makes dense
  clusters readable.
