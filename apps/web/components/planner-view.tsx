"use client";

import {
  computeExposure,
  formatMinutes,
  rankActions,
  residualRisk,
  totalMinutes,
} from "@ferroscope/core";
import { ACTIONS, INCIDENTS, STACK_CATALOG } from "@ferroscope/seed";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  Kicker,
  Meter,
  Ring,
  Table,
  Td,
  Th,
} from "@ferroscope/ui";
import { useMemo, useState } from "react";
import { useProfile, useProfileHydrated } from "@/lib/store";

type Filter = "all" | "relevant" | "done";

export function PlannerView() {
  const hydrated = useProfileHydrated();
  const stored = useProfile((state) => state.profile);
  const completed = useProfile((state) => state.completed);
  const toggleCompleted = useProfile((state) => state.toggleCompleted);
  const resetCompleted = useProfile((state) => state.resetCompleted);
  const profile = useMemo(
    () =>
      hydrated
        ? stored
        : {
            stack: [],
            region: "IN",
            bank: false,
            passwordManager: false,
            twoFactor: false,
            autoUpdates: false,
          },
    [hydrated, stored],
  );

  const [filter, setFilter] = useState<Filter>("relevant");
  const [open, setOpen] = useState<string | null>(null);

  const report = useMemo(() => computeExposure(profile, INCIDENTS, STACK_CATALOG), [profile]);
  const plans = useMemo(
    () => rankActions(ACTIONS, report, hydrated ? completed : []),
    [report, hydrated, completed],
  );

  const residual = residualRisk(report, plans);
  const remaining = totalMinutes(plans);
  const done = plans.filter((plan) => plan.completed).length;

  const visible = plans.filter((plan) => {
    if (filter === "relevant") return plan.relevant.length > 0;
    if (filter === "done") return plan.completed;
    return true;
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
          {(["relevant", "all", "done"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors ${
                filter === value
                  ? "border-amber bg-amber/10 text-amber"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              {value === "relevant"
                ? `Relevant ${plans.filter((p) => p.relevant.length > 0).length}`
                : null}
              {value === "all" ? `All ${plans.length}` : null}
              {value === "done" ? `Done ${done}` : null}
            </button>
          ))}
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
            {remaining === 0 ? "queue empty" : `${formatMinutes(remaining)} of work left`}
          </span>
          {done > 0 ? (
            <Button size="sm" variant="ghost" onClick={resetCompleted}>
              Clear
            </Button>
          ) : null}
        </div>

        <div className="mt-4 divide-y divide-line border border-line bg-surface">
          {visible.map((plan, index) => {
            const expanded = open === plan.action.id;
            return (
              <article key={plan.action.id} className={plan.completed ? "opacity-60" : undefined}>
                <div className="grid gap-4 p-4 sm:grid-cols-[1.5rem_1fr_5.5rem_7rem] sm:items-start">
                  <button
                    type="button"
                    aria-pressed={plan.completed}
                    aria-label={`Mark ${plan.action.title} complete`}
                    onClick={() => toggleCompleted(plan.action.id)}
                    className={`mt-0.5 flex h-4 w-4 items-center justify-center border transition-colors ${
                      plan.completed
                        ? "border-moss bg-moss"
                        : "border-line-strong hover:border-amber"
                    }`}
                  >
                    {plan.completed ? (
                      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
                        <path
                          d="M1 5l2.5 2.5L9 2"
                          fill="none"
                          stroke="var(--canvas)"
                          strokeWidth="1.6"
                        />
                      </svg>
                    ) : null}
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[9px] tabular-nums text-faint">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpen(expanded ? null : plan.action.id)}
                        className={`text-left text-sm font-medium transition-colors ${
                          plan.completed ? "line-through" : ""
                        } text-ink hover:text-amber`}
                      >
                        {plan.action.title}
                      </button>
                      {plan.relevant.length > 0 ? <Badge tone="amber">Relevant</Badge> : null}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{plan.action.detail}</p>
                    {plan.relevant.length > 0 ? (
                      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
                        {plan.relevant.slice(0, 4).join(" · ")}
                      </p>
                    ) : null}

                    {expanded ? (
                      <div className="mt-4 border-t border-line pt-3">
                        <ol className="space-y-2">
                          {plan.action.steps.map((step, stepIndex) => (
                            <li
                              key={step}
                              className="flex gap-3 text-xs leading-relaxed text-muted"
                            >
                              <span className="font-mono text-[9px] text-amber">
                                {String(stepIndex + 1).padStart(2, "0")}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                        {plan.action.command ? (
                          <pre className="mt-3 overflow-x-auto border border-line bg-surface-2 p-3 font-mono text-[10px] leading-relaxed text-ink">
                            {plan.action.command}
                          </pre>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="font-mono text-[10px] text-muted sm:text-right">
                    {formatMinutes(plan.action.minutes)}
                    <span className="mt-1 block text-[9px] text-faint">
                      {Math.round(plan.action.reduces * 100)}% covered
                    </span>
                  </div>

                  <div>
                    <Meter
                      value={Math.min(100, plan.efficiency * 10)}
                      tone="amber"
                      hint={`${plan.efficiency}/min`}
                    />
                    <p className="mt-1.5 font-mono text-[9px] text-faint">
                      −{plan.riskReduced} pts
                    </p>
                  </div>
                </div>
              </article>
            );
          })}

          {visible.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">
              Nothing here. Either switch the filter or declare more of your stack.
            </p>
          ) : null}
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <Card className="p-5">
          <Kicker>Residual risk</Kicker>
          <div className="mt-4 flex items-center gap-4">
            <Ring value={residual} label="risk" tone="rust" size={104} />
            <div>
              <p className="font-display text-3xl leading-none text-ink">
                {report.risk - residual}
                <span className="text-base text-muted"> pts</span>
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                removed so far
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Baseline {report.risk}, residual {residual}. Reductions compound, so they can never
                overshoot zero.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <Meter value={residual} tone="rust" label="Residual" hint={`${residual}/100`} />
          </div>
        </Card>

        <Card className="p-5">
          <Kicker>Queue</Kicker>
          <dl className="mt-3 space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                Remaining
              </dt>
              <dd className="font-mono text-sm text-ink">{formatMinutes(remaining)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                Completed
              </dt>
              <dd className="font-mono text-sm text-ink">
                {done} / {plans.length}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                Top rate
              </dt>
              <dd className="font-mono text-sm text-amber">
                {plans[0] ? `${plans[0].efficiency}/min` : "—"}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            <ButtonLink href="/profile" size="sm" variant="outline">
              Tune stack
            </ButtonLink>
            <ButtonLink href="/report" size="sm" variant="ghost">
              Export
            </ButtonLink>
          </div>
        </Card>

        <Card className="p-5">
          <Kicker>Coverage</Kicker>
          <Table className="mt-3">
            <thead>
              <tr>
                <Th>Action</Th>
                <Th>Hits</Th>
              </tr>
            </thead>
            <tbody>
              {plans
                .filter((plan) => plan.relevant.length > 0)
                .slice(0, 6)
                .map((plan) => (
                  <tr key={plan.action.id}>
                    <Td>
                      <span className="line-clamp-2 text-xs text-ink">{plan.action.title}</span>
                    </Td>
                    <Td>
                      <span className="font-mono text-[10px] tabular-nums text-amber">
                        {plan.relevant.length}
                      </span>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Card>
      </aside>
    </div>
  );
}
