"use client";

import { DEFAULT_PROFILE } from "@ferroscope/seed";
import { Button, Card, Kicker, PageHeader, ThemeToggle, Toggle } from "@ferroscope/ui";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Container } from "@/components/container";
import { useProfile } from "@/lib/store";

export default function SettingsPage() {
  const profile = useProfile((state) => state.profile);
  const completed = useProfile((state) => state.completed);
  const setFlag = useProfile((state) => state.setFlag);
  const reset = useProfile((state) => state.reset);
  const resetCompleted = useProfile((state) => state.resetCompleted);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => setMounted(true), []);

  const exportProfile = () => {
    const payload = JSON.stringify(
      { profile, completed, exportedAt: new Date().toISOString() },
      null,
      2,
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ferroscope-profile.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <PageHeader
        index="16"
        kicker="Settings"
        title={
          <>
            Local by
            <br />
            <em className="text-amber">construction</em>.
          </>
        }
        lede="There is no account to configure. The only state is the profile and the completion list in this browser's localStorage."
        meta={<span>theme {mounted ? (theme ?? "system") : "…"}</span>}
      />

      <div className="grid gap-4 py-10 lg:grid-cols-2">
        <Card className="p-5">
          <Kicker>Appearance</Kicker>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Ferroscope ships two full palettes, both contrast-checked. The toggle also honours
            <code className="mx-1 border border-line bg-surface-2 px-1 font-mono text-[10px] text-ink">
              prefers-color-scheme
            </code>
            when set to Auto.
          </p>
          <div className="mt-4">
            <ThemeToggle />
          </div>
          <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-faint">
            Motion respects <code className="font-mono">prefers-reduced-motion</code> globally:
            transitions collapse to near-zero and marquees stop.
          </p>
        </Card>

        <Card className="p-5">
          <Kicker>Hygiene flags</Kicker>
          <div className="mt-4 space-y-4">
            <Toggle
              checked={profile.passwordManager}
              onChange={(value) => setFlag("passwordManager", value)}
              label="I use a password manager"
              description="Removes 18% of impact on identity, banking, and supply-chain incidents."
            />
            <Toggle
              checked={profile.twoFactor}
              onChange={(value) => setFlag("twoFactor", value)}
              label="Phishing-resistant 2FA"
              description="Passkey or authenticator app. Removes 22% across six vector classes."
            />
            <Toggle
              checked={profile.autoUpdates}
              onChange={(value) => setFlag("autoUpdates", value)}
              label="Automatic updates"
              description="Removes 25% on runtime, browser, server, network, and CA incidents."
            />
            <Toggle
              checked={profile.bank}
              onChange={(value) => setFlag("bank", value)}
              label="I bank in this region"
              description="Required for regional banking incidents to match."
            />
          </div>
        </Card>

        <Card className="p-5">
          <Kicker>Data</Kicker>
          <dl className="mt-3 space-y-2.5">
            {[
              { label: "Stack items", value: String(profile.stack.length) },
              { label: "Region", value: profile.region },
              { label: "Completed actions", value: String(completed.length) },
              { label: "Storage", value: "localStorage · ferroscope.profile.v1" },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3">
                <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                  {row.label}
                </dt>
                <dd className="text-right font-mono text-[11px] text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            <Button size="sm" variant="outline" onClick={exportProfile}>
              Export JSON
            </Button>
            <Button size="sm" variant="ghost" onClick={resetCompleted}>
              Clear completions
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                reset();
                try {
                  window.localStorage.removeItem("ferroscope.profile.v1");
                } catch {
                  // Storage can be blocked; the in-memory reset still happened.
                }
                setCleared(true);
                setTimeout(() => setCleared(false), 2200);
              }}
            >
              {cleared ? "Cleared" : "Reset everything"}
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <Kicker>Shortcuts</Kicker>
          <dl className="mt-3 space-y-2.5">
            {[
              { keys: "⌘K / Ctrl K", action: "Command palette" },
              { keys: "Esc", action: "Close palette or dialog" },
              { keys: "↑ ↓", action: "Move through results" },
              { keys: "↵", action: "Open highlighted item" },
            ].map((row) => (
              <div key={row.keys} className="flex items-baseline justify-between gap-3">
                <dt className="border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink">
                  {row.keys}
                </dt>
                <dd className="text-right text-xs text-muted">{row.action}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <Kicker>Defaults</Kicker>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            The default profile is a real developer laptop recorded during the original audit that
            produced this dataset: Windows, Edge and Brave, Node and Python, GitHub Actions, Vercel,
            the eMudhra root in certifi, and SBI banking. It is not a worst case and not a guess.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {DEFAULT_PROFILE.stack.map((id) => (
              <span
                key={id}
                className="border border-line px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-faint"
              >
                {id}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </Container>
  );
}
