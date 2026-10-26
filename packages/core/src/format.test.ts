import { describe, expect, it } from "vitest";
import {
  clamp,
  formatDate,
  formatDateTime,
  formatMinutes,
  formatShortTime,
  hashString,
  pct,
  pluralise,
  slugToTitle,
  vectorLabel,
} from "./format";

describe("hashString", () => {
  it("is stable", () => {
    expect(hashString("emudhra")).toBe(hashString("emudhra"));
  });

  it("separates similar inputs", () => {
    expect(hashString("emudhra")).not.toBe(hashString("emudhraa"));
  });
});

describe("clamp", () => {
  it.each([
    [-1, 0, 10, 0],
    [11, 0, 10, 10],
    [5, 0, 10, 5],
  ])("clamps %i into [%i, %i]", (value, min, max, expected) => {
    expect(clamp(value, min, max)).toBe(expected);
  });
});

describe("pct", () => {
  it("returns 0 for an empty total", () => {
    expect(pct(3, 0)).toBe(0);
  });

  it("rounds to the nearest percent", () => {
    expect(pct(1, 3)).toBe(33);
    expect(pct(2, 3)).toBe(67);
  });
});

describe("formatMinutes", () => {
  it("uses minutes below an hour", () => {
    expect(formatMinutes(3)).toBe("3 min");
    expect(formatMinutes(59)).toBe("59 min");
  });

  it("uses hours and minutes above an hour", () => {
    expect(formatMinutes(60)).toBe("1 hr");
    expect(formatMinutes(90)).toBe("1 hr 30 min");
  });
});

describe("date formatting", () => {
  const iso = "2026-10-21T06:10:00Z";

  it("formats a stable UTC date", () => {
    expect(formatDate(iso)).toBe("21 Oct 2026");
  });

  it("formats a stable UTC date and time", () => {
    expect(formatDateTime(iso)).toBe("21 Oct 2026 · 06:10 UTC");
  });

  it("formats a short UTC time", () => {
    expect(formatShortTime(iso)).toBe("06:10");
  });
});

describe("labels", () => {
  it("maps vectors to human labels", () => {
    expect(vectorLabel("certificate-authority")).toBe("Certificate authority");
    expect(vectorLabel("ai-agent")).toBe("AI agent");
  });

  it("pluralises correctly", () => {
    expect(pluralise(1, "minute")).toBe("minute");
    expect(pluralise(2, "minute")).toBe("minutes");
    expect(pluralise(2, "match", "matches")).toBe("matches");
  });

  it("turns a slug into a title", () => {
    expect(slugToTitle("php2shell")).toBe("Php2shell");
    expect(slugToTitle("certificate-trust")).toBe("Certificate Trust");
  });
});
