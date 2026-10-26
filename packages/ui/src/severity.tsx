import type { RiskBand, Severity } from "@ferroscope/core";
import { Badge, type Tone } from "./badge";

const SEVERITY_TONE: Record<Severity, Tone> = {
  critical: "rust",
  high: "amber",
  medium: "outline",
  low: "moss",
};

export function SeverityChip({ severity }: { severity: Severity }) {
  return (
    <Badge tone={SEVERITY_TONE[severity]} dot>
      {severity}
    </Badge>
  );
}

const BAND_TONE: Record<RiskBand, Tone> = {
  fortified: "moss",
  watchful: "amber",
  exposed: "rust",
  critical: "rust",
};

const BAND_LABEL: Record<RiskBand, string> = {
  fortified: "Fortified",
  watchful: "Watchful",
  exposed: "Exposed",
  critical: "Critical",
};

export function BandChip({ band, score }: { band: RiskBand; score?: number }) {
  return (
    <Badge tone={BAND_TONE[band]} dot>
      {BAND_LABEL[band]}
      {score !== undefined ? (
        <span className="tabular-nums text-current/70">{score}/100</span>
      ) : null}
    </Badge>
  );
}

export function Confidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1 w-14 bg-line">
        <span className="block h-full bg-amber" style={{ width: `${pct}%` }} />
      </span>
      <span className="font-mono text-[9px] tabular-nums text-faint">{pct}%</span>
    </span>
  );
}
