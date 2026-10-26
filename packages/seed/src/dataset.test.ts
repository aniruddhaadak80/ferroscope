import { computeExposure } from "@ferroscope/core";
import { describe, expect, it } from "vitest";
import { ACTIONS, ACTIONS_BY_ID } from "./actions";
import { CERTIFICATES } from "./certificates";
import { INCIDENT_COUNT, INCIDENTS } from "./incidents";
import { PLAYBOOKS } from "./playbooks";
import { DEFAULT_PROFILE, SCENARIOS } from "./scenarios";
import { STACK_BY_ID, STACK_CATALOG } from "./stack";

const stack = STACK_CATALOG;
const ids = new Set(STACK_CATALOG.map((item) => item.id));
const actionIds = new Set(ACTIONS.map((action) => action.id));

describe("incident dataset", () => {
  it("contains exactly 27 incidents", () => {
    expect(INCIDENTS).toHaveLength(27);
    expect(INCIDENT_COUNT).toBe(27);
  });

  it("uses unique slugs", () => {
    const slugs = INCIDENTS.map((incident) => incident.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("references only known stack items", () => {
    for (const incident of INCIDENTS) {
      for (const affected of incident.affected) {
        expect(ids.has(affected), `${incident.slug} -> ${affected}`).toBe(true);
      }
    }
  });

  it("references only known remediation actions", () => {
    for (const incident of INCIDENTS) {
      for (const mitigation of incident.mitigations) {
        expect(actionIds.has(mitigation), `${incident.slug} -> ${mitigation}`).toBe(true);
      }
    }
  });

  it("cites at least one source per incident", () => {
    for (const incident of INCIDENTS) {
      expect(incident.sources.length, incident.slug).toBeGreaterThan(0);
      for (const source of incident.sources) {
        expect(source.url.startsWith("https://"), `${incident.slug} -> ${source.url}`).toBe(true);
      }
    }
  });

  it("keeps timelines in chronological order", () => {
    for (const incident of INCIDENTS) {
      const times = incident.timeline.map((entry) => Date.parse(entry.at));
      expect(times, incident.slug).toEqual([...times].sort((a, b) => a - b));
    }
  });

  it("has a non-empty exposure note for every incident", () => {
    for (const incident of INCIDENTS) {
      expect(incident.exposureNote.length, incident.slug).toBeGreaterThan(30);
    }
  });
});

describe("default profile", () => {
  it("matches exactly eMudhra and SBI", () => {
    const report = computeExposure(DEFAULT_PROFILE, INCIDENTS, stack);
    expect(report.exposed.map((match) => match.incident.slug).sort()).toEqual(["emudhra", "sbi"]);
  });

  // The published worked example in README.md, ADR-0005, the changelog, and
  // /method. If a dataset weight changes, this test fails before the prose and
  // the site can disagree with each other.
  it("computes the published 58 / 42 exposure", () => {
    const report = computeExposure(DEFAULT_PROFILE, INCIDENTS, stack);
    expect(report.risk).toBe(58);
    expect(report.score).toBe(42);
    expect(report.band).toBe("exposed");
    expect(
      Object.fromEntries(report.exposed.map((match) => [match.incident.slug, match.contribution])),
    ).toEqual({ emudhra: 33, sbi: 25 });
  });

  it("lands in the exposed band", () => {
    const report = computeExposure(DEFAULT_PROFILE, INCIDENTS, stack);
    expect(report.band).toBe("exposed");
  });

  it("improves when the same profile is hardened", () => {
    const hardened = SCENARIOS.find((scenario) => scenario.id === "hardened");
    expect(hardened).toBeDefined();
    if (!hardened) return;
    const base = computeExposure(DEFAULT_PROFILE, INCIDENTS, stack);
    const fixed = computeExposure(hardened.profile, INCIDENTS, stack);
    expect(fixed.risk).toBeLessThan(base.risk);
  });

  it("gives the server operator a larger blast radius", () => {
    const operator = SCENARIOS.find((scenario) => scenario.id === "server-operator");
    expect(operator).toBeDefined();
    if (!operator) return;
    const base = computeExposure(DEFAULT_PROFILE, INCIDENTS, stack);
    const server = computeExposure(operator.profile, INCIDENTS, stack);
    expect(server.exposed.length).toBeGreaterThan(base.exposed.length);
  });
});

describe("action catalogue", () => {
  it("has unique ids and real steps", () => {
    expect(new Set(ACTIONS.map((action) => action.id)).size).toBe(ACTIONS.length);
    for (const action of ACTIONS) {
      expect(action.steps.length, action.id).toBeGreaterThanOrEqual(3);
      expect(action.minutes, action.id).toBeGreaterThan(0);
      expect(action.reduces, action.id).toBeGreaterThan(0);
      expect(action.reduces, action.id).toBeLessThanOrEqual(1);
    }
  });

  it("maps every action id back to itself", () => {
    for (const action of ACTIONS) {
      expect(ACTIONS_BY_ID.get(action.id)?.id).toBe(action.id);
    }
  });
});

describe("supporting catalogues", () => {
  it("has five certificate records with both compromised roots present", () => {
    expect(CERTIFICATES).toHaveLength(5);
    expect(CERTIFICATES.filter((record) => record.status === "blocked-in-browsers")).toHaveLength(
      2,
    );
  });

  it("has eight playbooks with unique slugs", () => {
    expect(PLAYBOOKS).toHaveLength(8);
    expect(new Set(PLAYBOOKS.map((playbook) => playbook.slug)).size).toBe(PLAYBOOKS.length);
  });

  it("has four scenarios with unique ids", () => {
    expect(SCENARIOS).toHaveLength(4);
    expect(new Set(SCENARIOS.map((scenario) => scenario.id)).size).toBe(SCENARIOS.length);
  });

  it("has a complete stack catalogue", () => {
    expect(STACK_CATALOG.length).toBeGreaterThanOrEqual(50);
    expect(STACK_BY_ID.size).toBe(STACK_CATALOG.length);
  });
});
